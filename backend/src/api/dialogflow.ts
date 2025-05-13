import dialogflow from '@google-cloud/dialogflow';
import { config } from '../config';

const sessionClient = new dialogflow.SessionsClient();

export async function detectIntent(sessionId: string, text: string) {
  const sessionPath = sessionClient.projectAgentSessionPath(
    config.google.projectId!,
    sessionId
  );
  const request = {
    session: sessionPath,
    queryInput: {
      text: { text, languageCode: 'zh-CN' }
    }
  };
  const [response] = await sessionClient.detectIntent(request);
  return response.queryResult;
} 