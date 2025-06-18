import { detectIntent } from '../api/dialogflow';
import { SupportedLanguage } from '../api/google';

export async function handleIntent(sessionId: string, text: string, language: SupportedLanguage = 'en') {
  const startTime = Date.now();
  console.log('[INTENT_SERVICE] Starting intent detection...');
  
  const result = await detectIntent(sessionId, text, language);
  
  const duration = Date.now() - startTime;
  console.log(`[TIMING] Dialogflow Intent Detection: ${duration}ms`);
  
  return result;
} 