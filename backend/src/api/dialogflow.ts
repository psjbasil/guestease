import dialogflow from '@google-cloud/dialogflow';
import { config } from '../config';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from './google';

const sessionClient = new dialogflow.SessionsClient();

/**
 * Detect intent with support for multiple languages
 */
export async function detectIntent(sessionId: string, text: string, language: SupportedLanguage = 'en') {
  const sessionPath = sessionClient.projectAgentSessionPath(
    config.google.projectId!,
    sessionId
  );
  
  const languageCode = SUPPORTED_LANGUAGES[language];
  
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode }
    }
  };
  
  const [response] = await sessionClient.detectIntent(request);
  return response;
} 