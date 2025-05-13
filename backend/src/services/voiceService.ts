import { transcribeAudio, synthesizeSpeech } from '../api/google';

export async function recognizeVoice(audioBuffer: Buffer) {
  return transcribeAudio(audioBuffer);
}

export async function speakText(text: string) {
  return synthesizeSpeech(text);
} 