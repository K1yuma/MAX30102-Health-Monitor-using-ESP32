#include <Arduino.h>
#include <Wire.h>
#include <WiFiManager.h>
#include <PubSubClient.h>
#include <DFRobot_MAX30102.h> // NEW: MAX30102 Library

// --- MAX30102 Pulse Oximeter ---
DFRobot_MAX30102 particleSensor; // NEW: Sensor instance

#define REPORTING_PERIOD_MS 5000 // IMPORTANT: Set to 5000ms to account for the ~4s blocking read
#define SENSOR_STABILIZATION_MS 5000 // Stabilization is now the first 5-second read cycle
#define MIN_VALID_HR 60
#define MAX_VALID_HR 200
#define MIN_VALID_SPO2 90

// --- MQTT Broker ---
const char* mqtt_server = "broker.hivemq.com";
WiFiClient wifiClient;
PubSubClient client(wifiClient);

// --- LED indicator ---
#define LED 2

// --- FreeRTOS Tasks ---
TaskHandle_t mqttTaskHandle;
TaskHandle_t sensorTaskHandle;

// --- Sensor control ---
volatile bool sensorEnabled = false;
volatile bool sensorEverActive = false;

// --- Sensor state variables ---
uint32_t tsLastReport = 0;
uint32_t sensorStartTime = 0;
volatile bool sensorActive = false;
uint32_t noSignalTimeout = 5000;

// --- Data storage ---
// New variables for storing results from the blocking function
int32_t SPO2_raw = 0;
int8_t SPO2Valid = 0;
int32_t heartRate_raw = 0;
int8_t heartRateValid = 0;

// Using float for filtered/published values (Casting the int results)
float currentHeartRate = 0;
float currentSpO2 = 0;
bool validReading = false;

// --- Finger detection ---
bool fingerDetected = false;
uint32_t lastValidDataTime = 0;
uint32_t fingerRemovedTimeout = 12000; // Increased for stability buffer
bool autoDisabledDueToNoFinger = false;

// =========================================================================
// Forward Declarations
// =========================================================================
bool validateData(float heartRate, float spO2, bool hrValid, bool spo2Valid);
void autoDisableSensor();

// =========================================================================
// MQTT Task (Runs on Core 0 - Network Core)
// =========================================================================
void mqttTask(void *parameter) {
    Serial.print("MQTT Task running on core: ");
    Serial.println(xPortGetCoreID());

    uint32_t lastReconnectAttempt = 0;
    const uint32_t reconnectInterval = 5000;

    while (true) {
        // Non-blocking MQTT connection management
        if (!client.connected()) {
            uint32_t now = millis();
            if (now - lastReconnectAttempt > reconnectInterval) {
                lastReconnectAttempt = now;
                Serial.println("Attempting MQTT reconnection...");

                String clientId = "ESP32-HealthMonitor-";
                clientId += String(random(0xffff), HEX);

                if (client.connect(clientId.c_str())) {
                    Serial.println("MQTT reconnected!");
                    // Subscribe only to sensor control
                    client.subscribe("healthMonitor/sensorControl");
                }
            }
        }

        // Process MQTT messages
        client.loop();
        vTaskDelay(50 / portTICK_PERIOD_MS);
    }
}

// =========================================================================
// Improved Finger Detection
// =========================================================================
bool checkFingerPresence() {
    // This is primarily for printing status and setting fingerDetected flag
    if (validReading && (millis() - lastValidDataTime < fingerRemovedTimeout)) {
        return true;
    }
    return false;
}

// =========================================================================
// Auto-disable sensor when finger is removed
// =========================================================================
void autoDisableSensor() {
    // This logic runs only when the main task determines a timeout has occurred.
    if (sensorEnabled) {
        sensorEnabled = false;
        sensorActive = false;
        validReading = false;
        fingerDetected = false;
        autoDisabledDueToNoFinger = true;
        digitalWrite(LED, LOW);

        Serial.println("🛑 Auto-disabled: Finger removed. Send 'on' to restart.");

        // Publish auto-disable status
        if (client.connected()) {
            client.publish("healthMonitor/status", "auto_disabled_no_finger");
        }
    }
}

