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
    description: 'Turn off lights, close curtains, cool the room, and activate night security.',
    devices: [
      { deviceId: 't_11_l1', action: 'onoff', value: false }, // room light off
      { deviceId: 't_10_l2', action: 'onoff', value: false }, // bathroom light off
    ]
  },
  {
    id: 'relax',
    name: 'Relax Mode', 
    description: 'Dim lights, play soft music, set a cozy temperature, and partially close curtains.',
    devices: [
      { deviceId: 't_11_l1', action: 'onoff', value: true }, // room light on
      { deviceId: 't_10_l2', action: 'onoff', value: false }, // bathroom light off
    ]
  },
  {
    id: 'wakeup',
    name: 'Wake-up Mode',
    description: 'Gently raise lights, open curtains, set morning temperature, and play wake-up sounds.',
    devices: [
      { deviceId: 't_11_l1', action: 'onoff', value: true }, // room light on
      { deviceId: 't_10_l2', action: 'onoff', value: true }, // bathroom light on
    ]
  },
  {
    id: 'work',
    name: 'Work Mode',
    description: 'Turn on task lights, set alert temperature, open curtains, and mute distractions.',
    devices: [
      { deviceId: 'desk_light', action: 'onoff', value: true }, // desk light on
    ]
  }
]; 