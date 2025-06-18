import { getRoomConfig, controlDevice } from '../api/etheos';

export async function getDevices(roomNumber: string) {
  return getRoomConfig(roomNumber);
}

export async function operateDevice(controlUrl: string, body: any) {
  const startTime = Date.now();
  console.log('[DEVICE_SERVICE] Starting device operation...');
  
  try {
    let result;
    // Check if this is a simulated device
    if (controlUrl.startsWith('/simulated/')) {
      result = await simulateDeviceControl(controlUrl, body);
    } else {
      // Use real ETHEOS API for actual devices
      result = await controlDevice(controlUrl, body);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[TIMING] Device Operation: ${duration}ms`);
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[DEVICE] Device operation failed:', error);
    console.log(`[TIMING] Device Operation (Failed): ${duration}ms`);
    throw error;
  }
}

/**
 * Simulate device control for devices without real API
 */
async function simulateDeviceControl(controlUrl: string, body: any): Promise<any> {
  console.log(`[DEVICE_SIMULATOR] Simulating control for ${controlUrl}`, body);
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const deviceType = controlUrl.split('/')[3]; // Extract device type from URL
  
  let response: any = {
    ok: true,
    timestamp: new Date().toISOString(),
    controlUrl,
    body
  };

  if (deviceType === 'ac') {
    response = {
      ...response,
      device: 'Air Conditioner',
      status: 'success',
      currentState: body
    };
  } else if (deviceType === 'curtain') {
    response = {
      ...response,
      device: 'Curtain',
      status: 'success',
      position: body.position || 0
    };
  }

  console.log(`[DEVICE_SIMULATOR] Simulation completed:`, response);
  return response;
}

export interface DeviceControlRequest {
  location: string;
  device: string;
  operation: string;
}

export interface DeviceControlResult {
  controlUri: string;
  value: any;
  replyText: string;
}

/**
 * Map voice command parameters to device control configuration
 */
export function mapDeviceControl(params: DeviceControlRequest): DeviceControlResult | null {
  const { location, device, operation } = params;
  
  let controlUri = '';
  let value = null;
  let replyText = 'Action completed.';

  // Handle different device types
  if (device === 'light' || device === 'lights') {
    return handleLightControl(location, operation);
  } else if (device === 'air conditioner' || device === 'ac' || device === 'aircon') {
    return handleAirConditionerControl(location, operation);
  } else if (device === 'curtain' || device === 'curtains') {
    return handleCurtainControl(location, operation);
  }

  return null;
}

/**
 * Handle light control commands
 */
function handleLightControl(location: string, operation: string): DeviceControlResult | null {
  let controlUri = '';
  let value = null;
  let replyText = 'Action completed.';

  if (location === 'bathroom') {
    // t_10_l2 is bathroom light (component c4)
    controlUri = '/itprdapep00671/control/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c4/capabilities/switch/status';
    
    if (operation === 'on') {
      value = true;
      replyText = 'OK, turning on the bathroom light.';
    } else if (operation === 'off') {
      value = false;
      replyText = 'OK, turning off the bathroom light.';
    }
  } else if (location === 'room') {
    // t_11_l1 is room light (component c3)
    controlUri = '/itprdapep00671/control/rooms/00-08-0c-20-00-1c/devices/d_7_expansion-relay-s04-add0/components/c3/capabilities/switch/status';
    
    if (operation === 'on') {
      value = true;
      replyText = 'OK, turning on the room light.';
    } else if (operation === 'off') {
      value = false;
      replyText = 'OK, turning off the room light.';
    }
  }

  if (!controlUri || value === null) {
    return null;
  }

  return { controlUri, value, replyText };
}

/**
 * Handle air conditioner control commands (simulated)
 */
function handleAirConditionerControl(location: string, operation: string): DeviceControlResult | null {
  // Simulated air conditioner control URIs
  let controlUri = '';
  let value = null;
  let replyText = 'Action completed.';

  if (location === 'room' || location === 'bedroom') {
    controlUri = '/simulated/control/ac/room';
    
    if (operation === 'on') {
      value = { power: true };
      replyText = 'OK, turning on the air conditioner.';
    } else if (operation === 'off') {
      value = { power: false };
      replyText = 'OK, turning off the air conditioner.';
    } else if (operation === 'cool' || operation === 'cooling') {
      value = { mode: 'cool', temperature: 24 };
      replyText = 'OK, setting air conditioner to cooling mode at 24 degrees.';
    } else if (operation === 'heat' || operation === 'heating') {
      value = { mode: 'heat', temperature: 26 };
      replyText = 'OK, setting air conditioner to heating mode at 26 degrees.';
    }
  }

  if (!controlUri || value === null) {
    return null;
  }

  return { controlUri, value, replyText };
}

/**
 * Handle curtain control commands (simulated)
 */
function handleCurtainControl(location: string, operation: string): DeviceControlResult | null {
  // Simulated curtain control URIs
  let controlUri = '';
  let value = null;
  let replyText = 'Action completed.';

  if (location === 'room' || location === 'bedroom') {
    controlUri = '/simulated/control/curtain/room';
    
    if (operation === 'open') {
      value = { position: 100 };
      replyText = 'OK, opening the curtains.';
    } else if (operation === 'close') {
      value = { position: 0 };
      replyText = 'OK, closing the curtains.';
    } else if (operation === 'half' || operation === 'halfway') {
      value = { position: 50 };
      replyText = 'OK, setting curtains to half open.';
    }
  } else if (location === 'bathroom') {
    controlUri = '/simulated/control/curtain/bathroom';
    
    if (operation === 'open') {
      value = { position: 100 };
      replyText = 'OK, opening the bathroom curtains.';
    } else if (operation === 'close') {
      value = { position: 0 };
      replyText = 'OK, closing the bathroom curtains.';
    }
  }

  if (!controlUri || value === null) {
    return null;
  }

  return { controlUri, value, replyText };
} 