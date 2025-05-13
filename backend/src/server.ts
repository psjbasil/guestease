import app from './app';
import { config } from './config';
import { getToken } from './api/etheos';
import { connectMqtt } from './mqtt/mqttClient';

async function start() {
  const token = await getToken();
  connectMqtt(process.env.ETHEOS_USERNAME!, token);

  app.listen(config.port, () => {
    console.log(`Server running at http://localhost:${config.port}`);
  });
}

start(); 