import { recognizeVoice, speakText, VoiceRecognitionResult } from './voiceService';
import { handleIntent } from './intentService';
import { mapDeviceControl, operateDevice } from './deviceService';
import { sceneService } from './sceneService';
import { SupportedLanguage } from '../api/google';
import { 
  getLocalizedResponse, 
  getLocalizedLocation, 
  getLocalizedDevice 
} from './languageService';

export interface TimingInfo {
  stepName: string;
  duration: number; // milliseconds
  startTime: number;
  endTime: number;
}

export interface VoiceProcessingResult {
  transcript: string;
  translatedText: string;
  detectedLanguage?: string;
  language: SupportedLanguage;
  intent: string | null;
  deviceResult: any;
  replyText: string;
  audio: string; // base64 encoded audio
  timing: {
    steps: TimingInfo[];
    totalDuration: number;
    startTime: number;
    endTime: number;
  };
}

/**
 * Process voice input through the complete pipeline with multi-language support:
 * 1. Speech recognition with language detection
 * 2. Translation to English for intent detection
 * 3. Intent detection in English
 * 4. Device control (if applicable)
 * 5. Text-to-speech synthesis in original language
 */
export async function processVoiceInput(
  audioBuffer: Buffer, 
  sessionId: string = 'test-session',
  preferredLanguage?: SupportedLanguage
): Promise<VoiceProcessingResult> {
  const overallStartTime = Date.now();
  const timingSteps: TimingInfo[] = [];
  
  console.log('[VOICE_ASSISTANT] Starting multi-language voice processing pipeline...');
  
  // 1. Speech recognition with language detection
  console.log('[VOICE_ASSISTANT] Step 1: Speech recognition with language detection...');
  const speechRecognitionStart = Date.now();
  const voiceResult: VoiceRecognitionResult = await recognizeVoice(audioBuffer, preferredLanguage);
  const speechRecognitionEnd = Date.now();
  const speechRecognitionDuration = speechRecognitionEnd - speechRecognitionStart;
  
  timingSteps.push({
    stepName: 'Speech Recognition & Translation',
    duration: speechRecognitionDuration,
    startTime: speechRecognitionStart,
    endTime: speechRecognitionEnd
  });
  
  const { transcript, translatedText, detectedLanguage, language } = voiceResult;
  
  console.log('[VOICE_ASSISTANT] Speech recognition result:', {
    transcript,
    translatedText,
    detectedLanguage,
    language
  });
  console.log(`[TIMING] Speech Recognition & Translation: ${speechRecognitionDuration}ms`);
  
  // Log detailed sub-step timing if available
  if (voiceResult.timing) {
    console.log(`[TIMING]   - Audio Transcription: ${voiceResult.timing.transcription}ms`);
    console.log(`[TIMING]   - Translation/Language Detection: ${voiceResult.timing.translation}ms`);
  }

  // 检查是否有有效的转录文本
  if (!translatedText || translatedText.trim() === '') {
    console.log('[VOICE_ASSISTANT] No valid transcript or translation, returning error response');
    
    const ttsStart = Date.now();
    const errorText = getLocalizedResponse('error', 'en');
    const ttsAudioBuffer = await speakText(errorText, 'en');
    const ttsEnd = Date.now();
    const ttsDuration = ttsEnd - ttsStart;
    
    timingSteps.push({
      stepName: 'Text-to-Speech (Error)',
      duration: ttsDuration,
      startTime: ttsStart,
      endTime: ttsEnd
    });
    
    const audioBase64 = ttsAudioBuffer.toString('base64');
    const overallEndTime = Date.now();
    const totalDuration = overallEndTime - overallStartTime;
    
    console.log(`[TIMING] Text-to-Speech (Error): ${ttsDuration}ms`);
    console.log(`[TIMING] Total Processing Time: ${totalDuration}ms`);

    return {
      transcript,
      translatedText,
      detectedLanguage,
      language,
      intent: null,
      deviceResult: null,
      replyText: errorText,
      audio: audioBase64,
      timing: {
        steps: timingSteps,
        totalDuration,
        startTime: overallStartTime,
        endTime: overallEndTime
      }
    };
  }

  // 2. Intent detection using translated English text
  console.log('[VOICE_ASSISTANT] Step 2: Intent detection using English text:', translatedText);
  const intentDetectionStart = Date.now();
  const intentResponse = await handleIntent(sessionId, translatedText, 'en'); // 总是使用英语进行意图检测
  const intentDetectionEnd = Date.now();
  const intentDetectionDuration = intentDetectionEnd - intentDetectionStart;
  
  timingSteps.push({
    stepName: 'Intent Detection',
    duration: intentDetectionDuration,
    startTime: intentDetectionStart,
    endTime: intentDetectionEnd
  });
  
  const queryResult = intentResponse.queryResult || {};
  const intentName = queryResult.intent?.displayName || null;
  console.log('[VOICE_ASSISTANT] Intent detection result:', JSON.stringify(queryResult));
  console.log(`[TIMING] Intent Detection: ${intentDetectionDuration}ms`);

  // 3. Device/Scene control logic with English responses
  let deviceResult = null;
  let replyText = getLocalizedResponse('actionCompleted', 'en');
  let deviceControlDuration = 0;
  
  if (intentName === 'ControlScene') {
    console.log('[VOICE_ASSISTANT] Step 3: Processing scene control...');
    const deviceControlStart = Date.now();
    
    const params = queryResult.parameters?.fields || {};
    const sceneCommand = params.scene?.stringValue || translatedText;
    
    console.log('[VOICE_ASSISTANT] Scene command:', sceneCommand);
    
    // Find scene by voice command (using English translated text)
    const scene = sceneService.findSceneByVoiceCommand(sceneCommand);
    
    if (scene) {
      console.log('[VOICE_ASSISTANT] Found scene:', scene.id);
      
      try {
        deviceResult = await sceneService.executeScene({ 
          sceneId: scene.id, 
          roomNumber: '101' 
        });
        console.log('[VOICE_ASSISTANT] Scene execution result:', deviceResult);
        
        if (deviceResult.success) {
          replyText = getLocalizedResponse('sceneActivateSuccess', 'en', { 
            scene: scene.name 
          });
        } else {
          replyText = getLocalizedResponse('sceneActivateFailed', 'en', { 
            scene: scene.name 
          });
        }
      } catch (error) {
        console.error('[VOICE_ASSISTANT] Scene execution failed:', error);
        replyText = getLocalizedResponse('error', 'en');
      }
    } else {
      console.log('[VOICE_ASSISTANT] No matching scene found for command');
      replyText = getLocalizedResponse('sceneNotFound', 'en');
    }
    
    const deviceControlEnd = Date.now();
    deviceControlDuration = deviceControlEnd - deviceControlStart;
    
    timingSteps.push({
      stepName: 'Scene Control',
      duration: deviceControlDuration,
      startTime: deviceControlStart,
      endTime: deviceControlEnd
    });
    
  } else if (intentName === 'ControlLight' || intentName === 'ControlAirConditioner' || intentName === 'ControlCurtain') {
    console.log('[VOICE_ASSISTANT] Step 3: Processing device control...');
    const deviceControlStart = Date.now();
    
    const params = queryResult.parameters?.fields || {};
    const location = params.location?.stringValue || '';
    const device = params.device?.stringValue || '';
    const operation = params.operation?.stringValue || '';
    
    console.log('[VOICE_ASSISTANT] Control params:', { location, device, operation });
    
    // Map voice command to device control configuration (using English parameters)
    const controlConfig = mapDeviceControl({ location, device, operation });
    
    if (controlConfig) {
      console.log('[VOICE_ASSISTANT] Device control mapping:', controlConfig);
      
      // Generate English response based on device and operation
      const localizedLocation = getLocalizedLocation(location, 'en');
      const localizedDevice = getLocalizedDevice(device, 'en');
      
      if (device === 'light') {
        if (operation === 'on') {
          replyText = getLocalizedResponse('lightOn', 'en', { 
            location: localizedLocation 
          });
        } else if (operation === 'off') {
          replyText = getLocalizedResponse('lightOff', 'en', { 
            location: localizedLocation 
          });
        } else {
          replyText = getLocalizedResponse('deviceControlSuccess', 'en', { 
            device: localizedDevice 
          });
        }
      } else {
        replyText = getLocalizedResponse('deviceControlSuccess', 'en', { 
          device: localizedDevice 
        });
      }
      
      try {
        deviceResult = await operateDevice(controlConfig.controlUri, { value: controlConfig.value });
        console.log('[VOICE_ASSISTANT] Device control result:', deviceResult);
      } catch (error) {
        console.error('[VOICE_ASSISTANT] Device control failed:', error);
        replyText = getLocalizedResponse('deviceControlFailed', 'en', { 
          device: localizedDevice 
        });
      }
    } else {
      console.log('[VOICE_ASSISTANT] No matching device control configuration found');
      replyText = getLocalizedResponse('deviceNotFound', 'en');
    }
    
    const deviceControlEnd = Date.now();
    deviceControlDuration = deviceControlEnd - deviceControlStart;
    
    timingSteps.push({
      stepName: 'Device Control',
      duration: deviceControlDuration,
      startTime: deviceControlStart,
      endTime: deviceControlEnd
    });
    
  } else {
    console.log('[VOICE_ASSISTANT] No specific intent matched, using general response');
    replyText = getLocalizedResponse('actionCompleted', 'en');
    
    // Add zero-duration step for consistency
    timingSteps.push({
      stepName: 'No Device Control',
      duration: 0,
      startTime: Date.now(),
      endTime: Date.now()
    });
  }
  
  if (deviceControlDuration > 0) {
    console.log(`[TIMING] Device/Scene Control: ${deviceControlDuration}ms`);
  }

  // 4. Text-to-speech synthesis in English (always)
  console.log('[VOICE_ASSISTANT] Step 4: Text-to-speech synthesis in language: en');
  console.log('[VOICE_ASSISTANT] Synthesizing reply:', replyText);
  const ttsStart = Date.now();
  const ttsAudioBuffer = await speakText(replyText, 'en');
  const ttsEnd = Date.now();
  const ttsDuration = ttsEnd - ttsStart;
  
  timingSteps.push({
    stepName: 'Text-to-Speech',
    duration: ttsDuration,
    startTime: ttsStart,
    endTime: ttsEnd
  });
  
  const audioBase64 = ttsAudioBuffer.toString('base64');
  
  const overallEndTime = Date.now();
  const totalDuration = overallEndTime - overallStartTime;
  
  console.log(`[TIMING] Text-to-Speech: ${ttsDuration}ms`);
  console.log(`[TIMING] Total Processing Time: ${totalDuration}ms`);
  
  // Print detailed timing summary
  console.log('[TIMING] === VOICE PROCESSING TIMING SUMMARY ===');
  timingSteps.forEach((step, index) => {
    console.log(`[TIMING] ${index + 1}. ${step.stepName}: ${step.duration}ms`);
  });
  console.log(`[TIMING] Total: ${totalDuration}ms`);
  console.log('[TIMING] ==========================================');

  const result: VoiceProcessingResult = {
    transcript,
    translatedText,
    detectedLanguage,
    language,
    intent: intentName,
    deviceResult,
    replyText,
    audio: audioBase64,
    timing: {
      steps: timingSteps,
      totalDuration,
      startTime: overallStartTime,
      endTime: overallEndTime
    }
  };

  console.log('[VOICE_ASSISTANT] Multi-language voice processing pipeline completed');
  return result;
} 