export interface SceneMode {
  id: string;
  name: string;
  description: string;
  devices: DeviceAction[];
}

export interface DeviceAction {
  deviceId: string;
  action: string;
  value: any;
  delay?: number; // milliseconds delay before executing this action
}

export interface SceneControlRequest {
  sceneId: string;
  roomNumber?: string;
}

export interface SceneControlResult {
  success: boolean;
  sceneId: string;
  sceneName: string;
  executedActions: DeviceActionResult[];
  message: string;
  error?: string;
}

export interface DeviceActionResult {
  deviceId: string;
  action: string;
  success: boolean;
  error?: string;
}

export const PREDEFINED_SCENES: SceneMode[] = [
  {
    id: 'sleep',
    name: 'Sleep Mode',
    description: 'Turn off all lights, close curtains, set air conditioning to sleep-friendly temperature, and activate night security mode.',
    devices: [
      { deviceId: 't_11_l1', action: 'onoff', value: false }, // room light off
      { deviceId: 't_10_l2', action: 'onoff', value: false }, // bathroom light off
    ]
  },
  {
    id: 'relax',
    name: 'Relax Mode', 
    description: 'Dim ambient lighting, play soft background music, adjust air conditioning to a comfortable setting, and partially draw curtains.',
    devices: [
      { deviceId: 't_11_l1', action: 'onoff', value: true }, // room light on
      { deviceId: 't_10_l2', action: 'onoff', value: false }, // bathroom light off
    ]
  },
  {
    id: 'wakeup',
    name: 'Wake-up Mode',
    description: 'Gradually increase lighting, open curtains, adjust air conditioning to morning comfort level, and play gentle wake-up music or sound.',
    devices: [
      { deviceId: 't_11_l1', action: 'onoff', value: true }, // room light on
      { deviceId: 't_10_l2', action: 'onoff', value: true }, // bathroom light on
    ]
  },
  {
    id: 'work',
    name: 'Work Mode',
    description: 'Turn on focused task lighting (e.g., desk lamp), adjust air conditioning to alertness-supporting temperature, partially open curtains for natural light, and mute entertainment systems.',
    devices: [
      { deviceId: 'desk_light', action: 'onoff', value: true }, // desk light on
    ]
  }
]; 