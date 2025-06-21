import axios from 'axios';
import { config } from '../config';

let token: string | null = null;
let renewId: string | null = null;
let tokenPromise: Promise<string | null> | null = null;

const etheosApiClient = axios.create({
  baseURL: 'https://cs-api.rc-onair.com/cs-api/v1',
});

interface TokenResponse {
  token: string;
  renew_id: string;
}

async function fetchToken(): Promise<string> {
  const res = await axios.post<TokenResponse>('https://cs-auth.rc-onair.com/cs-auth/v2/tokens', {
    username: config.etheos.username,
    password: config.etheos.password
  });
  token = res.data.token;
  renewId = res.data.renew_id;
  return token;
}

async function refreshToken(): Promise<string> {
  if (!token || !renewId) {
    return fetchToken();
  }
  try {
    const res = await axios.post<TokenResponse>(`https://cs-auth.rc-onair.com/cs-auth/v2/tokens/${token}/renew`, {
      renew_id: renewId
    });
    token = res.data.token;
    renewId = res.data.renew_id;
    return token;
  } catch (error) {
    // If renew fails (e.g., renew_id also expired), get a fresh token
    return fetchToken();
  }
}

const getValidToken = async (): Promise<string | null> => {
  if (tokenPromise) {
    return tokenPromise;
  }
  if (!token) {
    tokenPromise = refreshToken();
    const newToken = await tokenPromise;
    tokenPromise = null;
    return newToken;
  }
  return token;
};

etheosApiClient.interceptors.request.use(async (req: any) => {
  const currentToken = await getValidToken();
  if (currentToken) {
    req.headers.Authorization = `Bearer ${currentToken}`;
  }
  return req;
});

etheosApiClient.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Check if it's a 401 error and we haven't retried yet
    if (error.response?.status === 401 && originalRequest && !originalRequest.headers['_retry']) {
      originalRequest.headers['_retry'] = true; // Mark that we've retried

      try {
        const newToken = await refreshToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return etheosApiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export async function getToken(): Promise<string> {
  return await getValidToken() || '';
}

export async function renewToken(): Promise<string> {
  return await refreshToken();
}

export async function getRoomConfig(roomNumber: string) {
  const url = `/${config.etheos.hotelCode}/control/rooms/${roomNumber}`;
  const res = await etheosApiClient.get(url);
  return res.data;
}

export async function controlDevice(fullUri: string, body: any) {
  const url = `${fullUri}`;
  const res = await etheosApiClient.post(url, body);
  return res.data;
} 