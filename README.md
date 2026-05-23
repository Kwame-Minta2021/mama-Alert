# MamaAlert Care Dashboard 💜💚

MamaAlert is a smart maternal and neonatal emergency monitoring system designed for low-resource hospitals, CHPS compounds, and rural clinics in Ghana. 

The web application functions as the central intelligence, telemetry tracking, and coordinator command center. It aggregates real-time signals from bedside ESP32 nodes (monitoring heart rate, SpO₂ saturation, and temperature) to identify critical thresholds, log emergency incidents, and audit nurse checkups.

---

## ⚡ Core Features

1. **Real-time Telemetry Grid:** Auto-synced moving vitals gauges and rolling physiological trends built with Recharts.
2. **Clinical Alarm Engine:** Audible and visual clinical buzzer alarms synthesized using the browser's Web Audio API (sine for warning, sawtooth for emergencies).
3. **Nurse Response Audit:** Logs response speeds and chronicles checkup logs to ensure accountability.
4. **Hardware Node Allocator:** Dynamically registers and maps ESP32 nodes to patients' bed numbers.
5. **District Reports:** Aggregated analytics graphs representing incident distributions and printable supervisor briefs.
6. **Built-in ESP32 Simulator:** A collapsible floating control deck enabling judges or developers to mock normal, warning, and emergency payloads.
7. **Offline-Demo Resilience:** Automatic fallback to a mock database driver if Firebase configurations are unconfigured, ensuring the app loads and operates perfectly during presentations.

---

## 🛠️ Tech Stack

- **Frontend Framework:** React + Vite
- **Styling UI:** Tailwind CSS (Plus Jakarta Sans font palette)
- **Visual Trends:** Recharts
- **Backend:** Firebase (Authentication & Realtime Database)
- **Icons:** Lucide React

---

## 🚀 Setup & Local Execution

### 1. Clone & Enter Directory
Open a terminal in the folder:
```bash
cd mamaAlert
```

### 2. Configure Environment Keys
Duplicate the `.env.example` file and rename it to `.env`:
```bash
cp .env.example .env
```
Fill in your Firebase credentials in `.env`:
```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
```
*(Note: If left with default placeholders, the application automatically launches in **Local Demo Mode**, which utilizes a local mock storage driver to let judges run the entire application offline.)*

### 3. Install Packages & Run
```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 IEEE WIE Judge Demo Accounts

For convenient evaluation, use these quick-access accounts (Password: `demo1234`):
- **Midwife / Nurse:** `nurse@mamaalert.org`
- **Clinic Administrator:** `admin@mamaalert.org`
- **District Health Supervisor:** `supervisor@mamaalert.org`
- **System Admin:** `sysadmin@mamaalert.org`

---

## 📡 ESP32 Telemetry JSON Payload Format

Bedside ESP32 units with MAX30102 sensors and battery systems publish telemetry directly to the Firebase Realtime Database path `/liveReadings/{deviceId}`.

### Payload Structure
```json
{
  "heartRate": 82,
  "spo2": 98,
  "temperature": 36.8,
  "batteryLevel": 88,
  "status": "Normal",
  "alertLevel": "Normal",
  "timestamp": 1787396781000
}
```

### ESP32 C++ Code Segment Example
```cpp
#include <WiFi.h>
#include <FirebaseESP32.h>

#define FIREBASE_HOST "your_project_id-default-rtdb.firebaseio.com"
#define FIREBASE_AUTH "your_database_secret_or_token"
#define DEVICE_ID "ESP32_01"

FirebaseData firebaseData;

void sendTelemetry(int hr, int spo2, float temp, int battery) {
  FirebaseJson json;
  
  // Calculate status thresholds at the patient edge
  String status = "Normal";
  if (spo2 < 90 || hr < 50 || hr > 130) {
    status = "Emergency";
  } else if (spo2 < 95 || hr < 60 || hr > 110) {
    status = "Warning";
  }

  json.set("heartRate", hr);
  json.set("spo2", spo2);
  json.set("temperature", temp);
  json.set("batteryLevel", battery);
  json.set("status", status);
  json.set("alertLevel", status);
  json.set("timestamp", Firebase.getCurrentTime() * 1000); // ms epoch

  if (Firebase.setJSON(firebaseData, "/liveReadings/" + String(DEVICE_ID), json)) {
    Serial.println("Telemetry synced successfully.");
  } else {
    Serial.println("Sync failed: " + firebaseData.errorReason());
  }
}
```
