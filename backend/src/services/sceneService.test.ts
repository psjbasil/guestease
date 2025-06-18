import { sceneService } from './sceneService';
import { PREDEFINED_SCENES } from '../types/scene';

describe('SceneService', () => {
  describe('getAllScenes', () => {
    it('should return all predefined scenes', () => {
      const scenes = sceneService.getAllScenes();
      expect(scenes).toHaveLength(PREDEFINED_SCENES.length);
      expect(scenes[0]).toHaveProperty('id');
      expect(scenes[0]).toHaveProperty('name');
      expect(scenes[0]).toHaveProperty('description');
      expect(scenes[0]).toHaveProperty('devices');
    });
  });

  describe('getSceneById', () => {
    it('should return scene by valid ID', () => {
      const scene = sceneService.getSceneById('sleep');
      expect(scene).toBeDefined();
      expect(scene?.id).toBe('sleep');
      expect(scene?.name).toBe('Sleep Mode');
    });

    it('should return undefined for invalid ID', () => {
      const scene = sceneService.getSceneById('invalid-scene');
      expect(scene).toBeUndefined();
    });
  });

  describe('findSceneByVoiceCommand', () => {
    it('should find scene by direct ID match', () => {
      const scene = sceneService.findSceneByVoiceCommand('sleep');
      expect(scene?.id).toBe('sleep');
    });

    it('should find scene by name match', () => {
      const scene = sceneService.findSceneByVoiceCommand('Sleep Mode');
      expect(scene?.id).toBe('sleep');
    });

    it('should find scene by English keywords', () => {
      expect(sceneService.findSceneByVoiceCommand('sleep mode')?.id).toBe('sleep');
      expect(sceneService.findSceneByVoiceCommand('relax mode')?.id).toBe('relax');
      expect(sceneService.findSceneByVoiceCommand('wake up')?.id).toBe('wakeup');
      expect(sceneService.findSceneByVoiceCommand('welcome mode')?.id).toBe('welcome');
      expect(sceneService.findSceneByVoiceCommand('away mode')?.id).toBe('away');
    });

    it('should find scene by Chinese keywords', () => {
      expect(sceneService.findSceneByVoiceCommand('睡眠模式')?.id).toBe('sleep');
      expect(sceneService.findSceneByVoiceCommand('放松模式')?.id).toBe('relax');
      expect(sceneService.findSceneByVoiceCommand('唤醒模式')?.id).toBe('wakeup');
      expect(sceneService.findSceneByVoiceCommand('欢迎模式')?.id).toBe('welcome');
      expect(sceneService.findSceneByVoiceCommand('离开模式')?.id).toBe('away');
    });

    it('should return undefined for unknown command', () => {
      const scene = sceneService.findSceneByVoiceCommand('unknown command');
      expect(scene).toBeUndefined();
    });
  });

  describe('executeScene', () => {
    it('should return error for non-existent scene', async () => {
      const result = await sceneService.executeScene({
        sceneId: 'non-existent',
        roomNumber: '101'
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Scene not found');
    });

    it('should execute sleep scene successfully', async () => {
      const result = await sceneService.executeScene({
        sceneId: 'sleep',
        roomNumber: '101'
      });

      expect(result.sceneId).toBe('sleep');
      expect(result.sceneName).toBe('Sleep Mode');
      expect(result.executedActions).toHaveLength(2); // 2 lights to turn off
      
      // Check that both lights are turned off
      const roomLightAction = result.executedActions.find(a => a.deviceId === 't_11_l1');
      const bathroomLightAction = result.executedActions.find(a => a.deviceId === 't_10_l2');
      
      expect(roomLightAction).toBeDefined();
      expect(bathroomLightAction).toBeDefined();
    }, 10000);

    it('should execute wakeup scene successfully', async () => {
      const result = await sceneService.executeScene({
        sceneId: 'wakeup',
        roomNumber: '101'
      });

      expect(result.sceneId).toBe('wakeup');
      expect(result.sceneName).toBe('Wake-up Mode');
      expect(result.executedActions).toHaveLength(2); // 2 lights to turn on
    }, 10000);
  });
}); 