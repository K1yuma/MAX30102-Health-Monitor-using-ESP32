# IoT Health Monitoring System (ESP32 + MAX30102 + React)

This project is a real-time health monitoring system that measures heart rate and SpO2 using an ESP32 and MAX30102 sensor, sending data via MQTT to a React dashboard and storing it in Firebase.

## Project Structure

- `esp32/`: Arduino source code for the ESP32.
- `web react/`: React frontend dashboard.
- `docs/`: Project documentation and presentations.

## Features

- **Real-time Monitoring:** View heart rate and SpO2 data as it happens.
- **Data Logging:** Sensor data is automatically saved to Firebase Firestore.
- **MQTT Integration:** Uses MQTT for fast, low-latency communication between the sensor and the dashboard.
- **Health Alerts:** Visual and audible alarms for abnormal health readings.
- **Historical Data:** View and download historical sensor readings.

## Setup Instructions

### Hardware
- ESP32 Development Board
- MAX30102 Heart Rate & SpO2 Sensor
- I2C Connections: SDA -> GPIO 21, SCL -> GPIO 22

### ESP32 Setup
1. Open `esp32/esp32_heart.ino` in Arduino IDE.
2. Install required libraries: `WiFiManager`, `PubSubClient`, `DFRobot_MAX30102`.
3. Upload to your ESP32.
4. Connect to the "ESP32-HealthMonitor" WiFi AP to configure your network settings.

### Web Dashboard Setup
1. Navigate to `web react/`.
2. Install dependencies: `npm install`.
3. Create a `.env` file based on the Firebase configuration (see below).
4. Start the app: `npm start`.

### Firebase Configuration
Create a `.env` file in the `web react/` directory with the following variables:
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Credits
Developed by Nhom 4.
