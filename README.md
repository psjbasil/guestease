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

sequenceDiagram
    participant User
    participant Browser
    participant Backend
    participant GoogleSTT as Google STT
    participant Dialogflow
    participant ETHEOSAPI as ETHEOS API
    participant MQTTBroker as MQTT broker
    participant ETHEOSCONTROLLER as ETHEOS Controller
    participant GoogleTTS as Google TTS

    User->>Browser: Press "Speak" and give voice command
    Browser->>Browser: Record audio (Web Audio API)
    Browser->>Backend: Send recorded audio

    Backend->>GoogleSTT: Send audio for transcription
    GoogleSTT-->>Backend: Return transcribed text

    Backend->>Dialogflow: Send text to detect intent
    Dialogflow-->>Backend: Return intent and parameters

    Backend->>Backend: Process intent into corresponding action 
    Backend-->>MQTTBroker: Subscribe to device topic (e.g., room/101/device/ac)

    Backend->>ETHEOSAPI: Control room device via API call (room_id, device, action)
    ETHEOSAPI->>MQTTBroker: Control room device via API call 
    
    MQTTBroker->>ETHEOSCONTROLLER: Control room device via API call
    ETHEOSCONTROLLER-->>MQTTBroker: Push device status (e.g., "AC turned on")
    MQTTBroker-->>Backend: Push device status (e.g., "AC turned on")

    Backend->>GoogleTTS: Send result text for synthesis
    GoogleTTS-->>Backend: Return audio

    Backend-->>Browser: Stream audio file
    Browser->>User: Play voice response