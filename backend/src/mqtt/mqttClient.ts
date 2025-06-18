import mqtt from 'mqtt';
import { config } from '../config';
import { logger } from '../utils/logger';

let client: mqtt.MqttClient;

export function connectMqtt(username: string, password: string) {
  client = mqtt.connect(`mqtts://${config.mqtt.host}`, {
    username,
    password
  });
  client.on('connect', () => logger.info('MQTT connected'));
  client.on('error', err => logger.error('MQTT error', err));
}

export function subscribe(topic: string, cb: (topic: string, message: Buffer) => void) {
  client.subscribe(topic, err => {
    if (err) logger.error('MQTT subscribe error', err);
  });
  client.on('message', cb);
}

export function disconnectMqtt() {
  if (client) client.end();
} 