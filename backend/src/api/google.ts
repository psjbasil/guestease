import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { Translate } from '@google-cloud/translate/build/src/v2';

const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();
const translateClient = new Translate();

// Language configurations for speech recognition
export const SUPPORTED_LANGUAGES = {
  'en': 'en-US',
  'zh': 'zh-CN', 
  'vi': 'vi-VN',
  'it': 'it-IT'
} as const;

// Voice configurations for text-to-speech
export const VOICE_CONFIGS = {
  'en': { languageCode: 'en-US', name: 'en-US-Wavenet-F', ssmlGender: 'FEMALE' as const },
  'zh': { languageCode: 'zh-CN', name: 'zh-CN-Wavenet-A', ssmlGender: 'FEMALE' as const },
  'vi': { languageCode: 'vi-VN', name: 'vi-VN-Wavenet-A', ssmlGender: 'FEMALE' as const },
  'it': { languageCode: 'it-IT', name: 'it-IT-Wavenet-A', ssmlGender: 'FEMALE' as const }
} as const;

// Translation language codes mapping
export const TRANSLATION_CODES = {
  'en': 'en',
  'zh': 'zh-CN',
  'vi': 'vi', 
  'it': 'it'
} as const;

// Offline translation mappings for common smart home commands
const OFFLINE_TRANSLATIONS = {
  zh: {
    '打开浴室的灯': 'turn on the bathroom light',
    '打开房间的灯': 'turn on the room light',
    '打开灯': 'turn on the light',
    '关闭浴室的灯': 'turn off the bathroom light',
    '关闭房间的灯': 'turn off the room light',
    '关闭灯': 'turn off the light',
    '激活睡眠模式': 'activate sleep mode',
    '激活放松模式': 'activate relax mode',
    '激活起床模式': 'activate wakeup mode',
    '激活欢迎模式': 'activate welcome mode',
    '开空调': 'turn on air conditioner',
    '关空调': 'turn off air conditioner',
    '打开窗帘': 'open curtain',
    '关闭窗帘': 'close curtain'
  },
  vi: {
    'bật đèn phòng tắm': 'turn on the bathroom light',
    'bật đèn phòng': 'turn on the room light', 
    'bật đèn': 'turn on the light',
    'tắt đèn phòng tắm': 'turn off the bathroom light',
    'tắt đèn phòng': 'turn off the room light',
    'tắt đèn': 'turn off the light',
    'kích hoạt chế độ ngủ': 'activate sleep mode',
    'kích hoạt chế độ thư giãn': 'activate relax mode',
    'kích hoạt chế độ thức dậy': 'activate wakeup mode',
    'kích hoạt chế độ chào mừng': 'activate welcome mode',
    'bật máy lạnh': 'turn on air conditioner',
    'tắt máy lạnh': 'turn off air conditioner',
    'mở rèm cửa': 'open curtain',
    'đóng rèm cửa': 'close curtain'
  },
  it: {
    // 基本灯光控制
    'accendi la luce del bagno': 'turn on the bathroom light',
    'accendi la luce della camera': 'turn on the room light',
    'accendi la luce': 'turn on the light',
    'spegni la luce del bagno': 'turn off the bathroom light',
    'spegni la luce della camera': 'turn off the room light',
    'spegni la luce': 'turn off the light',
    
    // 简化版本
    'accendi bagno': 'turn on the bathroom light',
    'accendi camera': 'turn on the room light',
    'spegni bagno': 'turn off the bathroom light',
    'spegni camera': 'turn off the room light',
    'luce accesa': 'turn on the light',
    'luce spenta': 'turn off the light',
    
    // 场景模式
    'attiva modalità sonno': 'activate sleep mode',
    'attiva modalità relax': 'activate relax mode',
    'attiva modalità risveglio': 'activate wakeup mode',
    'attiva modalità benvenuto': 'activate welcome mode',
    'modalità notte': 'activate sleep mode',
    'modalità riposo': 'activate relax mode',
    
    // 空调控制
    'accendi condizionatore': 'turn on air conditioner',
    'spegni condizionatore': 'turn off air conditioner',
    'aria condizionata': 'air conditioner',
    
    // 窗帘控制
    'apri tenda': 'open curtain',
    'chiudi tenda': 'close curtain',
    'apri tende': 'open curtain',
    'chiudi tende': 'close curtain'
  }
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Transcribe audio with automatic language detection
 */
export async function transcribeAudio(audioBuffer: Buffer, language?: SupportedLanguage) {
  let config: any = {
    encoding: 'WEBM_OPUS',
    enableAutomaticPunctuation: true,
    model: 'latest_short' // Use faster model for better performance
  };

  // Always enable multi-language detection but optimize based on hint
  if (language && SUPPORTED_LANGUAGES[language]) {
    config.languageCode = SUPPORTED_LANGUAGES[language];
    
    // Add other common languages as alternatives for better detection
    const otherLanguages = Object.values(SUPPORTED_LANGUAGES).filter(code => code !== config.languageCode);
    config.alternativeLanguageCodes = otherLanguages; // Include all alternative languages
  } else {
    // Default to English with all other languages as alternatives
    config.languageCode = 'en-US';
    config.alternativeLanguageCodes = ['zh-CN', 'vi-VN', 'it-IT']; 
  }
  
  console.log('[GOOGLE_API] Speech recognition config:', config);

  const [response] = await speechClient.recognize({
    audio: { content: audioBuffer.toString('base64') },
    config
  });

  console.log('[GOOGLE_API] Speech recognition response:', JSON.stringify(response, null, 2));

  const transcript = response.results?.map(r => r.alternatives?.[0].transcript).join(' ') || '';
  const detectedLanguage = response.results?.[0]?.languageCode;
  
  return {
    transcript,
    detectedLanguage
  };
}

/**
 * Try offline translation first, then fallback to Google Translate API
 */
function tryOfflineTranslation(text: string, sourceLanguage: SupportedLanguage): string | null {
  if (sourceLanguage === 'en') {
    return text; // No translation needed
  }

  const normalizedText = text.toLowerCase().trim();
  const translations = OFFLINE_TRANSLATIONS[sourceLanguage as keyof typeof OFFLINE_TRANSLATIONS];
  
  if (translations) {
    // Try exact match first
    if (translations[normalizedText as keyof typeof translations]) {
      return translations[normalizedText as keyof typeof translations];
    }
    
    // Try partial matching for flexibility
    for (const [key, value] of Object.entries(translations)) {
      if (normalizedText.includes(key) || key.includes(normalizedText)) {
        console.log('[GOOGLE_API] Offline translation partial match:', { key, value });
        return value;
      }
    }
  }
  
  return null; // No offline translation found
}

/**
 * Translate text to English using offline mapping first, then Google Translate API
 */
export async function translateToEnglish(text: string, sourceLanguage?: SupportedLanguage): Promise<string> {
  if (!text || text.trim() === '') {
    console.log('[GOOGLE_API] Empty text, skipping translation');
    return text;
  }

  try {
    console.log('[GOOGLE_API] Translating text:', { text, sourceLanguage });
    
    // If source language is English or not specified, return as-is
    if (!sourceLanguage || sourceLanguage === 'en') {
      console.log('[GOOGLE_API] Source is English, no translation needed');
      return text;
    }

    // Try offline translation first
    const offlineResult = tryOfflineTranslation(text, sourceLanguage);
    if (offlineResult) {
      console.log('[GOOGLE_API] Offline translation successful:', { original: text, translated: offlineResult });
      return offlineResult;
    }

    // Fallback to Google Translate API
    console.log('[GOOGLE_API] Attempting Google Translate API...');
    const sourceCode = TRANSLATION_CODES[sourceLanguage];
    const [translation] = await translateClient.translate(text, {
      from: sourceCode,
      to: 'en'
    });

    console.log('[GOOGLE_API] Google Translate successful:', { original: text, translated: translation });
    return translation;
  } catch (error) {
    console.error('[GOOGLE_API] Translation failed, using original text:', error instanceof Error ? error.message : String(error));
    // Fallback to original text if all translation methods fail
    return text;
  }
}

/**
 * Synthesize speech in specified language
 */
export async function synthesizeSpeech(text: string, language: SupportedLanguage = 'en') {
  const voiceConfig = VOICE_CONFIGS[language];
  
  const [response] = await ttsClient.synthesizeSpeech({
    input: { text },
    voice: voiceConfig,
    audioConfig: { audioEncoding: 'MP3' }
  });
  
  return response.audioContent as Buffer;
}

/**
 * Detect language from transcript content and language code
 */
export function detectLanguageFromContent(transcript: string, detectedLanguageCode?: string | null): SupportedLanguage {
  if (!transcript || transcript.trim() === '') {
    return 'en';
  }

  const text = transcript.toLowerCase().trim();
  
  // Check for language-specific keywords
  const englishWords = ['turn', 'open', 'close', 'on', 'off', 'light', 'room', 'bathroom', 'activate', 'the', 'and', 'or'];
  const englishMatches = englishWords.filter(word => text.includes(word)).length;
  
  const italianWords = ['accendi', 'spegni', 'apri', 'chiudi', 'attiva', 'luce', 'camera', 'bagno', 'modalità', 'della', 'del', 'la'];
  const italianMatches = italianWords.filter(word => text.includes(word)).length;
  
  const vietnameseWords = ['bật', 'tắt', 'mở', 'đóng', 'kích hoạt', 'đèn', 'phòng', 'chế độ'];
  const vietnameseMatches = vietnameseWords.filter(word => text.includes(word)).length;
  
  // Check if text contains Chinese characters
  const chineseRegex = /[\u4e00-\u9fff]/;
  const hasChineseChars = chineseRegex.test(text);
  
  console.log('[GOOGLE_API] Content analysis:', {
    transcript: text,
    englishMatches,
    italianMatches,
    vietnameseMatches,
    hasChineseChars,
    detectedLanguageCode
  });
  
  // Priority logic: content analysis overrides API detection
  if (hasChineseChars) {
    return 'zh';
  }
  
  if (italianMatches >= 2) {
    console.log('[GOOGLE_API] Text appears to be Italian based on content analysis');
    return 'it';
  }
  
  if (vietnameseMatches >= 2) {
    console.log('[GOOGLE_API] Text appears to be Vietnamese based on content analysis');
    return 'vi';
  }
  
  // If text has significant English content, override incorrect detection
  if (englishMatches >= 2) {
    console.log('[GOOGLE_API] Text appears to be English based on content analysis');
    return 'en';
  }
  
  // Fallback to API detection
  if (detectedLanguageCode) {
    return detectLanguageFromCode(detectedLanguageCode);
  }
  
  return 'en';
}

/**
 * Detect language from language code (e.g., 'zh-CN' -> 'zh', 'cmn-hans-cn' -> 'zh')
 */
export function detectLanguageFromCode(languageCode: string): SupportedLanguage {
  if (!languageCode) return 'en';
  
  const langCode = languageCode.toLowerCase();
  
  // Handle Chinese variants
  if (langCode.includes('zh') || langCode.includes('cmn') || langCode.includes('hans') || langCode.includes('hant')) {
    return 'zh';
  }
  
  // Handle Vietnamese variants
  if (langCode.includes('vi')) {
    return 'vi';
  }
  
  // Handle Italian variants
  if (langCode.includes('it')) {
    return 'it';
  }
  
  // Handle English variants (default)
  if (langCode.includes('en')) {
    return 'en';
  }
  
  // Extract first part and try to match
  const langPrefix = langCode.split('-')[0];
  return (Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[])
    .find(key => key === langPrefix) || 'en';
} 