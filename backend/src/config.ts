import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  google: {
    projectId: process.env.GOOGLE_PROJECT_ID,
    credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
  },
  etheos: {
    username: process.env.ETHEOS_USERNAME,
    password: process.env.ETHEOS_PASSWORD,
    hotelCode: process.env.ETHEOS_HOTEL_CODE
  },
  mqtt: {
    host: process.env.MQTT_HOST,
    port: Number(process.env.MQTT_PORT) || 8883
  }
}; 