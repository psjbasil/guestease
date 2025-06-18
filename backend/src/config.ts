import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  google: {
    projectId: process.env.DIALOGFLOW_PROJECT_ID,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },
  etheos: {
    username: process.env.ETHEOS_USERNAME,
    password: process.env.ETHEOS_PASSWORD,
    hotelCode: process.env.ETHEOS_HOTEL_CODE,
    roomNumber: process.env.ETHEOS_ROOM_NUMBER
  },
  mqtt: {
    host: process.env.MQTT_HOST,
  }
}; 