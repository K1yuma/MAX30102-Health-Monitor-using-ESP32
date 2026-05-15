# Real-Time IoT Health Monitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: ESP32](https://img.shields.io/badge/Platform-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Framework: React](https://img.shields.io/badge/Framework-React-61dafb.svg)](https://reactjs.org/)

A full-stack IoT solution for real-time physiological monitoring. This system integrates hardware-level sensor fusion, concurrent firmware architecture, and a cloud-synced web dashboard to provide instantaneous health insights.

---

## 📸 Project Visuals

| System Architecture | Hardware Prototype | Web Dashboard |
| :---: | :---: | :---: |
| ![Architecture Diagram](https://github.com/user-attachments/assets/0f440f38-c01d-4efe-82bb-5696d8c49a74) | ![Hardware Setup](https://via.placeholder.com/400x250?text=Hardware+Setup+Photo) | ![Dashboard Screenshot](https://via.placeholder.com/400x250?text=React+Dashboard+Screenshot) |
| *High-level data flow* | *ESP32 & MAX30102 integration* | *Real-time analytics UI* |

---

## 🚀 Technical Highlights

### ⚡ Firmware Engineering (ESP32)
- **Multi-Core Execution:** Utilizes **FreeRTOS** to pin critical tasks to specific cores (Core 0 for Networking/MQTT, Core 1 for blocking Sensor I/O), ensuring 100% telemetry uptime.
- **Sensor Fusion:** Implements the DFRobot algorithm for the **MAX30102** pulse oximeter, featuring customized sample averaging and pulse width configuration for clinical-grade signal stability.
- **Resilient Connectivity:** Integrated **WiFiManager** for captive portal configuration and automatic reconnection logic for MQTT/WiFi.

### 🌐 Web & Cloud Architecture
- **Real-time Pub/Sub:** Leverages **MQTT** (HiveMQ) for ultra-low latency data transmission (sub-100ms) between the hardware and frontend.
- **Cloud Persistence:** Asynchronous data synchronization with **Firebase Firestore** for historical trend analysis without blocking the UI thread.
- **Dynamic UX:** Responsive React dashboard featuring SVG-based gauges, real-time Chart.js telemetry, and audible threshold-based alarm systems.

---

## 🛠 Tech Stack

- **Firmware:** C++ (Arduino/ESP-IDF), FreeRTOS
- **Frontend:** React.js, CSS Modules, MQTT.js
- **Backend/Cloud:** Firebase (Firestore), HiveMQ MQTT Broker
- **Protocols:** MQTT, I2C, WebSockets

---

## 📂 Repository Structure

```text
├── esp32/                # C++ Firmware source code
├── web react/            # React frontend application
└── README.md             # Project documentation
```

---

## 🔧 Installation & Setup

### 1. Hardware Configuration
- **MCU:** ESP32 Development Board
- **Sensor:** MAX30102 via I2C
- **Wiring:** SDA (GPIO 21), SCL (GPIO 22)

### 2. Firmware Deployment
1. Install Arduino IDE with ESP32 board support.
2. Libraries: `WiFiManager`, `PubSubClient`, `DFRobot_MAX30102`.
3. Upload `esp32/esp32_heart.ino`.
4. Connect to `ESP32-HealthMonitor` AP to set your local WiFi credentials.

### 3. Frontend Deployment
1. Navigate to `/web react`.
2. Install dependencies: `npm install`.
3. Create a `.env` file with your Firebase credentials:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_key
   REACT_APP_FIREBASE_PROJECT_ID=your_id
   # ... (see .env.example for full list)
   ```
4. Start development server: `npm start`.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

## 👥 Credits
**Project Team:** Nhom 4
