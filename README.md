# Hệ Thống Giám Sát Sức Khỏe IoT Thời Gian Thực

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform: ESP32](https://img.shields.io/badge/Platform-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Framework: React](https://img.shields.io/badge/Framework-React-61dafb.svg)](https://reactjs.org/)

Dự án IoT dành cho việc theo dõi các chỉ số sinh lý theo thời gian thực. Hệ thống tích hợp xử lý tín hiệu cảm biến ở mức phần cứng, firmware song hành và bảng điều khiển web đồng bộ hóa đám mây để cung cấp thông tin sức khỏe tức thời.

---

## 📸 Hình Ảnh Dự Án

### Sơ Đồ Kiến Trúc Hệ Thống
![Kiến trúc hệ thống](https://github.com/user-attachments/assets/26ca43ba-bd16-45eb-93bb-14637bfe7f19)

*Luồng dữ liệu cấp cao thể hiện sự tích hợp giữa ESP32, MQTT, Firebase và React Frontend.*

### Nguyên Mẫu Phần Cứng
![Lắp đặt phần cứng](https://github.com/user-attachments/assets/40bd9e22-2b62-48be-9167-8e030ad53911)

*Hệ thống vật lý bao gồm board mạch ESP32 và cảm biến nhịp tim/SpO2 MAX30102.*

### Giao Diện Web & Phân Tích Dữ Liệu

**1. Giao Diện Theo Dõi Thời Gian Thực**

![Dashboard web react](https://github.com/user-attachments/assets/96563865-a24b-42ec-887d-fa163188cab3)

*Giao diện chính hiển thị dữ liệu nhịp tim và SpO2 trực tiếp nhận qua giao thức MQTT.*

**2. Trực Quan Hóa Dữ Liệu Tương Tác**

![Dashboard biểu đồ](https://github.com/user-attachments/assets/25e477a8-93f3-4a3c-9498-ffa53bcaf792)

*Biểu đồ đường thời gian thực để theo dõi sự biến động của các chỉ số sức khỏe.*

**3. Tóm Tắt Thống Kê**

![Dữ liệu tóm tắt](https://github.com/user-attachments/assets/335265f4-8109-415b-8ed1-5202b6d137a0)

*Báo cáo tự động các chỉ số quan trọng, bao gồm giá trị trung bình, lớn nhất và nhỏ nhất trong phiên đo.*

**4. Lưu Trữ Đám Mây & Xuất Dữ Liệu (Dạng Danh Sách)**

![Lịch sử dạng danh sách](https://github.com/user-attachments/assets/f700db6f-d3c7-43e5-af25-2c5dbf9c82d4)

*Tích hợp với Firebase Firestore để lưu trữ lâu dài, hỗ trợ xem lịch sử dạng danh sách và xuất file CSV.*

**5. Phân Tích Xu Hướng Lịch Sử (Dạng Đồ Thị)**

![Lịch sử dạng đồ thị](https://github.com/user-attachments/assets/bc6e09f8-7242-49a2-a06b-64f5ee76e1f4)

*Truy xuất và trực quan hóa dữ liệu lưu trữ từ Firestore để nhận diện các xu hướng sức khỏe dài hạn.*

**6. Cảnh Báo Ngưỡng Thông Minh**

![Web hiển thị cảnh báo](https://github.com/user-attachments/assets/1ec6d640-04ee-4ab0-a95b-e42c303a0dbf)

*Phản hồi UI động và cảnh báo trực quan được kích hoạt khi các chỉ số vượt quá ngưỡng an toàn đã thiết lập.*

---

## 🚀 Đặc Điểm Kỹ Thuật Nổi Bật

### ⚡ Firmware (ESP32)
- **Thực Thi Đa Nhân (Multi-Core):** Sử dụng **FreeRTOS** để gán các tác vụ quan trọng vào các nhân cụ thể (Nhân 0 cho Mạng/MQTT, Nhân 1 cho Sensor I/O), đảm bảo thời gian duy trì dữ liệu liên tục 100%.
- **Xử Lý Tín Hiệu Cảm Biến:** Triển khai thuật toán DFRobot cho cảm biến **MAX30102**, tùy chỉnh lấy mẫu trung bình (sample averaging) và độ rộng xung để đạt được tín hiệu ổn định ở mức y tế.
- **Kết Nối Linh Hoạt:** Tích hợp **WiFiManager** cho cấu hình WiFi qua captive portal và logic tự động kết nối lại MQTT/WiFi.

### 🌐 Web & Cloud
- **Pub/Sub Thời Gian Thực:** Sử dụng **MQTT** (HiveMQ) để truyền tải dữ liệu với độ trễ cực thấp (dưới 100ms) giữa phần cứng và frontend.
- **Lưu Trữ Bất Đồng Bộ:** Đồng bộ hóa dữ liệu với **Firebase Firestore** để phân tích xu hướng mà không làm ảnh hưởng đến hiệu suất giao diện (UI thread).
- **Trải Nghiệm Người Dùng (UX) Động:** Dashboard React đáp ứng tốt, tích hợp các đồng hồ đo dạng SVG, biểu đồ Chart.js thời gian thực và hệ thống cảnh báo bằng âm thanh.

---

## 🛠 Công Nghệ Sử Dụng

- **Firmware:** C++ (Arduino/ESP-IDF), FreeRTOS
- **Frontend:** React.js, CSS Modules, MQTT.js
- **Backend/Cloud:** Firebase (Firestore), HiveMQ MQTT Broker
- **Giao Thức:** MQTT, I2C, WebSockets

---

## 📂 Cấu Trúc Thư Mục

```text
├── esp32/                # Mã nguồn Firmware C++
├── web react/            # Ứng dụng frontend React
└── README.md             # Tài liệu hướng dẫn dự án
```

---

## 🔧 Cài Đặt & Thiết Lập

### 1. Cấu Hình Phần Cứng
- **MCU:** ESP32 Development Board
- **Cảm biến:** MAX30102 qua giao tiếp I2C
- **Sơ đồ chân:** SDA (GPIO 21), SCL (GPIO 22)

### 2. Triển Khai Firmware
1. Cài đặt Arduino IDE với hỗ trợ board ESP32.
2. Thư viện yêu cầu: `WiFiManager`, `PubSubClient`, `DFRobot_MAX30102`.
3. Nạp code `esp32/esp32_heart.ino`.
4. Kết nối vào điểm truy cập `ESP32-HealthMonitor` để cấu hình WiFi cho thiết bị.

### 3. Triển Khai Frontend
1. Truy cập thư mục `/web react`.
2. Cài đặt các package: `npm install`.
3. Tạo file `.env` với thông tin Firebase của bạn (tham khảo `.env.example`).
4. Chạy ứng dụng: `npm start`.

---

## 📄 Giấy Phép
Phát hành dưới Giấy phép MIT. Xem `LICENSE` để biết thêm chi tiết.
