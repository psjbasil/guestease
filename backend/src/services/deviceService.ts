import { getRoomConfig, controlDevice } from '../api/etheos';

export async function getDevices(roomNumber: string) {
  return getRoomConfig(roomNumber);
}

export async function operateDevice(roomNumber: string, controlUrl: string, body: any) {
  return controlDevice(roomNumber, controlUrl, body);
} 