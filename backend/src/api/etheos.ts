import axios from 'axios';
import { config } from '../config';

let token: string | null = null;
let renewId: string | null = null;

interface TokenResponse {
  token: string;
  renew_id: string;
}

export async function getToken() {
  const res = await axios.post<TokenResponse>('https://cs-auth.rc-onair.com/cs-auth/v2/tokens', {
    username: config.etheos.username,
    password: config.etheos.password
  });
  token = res.data.token;
  renewId = res.data.renew_id;
  return token;
}

export async function renewToken() {
  if (!token || !renewId) return getToken();
  const res = await axios.post<TokenResponse>(`https://cs-auth.rc-onair.com/cs-auth/v2/tokens/${token}/renew`, {
    renew_id: renewId
  });
  token = res.data.token;
  renewId = res.data.renew_id;
  return token;
}

export async function getRoomConfig(roomNumber: string) {
  if (!token) await getToken();
  const url = `https://cs-api.rc-onair.com/cs-api/v1/${config.etheos.hotelCode}/control/rooms/${roomNumber}`;
  const res = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}

export async function controlDevice(fullUri: string, body: any) {
  if (!token) await getToken();
  // fullUri 形如 "/itprddeve00132/control/rooms/500/lights/t_10_l2/onoff"
  const url = `https://cs-api.rc-onair.com/cs-api/v1${fullUri}`;
  const res = await axios.post(url, body, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
} 