import { transcribeAudio, synthesizeSpeech, SupportedLanguage, detectLanguageFromCode, translateToEnglish, detectLanguageFromContent } from '../api/google';

export interface VoiceRecognitionResult {
  transcript: string;
  translatedText: string;
  detectedLanguage?: string;
  language: SupportedLanguage;
  timing?: {
    transcription: number;
    translation: number;
    total: number;
  };
}

export async function recognizeVoice(audioBuffer: Buffer, language?: SupportedLanguage): Promise<VoiceRecognitionResult> {
  console.log('[VOICE_SERVICE] Starting speech recognition...');
  const startTime = Date.now();
  
  // Step 1: Audio transcription
  const transcriptionStart = Date.now();
  const result = await transcribeAudio(audioBuffer, language);
  const transcriptionEnd = Date.now();
  const transcriptionDuration = transcriptionEnd - transcriptionStart;
  
  console.log(`[TIMING] Audio Transcription: ${transcriptionDuration}ms`);
  
  if (!result.transcript || result.transcript.trim() === '') {
    console.log('[VOICE_SERVICE] No transcript detected');
    const totalDuration = Date.now() - startTime;
    return {
      transcript: '',
      translatedText: '',
      detectedLanguage: result.detectedLanguage || undefined,
      language: language || 'en',
      timing: {
        transcription: transcriptionDuration,
        translation: 0,
        total: totalDuration
      }
    };
  }

  // Step 2: Language detection and translation
  const translationStart = Date.now();
  
  // 快速内容检测，优先判断是否为英文
  const detectedLang = detectLanguageFromContent(result.transcript, result.detectedLanguage || undefined) || (language || 'en');
  
  // 如果检测到是英文，跳过翻译步骤
  let translatedText = result.transcript;
  let translationDuration = 0;
  
  if (detectedLang !== 'en') {
    console.log('[VOICE_SERVICE] Translating to English for intent detection...');
    translatedText = await translateToEnglish(result.transcript, detectedLang);
    translationDuration = Date.now() - translationStart;
    console.log(`[TIMING] Text Translation: ${translationDuration}ms`);
  } else {
    console.log('[VOICE_SERVICE] Text is English, skipping translation');
    translationDuration = Date.now() - translationStart; // Very short duration for language detection
    console.log(`[TIMING] Language Detection (no translation): ${translationDuration}ms`);
  }
  
  const totalDuration = Date.now() - startTime;
  
  return {
    transcript: result.transcript,
    translatedText,
    detectedLanguage: result.detectedLanguage || undefined,
    language: detectedLang,
    timing: {
      transcription: transcriptionDuration,
      translation: translationDuration,
      total: totalDuration
    }
  };
}

export async function speakText(text: string, language: SupportedLanguage = 'en') {
  const startTime = Date.now();
  const audioBuffer = await synthesizeSpeech(text, language);
  const duration = Date.now() - startTime;
  console.log(`[TIMING] Speech Synthesis: ${duration}ms`);
  return audioBuffer;
} 