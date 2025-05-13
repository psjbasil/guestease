import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

export async function transcribeAudio(audioBuffer: Buffer) {
  const [response] = await speechClient.recognize({
    audio: { content: audioBuffer.toString('base64') },
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'zh-CN'
    }
  });
  return response.results?.map(r => r.alternatives?.[0].transcript).join(' ') || '';
}

export async function synthesizeSpeech(text: string) {
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: { languageCode: 'zh-CN', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  });
  return response.audioContent as Buffer;
} 