# GustEase

# Hotel Voice Assistant

A browser-based hotel voice assistant that allows guests to control in-room smart devices (e.g., lights, AC) via voice commands. This MVP uses **React** for the frontend and **Node + TS** for the backend, integrating **Google Cloud services** for voice recognition and synthesis, **Dialogflow** for intent detection, and **MQTT + ETHEOS API** for device control.

---

## 🗂 Project Structure


---

## 🔧 Features

- 🎙 **Voice Command Recording (React + Web Audio API)**
- 🧠 **Speech Recognition (Google Speech-to-Text)**
- 🤖 **Intent Detection (Dialogflow CX or ES)**
- 📡 **Smart Device Control (ETHEOS API + MQTT)**
- 🗣 **Voice Response (Google Text-to-Speech)**

---

## 🔌 Setup Instructions

### 1. Prerequisites
- Node.js >= 18
- Google Cloud project with enabled APIs:
  - Speech-to-Text
  - Text-to-Speech
  - Dialogflow
- Access to:
  - MQTT broker (e.g., Mosquitto)
  - ETHEOS Smart Device Control API
- `GOOGLE_APPLICATION_CREDENTIALS` set to a service account JSON path
---