// =========================================================================
// Sensor Task (Runs on Core 1 - Sensor Core) - REVISED CRITICAL FIX
// =========================================================================
void sensorTask(void *parameter) {
    Serial.print("Sensor Task running on core: ");
    Serial.println(xPortGetCoreID());

    uint32_t lastStatusTime = 0;
    uint32_t ledOffTime = 0;
    uint32_t lastAutoDisableCheck = 0;

    while (true) {
        uint32_t currentTime = millis();

        // 1. Check Sensor Enabled State
        if (!sensorEnabled) {
            if (currentTime - lastStatusTime > 10000) {
                lastStatusTime = currentTime;
                if (autoDisabledDueToNoFinger) {
                    Serial.println("🔴 Auto-disabled: Finger was removed. Send 'on' to restart.");
                } else {
                    Serial.println("🔴 Sensor OFF - Send 'on' to healthMonitor/sensorControl to start");
                }
            }
            if (digitalRead(LED) == HIGH) {
                digitalWrite(LED, LOW);
            }
            vTaskDelay(100 / portTICK_PERIOD_MS);
            continue;
        }

        // 2. Initial Setup/State Check when enabled
        if (!sensorEverActive) {
            sensorEverActive = true;
            sensorActive = true;
            sensorStartTime = currentTime;
            digitalWrite(LED, HIGH); // Turn LED on while attempts are made
            Serial.println("💓 Sensor activated - Starting first 5s measurement cycle.");
        }

        // 3. Auto-Disable Check (Periodic check to prevent being stuck in the loop)
        if (currentTime - lastAutoDisableCheck > 1000) {
            lastAutoDisableCheck = currentTime;

            // 🌟 FINAL FIX: Only check for auto-disable IF we have ever had a valid read.
            if (lastValidDataTime > 0) { 
                bool currentFingerState = checkFingerPresence();
                
                if (currentFingerState != fingerDetected) {
                    fingerDetected = currentFingerState;
                    if (fingerDetected) {
                        Serial.println("👆 Finger detected.");
                        autoDisabledDueToNoFinger = false;
                    } else {
                        Serial.println("❌ Finger removed. Last valid read: " + String((millis() - lastValidDataTime) / 1000.0) + "s ago.");
                    }
                }

                // Disable if too much time passed since last valid read (now protected by lastValidDataTime > 0)
                if (sensorEnabled && sensorEverActive &&
                    (currentTime - lastValidDataTime > fingerRemovedTimeout)) {
                    autoDisableSensor();
                }
            } else {
                // Since lastValidDataTime is 0, we still haven't found a finger.
                // Use a different, much longer timeout for initial finding.
                if (currentTime - sensorStartTime > (fingerRemovedTimeout * 2)) {
                    Serial.println("🛑 Auto-disabled: Initial acquisition failed after long timeout.");
                    autoDisableSensor();
                }
            }
        }

        // 4. Block and Measure Logic
        if (currentTime - tsLastReport >= REPORTING_PERIOD_MS) {
            tsLastReport = currentTime; 
            
            Serial.println("... Measuring (approx. 4s block)...");

            // CRITICAL: This function BLOCKS Core 1 for ~4 seconds
            particleSensor.heartrateAndOxygenSaturation(
                /*SPO2=*/&SPO2_raw,
                /*SPO2Valid=*/&SPO2Valid,
                /*heartRate=*/&heartRate_raw,
                /*heartRateValid=*/&heartRateValid
            );

            currentTime = millis(); // Update time after blocking call

            currentHeartRate = (float)heartRate_raw;
            currentSpO2 = (float)SPO2_raw;

            // Check validity using both algorithm flags and user constraints
            if (validateData(currentHeartRate, currentSpO2, heartRateValid, SPO2Valid)) {
                validReading = true;
                lastValidDataTime = currentTime; // 👈 This is the KEY to enabling auto-disable

                Serial.print("✅ FINAL - HR: ");
                Serial.print(currentHeartRate);
                Serial.print("bpm / SpO2: ");
                Serial.print(currentSpO2);
                Serial.println("%");

                // Publish heart rate and SpO2
                if (client.connected() && sensorEnabled) {
                    char hrString[8];
                    sprintf(hrString, "%.1f", currentHeartRate);
                    char spo2String[8];
                    sprintf(spo2String, "%.1f", currentSpO2);

                    client.publish("healthMonitor/heartRate", hrString);
                    client.publish("healthMonitor/spO2", spo2String);

                    Serial.println("📤 Data published to MQTT");
                }

                // Quick LED blink for data transmission
                digitalWrite(LED, LOW);
                ledOffTime = currentTime + 50;
            } else {
                validReading = false;
                Serial.println("⚠️ Invalid reading - algorithm failed or out of range. Check finger position.");
            }

            // Handle LED turn-off for data blink
            if (ledOffTime > 0 && millis() > ledOffTime) {
                if (fingerDetected && sensorEnabled) {
                    digitalWrite(LED, HIGH);
                }
                ledOffTime = 0;
            }
        }

        vTaskDelay(10 / portTICK_PERIOD_MS); // Small delay to yield to other tasks/interrupts
    }
}

