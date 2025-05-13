import express from 'express';
import multer from 'multer';
import { recognizeVoice, speakText } from '../services/voiceService';
import { handleIntent } from '../services/intentService';
import { getDevices, operateDevice } from '../services/deviceService';
import { Request, Response } from 'express';

const router = express.Router();
const upload = multer();

router.post('/voice', upload.single('audio'), async (req: Request, res: Response) => {
  const audio = req.file?.buffer;
  if (!audio) {
    res.status(400).json({ error: 'No audio uploaded' });
    return;
  }
  const text = await recognizeVoice(audio);
  res.json({ text });
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
  const result = await operateDevice(roomNumber, controlUrl, body);
  res.json(result);
});

router.post('/speak', async (req, res) => {
  const { text } = req.body;
  const audio = await speakText(text);
  res.set('Content-Type', 'audio/mp3');
  res.send(audio);
});

export default router; 