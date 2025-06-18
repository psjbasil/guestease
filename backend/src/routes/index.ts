import express, { Request, Response } from 'express';
import multer from 'multer';
import { speakText } from '../services/voiceService';
import { handleIntent } from '../services/intentService';
import { getDevices, operateDevice } from '../services/deviceService';
import { processVoiceInput } from '../services/voiceAssistantService';
import { sceneService } from '../services/sceneService';
import { SupportedLanguage } from '../api/google';

const router = express.Router();
const upload = multer();

router.post('/voice', upload.single('audio'), async (req: Request, res: Response) => {
  console.log('[ROUTE] Received /voice request');
  
  const audio = req.file?.buffer;
  if (!audio) {
    console.error('[ROUTE] No audio uploaded');
    res.status(400).json({ error: 'No audio uploaded' });
    return;
  }

  try {
    const sessionId = req.body.sessionId || 'test-session';
    const preferredLanguage = req.body.language as SupportedLanguage || undefined;
    
    console.log('[ROUTE] Processing voice with preferred language:', preferredLanguage);
    
    const result = await processVoiceInput(audio, sessionId, preferredLanguage);
    
    console.log('[ROUTE] Voice processing completed successfully');
    console.log(`[ROUTE] Total processing time: ${result.timing?.totalDuration}ms`);
    
    res.json(result);
  } catch (error) {
    console.error('[ROUTE] Voice processing failed:', error);
    res.status(500).json({ 
      error: 'Voice processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/intent', async (req, res) => {
  const { sessionId, text } = req.body;
  const result = await handleIntent(sessionId, text);
  res.json(result);
});

router.get('/room/:roomNumber/devices', async (req, res) => {
  const { roomNumber } = req.params;
  const devices = await getDevices(roomNumber);
  res.json(devices);
});

router.post('/room/:roomNumber/device', async (req, res) => {
  const { roomNumber } = req.params;
  const { controlUrl, body } = req.body;
  const result = await operateDevice(controlUrl, body);
  res.json(result);
});

router.post('/speak', async (req, res) => {
  const { text } = req.body;
  const audio = await speakText(text);
  res.set('Content-Type', 'audio/mp3');
  res.send(audio);
});

// Scene control endpoints
router.get('/scenes', (req, res) => {
  try {
    const scenes = sceneService.getAllScenes();
    res.json({
      success: true,
      scenes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get scenes'
    });
  }
});

// Temporarily removed due to TypeScript issues
// router.get('/scenes/:sceneId', (req, res) => { ... });

router.post('/scenes/:sceneId/execute', async (req, res) => {
  try {
    const { sceneId } = req.params;
    const { roomNumber } = req.body;

    const result = await sceneService.executeScene({
      sceneId,
      roomNumber: roomNumber || '101'
    });

    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to execute scene'
    });
  }
});

export default router; 