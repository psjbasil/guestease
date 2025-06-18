import { SupportedLanguage } from '../api/google';

// Multi-language response templates
export const RESPONSES = {
  // Device control responses
  deviceControlSuccess: {
    'en': 'Successfully controlled the {device}',
    'zh': '成功控制了{device}',
    'vi': 'Đã điều khiển {device} thành công', 
    'it': 'Controllo {device} riuscito'
  },
  deviceControlFailed: {
    'en': 'Failed to control the {device}',
    'zh': '控制{device}失败',
    'vi': 'Không thể điều khiển {device}',
    'it': 'Impossibile controllare {device}'
  },
  deviceNotFound: {
    'en': 'Sorry, I could not understand which device to control',
    'zh': '抱歉，我无法理解要控制哪个设备',
    'vi': 'Xin lỗi, tôi không hiểu thiết bị nào cần điều khiển',
    'it': 'Scusa, non ho capito quale dispositivo controllare'
  },
  
  // Scene control responses
  sceneActivateSuccess: {
    'en': 'The {scene} is now on.',
    'zh': '{scene}已打开。',
    'vi': '{scene} đã được bật.',
    'it': '{scene} è ora acceso.'
  },
  sceneActivateFailed: {
    'en': 'Sorry, failed to activate {scene}.',
    'zh': '抱歉，切换到{scene}失败。',
    'vi': 'Xin lỗi, không thể chuyển sang chế độ {scene}.',
    'it': 'Spiacente, impossibile attivare la modalità {scene}.'
  },
  sceneNotFound: {
    'en': 'Sorry, I could not find that scene mode',
    'zh': '抱歉，我找不到该场景模式',
    'vi': 'Xin lỗi, tôi không tìm thấy chế độ cảnh đó',
    'it': 'Scusa, non ho trovato quella modalità scena'
  },
  
  // General responses
  actionCompleted: {
    'en': 'Action completed',
    'zh': '操作完成',
    'vi': 'Hành động đã hoàn thành',
    'it': 'Azione completata'
  },
  error: {
    'en': 'Sorry, I encountered an error',
    'zh': '抱歉，我遇到了一个错误',
    'vi': 'Xin lỗi, tôi gặp lỗi',
    'it': 'Scusa, ho riscontrato un errore'
  },
  
  // Light control specific
  lightOn: {
    'en': 'The {location} light is now on.',
    'zh': '{location}的灯已打开。',
    'vi': 'Đèn {location} đã được bật.',
    'it': 'La luce {location} è ora accesa.'
  },
  lightOff: {
    'en': 'The {location} light is now off.',
    'zh': '{location}的灯已关闭。',
    'vi': 'Đèn {location} đã được tắt.',
    'it': 'La luce {location} è ora spenta.'
  }
} as const;

export type ResponseKey = keyof typeof RESPONSES;

/**
 * Get localized response text
 */
export function getLocalizedResponse(
  key: ResponseKey,
  language: SupportedLanguage,
  variables?: Record<string, string>
): string {
  const template: string = RESPONSES[key][language] || RESPONSES[key]['en'];
  
  if (!variables) {
    return template;
  }
  
  // Replace variables in template
  let result: string = template;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(`{${key}}`, value);
  }
  return result;
}

/**
 * Location translations for device control
 */
export const LOCATION_TRANSLATIONS = {
  bathroom: {
    'en': 'bathroom',
    'zh': '浴室',
    'vi': 'phòng tắm',
    'it': 'bagno'
  },
  room: {
    'en': 'room',
    'zh': '房间',
    'vi': 'phòng',
    'it': 'camera'
  },
  living_room: {
    'en': 'living room',
    'zh': '客厅',
    'vi': 'phòng khách',
    'it': 'soggiorno'
  },
  bedroom: {
    'en': 'bedroom',
    'zh': '卧室',
    'vi': 'phòng ngủ',
    'it': 'camera da letto'
  }
} as const;

/**
 * Device translations
 */
export const DEVICE_TRANSLATIONS = {
  light: {
    'en': 'light',
    'zh': '灯',
    'vi': 'đèn',
    'it': 'luce'
  },
  air_conditioner: {
    'en': 'air conditioner',
    'zh': '空调',
    'vi': 'máy lạnh',
    'it': 'condizionatore'
  },
  curtain: {
    'en': 'curtain',
    'zh': '窗帘',
    'vi': 'rèm cửa',
    'it': 'tenda'
  }
} as const;

/**
 * Get translated location name
 */
export function getLocalizedLocation(location: string, language: SupportedLanguage): string {
  const locationKey = location.toLowerCase() as keyof typeof LOCATION_TRANSLATIONS;
  return LOCATION_TRANSLATIONS[locationKey]?.[language] || location;
}

/**
 * Get translated device name  
 */
export function getLocalizedDevice(device: string, language: SupportedLanguage): string {
  const deviceKey = device.toLowerCase() as keyof typeof DEVICE_TRANSLATIONS;
  return DEVICE_TRANSLATIONS[deviceKey]?.[language] || device;
} 