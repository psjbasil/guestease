import { SceneMode, SceneControlRequest, SceneControlResult, DeviceAction, DeviceActionResult, PREDEFINED_SCENES } from '../types/scene';
import { operateDevice } from './deviceService';
import { logger } from '../utils/logger';

class SceneService {
  private scenes: SceneMode[] = PREDEFINED_SCENES;

  /**
   * Get all available scenes
   */
  getAllScenes(): SceneMode[] {
    return this.scenes;
  }

  /**
   * Get scene by ID
   */
  getSceneById(sceneId: string): SceneMode | undefined {
    return this.scenes.find(scene => scene.id === sceneId);
  }

  /**
   * Execute a scene
   */
  async executeScene(request: SceneControlRequest): Promise<SceneControlResult> {
    const { sceneId, roomNumber = '101' } = request;
    
    logger.info(`[SCENE] Executing scene: ${sceneId} for room: ${roomNumber}`);

    const scene = this.getSceneById(sceneId);
    if (!scene) {
      const error = `Scene not found: ${sceneId}`;
      logger.error(`[SCENE] ${error}`);
      return {
        success: false,
        sceneId,
        sceneName: 'Unknown',
        executedActions: [],
        message: error,
        error
      };
    }

    const executedActions: DeviceActionResult[] = [];
    let overallSuccess = true;

    // Execute all device actions in the scene
    for (const deviceAction of scene.devices) {
      try {
        // Add delay if specified
        if (deviceAction.delay) {
          await this.sleep(deviceAction.delay);
        }

        const result = await this.executeDeviceAction(deviceAction, roomNumber);
        executedActions.push(result);
        
        if (!result.success) {
          overallSuccess = false;
        }
      } catch (error) {
        logger.error(`[SCENE] Error executing device action for ${deviceAction.deviceId}:`, error);
        executedActions.push({
          deviceId: deviceAction.deviceId,
          action: deviceAction.action,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        overallSuccess = false;
      }
    }

    const result: SceneControlResult = {
      success: overallSuccess,
      sceneId: scene.id,
      sceneName: scene.name,
      executedActions,
      message: overallSuccess ? 
        `Successfully executed ${scene.name}` : 
        `Partially executed ${scene.name} with some errors`
    };

    logger.info(`[SCENE] Scene execution completed:`, result);
    return result;
  }

  /**
   * Execute a single device action
   */
  private async executeDeviceAction(deviceAction: DeviceAction, roomNumber: string): Promise<DeviceActionResult> {
    try {
      const controlUrl = this.getDeviceControlUrl(deviceAction.deviceId, deviceAction.action);
      if (!controlUrl) {
        return {
          deviceId: deviceAction.deviceId,
          action: deviceAction.action,
          success: false,
          error: `No control URL found for device ${deviceAction.deviceId} action ${deviceAction.action}`
        };
      }

      const body = { value: deviceAction.value };
      await operateDevice(controlUrl, body);

      return {
        deviceId: deviceAction.deviceId,
        action: deviceAction.action,
        success: true
      };
    } catch (error) {
      return {
        deviceId: deviceAction.deviceId,
        action: deviceAction.action,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get device control URL by device ID and action
   */
  private getDeviceControlUrl(deviceId: string, action: string): string | null {
    // Device ID to control URL mapping based on room-config.json
    const deviceMapping: Record<string, Record<string, string>> = {
      't_10_l2': { // bathroom light
        'onoff': '/itprdapep00671/control/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c4/capabilities/switch/status'
      },
      't_11_l1': { // room light
        'onoff': '/itprdapep00671/control/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c3/capabilities/switch/status'
      }
    };

    return deviceMapping[deviceId]?.[action] || null;
  }

  /**
   * Find scene by voice command
   */
  findSceneByVoiceCommand(command: string): SceneMode | undefined {
    const normalizedCommand = command.toLowerCase().trim();
    
    // Direct ID match
    let scene = this.scenes.find(s => s.id.toLowerCase() === normalizedCommand);
    if (scene) return scene;

    // Name match
    scene = this.scenes.find(s => s.name.toLowerCase().includes(normalizedCommand));
    if (scene) return scene;

    // Keyword matching
    if (normalizedCommand.includes('sleep') || normalizedCommand.includes('睡眠')) {
      return this.getSceneById('sleep');
    }
    if (normalizedCommand.includes('relax') || normalizedCommand.includes('放松') || normalizedCommand.includes('休息')) {
      return this.getSceneById('relax');
    }
    if (normalizedCommand.includes('wake') || normalizedCommand.includes('wakeup') || normalizedCommand.includes('唤醒') || normalizedCommand.includes('起床')) {
      return this.getSceneById('wakeup');
    }
    if (normalizedCommand.includes('welcome') || normalizedCommand.includes('欢迎') || normalizedCommand.includes('迎宾')) {
      return this.getSceneById('welcome');
    }
    if (normalizedCommand.includes('away') || normalizedCommand.includes('离开') || normalizedCommand.includes('外出')) {
      return this.getSceneById('away');
    }

    return undefined;
  }

  /**
   * Sleep utility function
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const sceneService = new SceneService(); 