import { detectIntent } from '../api/dialogflow';

export async function handleIntent(sessionId: string, text: string) {
  const result = await detectIntent(sessionId, text);
  return result;
} 