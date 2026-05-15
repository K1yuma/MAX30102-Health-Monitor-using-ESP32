# Real-Time IoT Health Monitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: ESP32](https://img.shields.io/badge/Platform-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Framework: React](https://img.shields.io/badge/Framework-React-61dafb.svg)](https://reactjs.org/)

A full-stack IoT solution for real-time physiological monitoring. This system integrates hardware-level sensor fusion, concurrent firmware architecture, and a cloud-synced web dashboard to provide instantaneous health insights.

---

## 📸 Project Visuals

### System Architecture
![Architecture Diagram](https://github.com/user-attachments/assets/26ca43ba-bd16-45eb-93bb-14637bfe7f19)

*High-level data flow showing the integration between ESP32, MQTT, Firebase, and the React Frontend.*

### Hardware Prototype
![Hardware Setup](https://github.com/user-attachments/assets/40bd9e22-2b62-48be-9167-8e030ad53911)

*The physical assembly featuring the ESP32 development board and the MAX30102 heart rate/SpO2 sensor.*

### Web Dashboard & Data Analytics

**1. Real-Time Monitoring Interface**

![Dashboard web react](https://github.com/user-attachments/assets/96563865-a24b-42ec-887d-fa163188cab3)

*The primary interface displaying live heart rate and SpO2 telemetry received via MQTT.*

**2. Interactive Data Visualization**

![Dashboard biểu đồ](https://github.com/user-attachments/assets/25e477a8-93f3-4a3c-9498-ffa53bcaf792)

*Real-time line charts for tracking health metric fluctuations over time.*

**3. Statistical Summarization**

![Dữ liệu tóm tắt](https://github.com/user-attachments/assets/335265f4-8109-415b-8ed1-5202b6d137a0)

*Automated reporting of key performance indicators, including average, maximum, and minimum values for the session.*

**4. Cloud Logging & Data Export (List View)**

![Lịch sử dạng danh sách](https://github.com/user-attachments/assets/f700db6f-d3c7-43e5-af25-2c5dbf9c82d4)

*Integration with Firebase Firestore for persistent storage, featuring a list-view history and CSV export functionality.*

**5. Historical Trend Analysis (Graph View)**

![Lịch sử dạng đồ thị](https://github.com/user-attachments/assets/bc6e09f8-7242-49a2-a06b-64f5ee76e1f4)

*Retrieving and visualizing archived data from Firestore to identify long-term health trends.*

**6. Intelligent Threshold Alerts**

![Web hiển thị cảnh báo](https://github.com/user-attachments/assets/1ec6d640-04ee-4ab0-a95b-e42c303a0dbf)

*Dynamic UI feedback and visual warnings triggered when physiological metrics exceed safe user-defined ranges.*

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