// =========================================================================
// Simplified MQTT Callback - Only sensor on/off control
// =========================================================================
void callback(char* topic, byte* message, unsigned int length) {
    Serial.print("Message on topic: ");
    Serial.print(topic);
    Serial.print(" -> ");

    String messageTemp;
    for (int i = 0; i < length; i++) {
        messageTemp += (char)message[i];
    }
    Serial.println(messageTemp);

    // Only handle sensor control
    if (String(topic) == "healthMonitor/sensorControl") {
        if (messageTemp == "on" || messageTemp == "start") {
            sensorEnabled = true;
            validReading = false;
            sensorActive = false;
            autoDisabledDueToNoFinger = false;
            lastValidDataTime = 0; // 👈 RESET on start
            tsLastReport = 0; 
            digitalWrite(LED, LOW);

            sensorEverActive = false;

            Serial.println("✅ Sensor ON - place finger on sensor");

            // Publish status
            if (client.connected()) {
                client.publish("healthMonitor/status", "manual_enabled");
            }
        } else if (messageTemp == "off" || messageTemp == "stop") {
            sensorEnabled = false;
            sensorActive = false;
            validReading = false;
            fingerDetected = false;
            autoDisabledDueToNoFinger = false;
            lastValidDataTime = 0; // 👈 RESET on manual stop
            tsLastReport = 0; 
            digitalWrite(LED, LOW);

            sensorEverActive = false;

            Serial.println("🛑 Manual OFF - all data streaming stopped");

            // Publish status
            if (client.connected()) {
                client.publish("healthMonitor/status", "manual_disabled");
            }
        }
    }
}

// =========================================================================
// Sensor Management Functions
// =========================================================================

bool validateData(float heartRate, float spO2, bool hrValid, bool spo2Valid) {
    if (!sensorEnabled) return false;
    // Critical: Check algorithm's internal validity flag
    if (!hrValid || !spo2Valid) return false;

    // Check user-defined range constraints
    if (heartRate < MIN_VALID_HR || heartRate > MAX_VALID_HR) return false;
    if (spO2 < MIN_VALID_SPO2 || spO2 > 100) return false;

    // Additional checks (though likely covered by validity flags)
    if (heartRate == 0 || spO2 == 0 || isnan(heartRate) || isnan(spO2)) return false;
    return true;
}

// =========================================================================
// Setup Function
// =========================================================================
void setup() {
    Serial.begin(115200);
    pinMode(LED, OUTPUT);
    digitalWrite(LED, LOW);

    Serial.println();
    Serial.println("ESP32 MAX30102 MQTT Monitor with DFRobot Algorithm");
    Serial.println("Publishing: heartRate, spO2, status");
    Serial.println("Subscribing: sensorControl (on/off)");
    Serial.println("================================");

    // Initialize WiFi
    WiFiManager wm;
    Serial.println("Connecting to WiFi...");

    if (!wm.autoConnect("ESP32-HealthMonitor", "11232004")) {
        Serial.println("WiFi failed - restarting");
        ESP.restart();
    } else {
        Serial.println("WiFi connected!");
        // Blink LED to show WiFi connected
        for(int i = 0; i < 3; i++) {
            digitalWrite(LED, HIGH);
            delay(200);
            digitalWrite(LED, LOW);
            delay(200);
        }
    }

    // Initialize MAX30102 sensor
    Serial.println("Initializing MAX30102...");
    Wire.begin(21, 22);
    Wire.setClock(400000); // 400kHz I2C for speed

    // Use the new library instance and check
    if (!particleSensor.begin()) {
        Serial.println("MAX30102 failed - restarting");
        delay(5000);
        ESP.restart();
    } else {
        Serial.println("MAX30102 ready!");
    }

    // CRITICAL CONFIGURATION: These settings produce the required 25Hz effective data rate
    uint8_t ledBrightness = 50;
    uint8_t sampleAverage = SAMPLEAVG_4;
    uint8_t ledMode = MODE_MULTILED;
    uint8_t sampleRate = SAMPLERATE_100;
    uint8_t pulseWidth = PULSEWIDTH_411;
    uint8_t adcRange = ADCRANGE_16384;

    particleSensor.sensorConfiguration(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);

    // Initialize MQTT
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);

    // Create FreeRTOS tasks
    xTaskCreatePinnedToCore(
        mqttTask, 		 // Task function
        "MQTT_Task", 	 // Task name
        10000, 			 // Stack size
        NULL, 			 // Parameters
        1, 				 // Priority
        &mqttTaskHandle, // Task handle
        0 				 // Core 0
    );

    xTaskCreatePinnedToCore(
        sensorTask, 	 // Task function
        "Sensor_Task", 	 // Task name
        10000, 			 // Stack size
        NULL, 			 // Parameters
        2, 				 // Higher priority
        &sensorTaskHandle,// Task handle
        1 				 // Core 1
    );

    Serial.println("System ready!");
    Serial.println("🔴 Sensor is OFF by default");
    Serial.println("📝 Behavior:");
    Serial.println("    - Sensor task BLOCKS Core 1 for ~4 seconds per read cycle.");
    Serial.println("    - Auto-disable is BYPASSED until the FIRST VALID READING is obtained.");
    Serial.println("    - After the first valid read, auto-disable triggers after " + String(fingerRemovedTimeout/1000) + " seconds of NO valid data.");
    Serial.println("    - If no valid data is found within " + String((fingerRemovedTimeout*2)/1000) + " seconds of activation, it performs a hard shutdown.");
    Serial.println("================================");
}

// =========================================================================
// Main Loop (minimal)
// =========================================================================
void loop() {
    // Main loop is idle - tasks handle everything
    delay(1000);
}