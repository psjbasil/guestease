# 多语言支持 (Multilingual Support)

## 概述 (Overview)

GuestEase 语音助手现已支持四种语言：
- 🇺🇸 **English** (英语)
- 🇨🇳 **中文** (Chinese)
- 🇻🇳 **Tiếng Việt** (越南语)
- 🇮🇹 **Italiano** (意大利语)

## 功能特性 (Features)

### 1. 自动语言检测
- 语音识别时自动检测用户说话的语言
- 基于 Google Cloud Speech-to-Text 的多语言识别
- 支持语言偏好设置覆盖自动检测

### 2. 多语言意图理解
- Dialogflow 支持多语言意图检测
- 同一意图在不同语言中的训练短语
- 参数提取支持多语言实体

### 3. 本地化响应
- 根据检测到的语言提供相应的回复
- 设备和位置名称的多语言翻译
- 完整的UI界面多语言支持

### 4. 语音合成
- 每种语言使用对应的原生语音
- 高质量的Wavenet语音合成
- 自然流畅的语音输出

## 技术实现 (Technical Implementation)

### 后端实现

#### 语音识别增强
```typescript
// Google Cloud Speech-to-Text 配置
export const SUPPORTED_LANGUAGES = {
  'en': 'en-US',
  'zh': 'zh-CN', 
  'vi': 'vi-VN',
  'it': 'it-IT'
} as const;

// 自动语言检测
export async function transcribeAudio(audioBuffer: Buffer, language?: SupportedLanguage) {
  let config: any = {
    encoding: 'WEBM_OPUS',
    enableAutomaticPunctuation: true
  };

  if (language && SUPPORTED_LANGUAGES[language]) {
    config.languageCode = SUPPORTED_LANGUAGES[language];
  } else {
    config.alternativeLanguageCodes = Object.values(SUPPORTED_LANGUAGES);
    config.languageCode = 'en-US'; // Primary language
  }
  // ...
}
```

#### 语音合成配置
```typescript
// 各语言的语音配置
export const VOICE_CONFIGS = {
  'en': { languageCode: 'en-US', name: 'en-US-Wavenet-F', ssmlGender: 'FEMALE' },
  'zh': { languageCode: 'zh-CN', name: 'zh-CN-Wavenet-A', ssmlGender: 'FEMALE' },
  'vi': { languageCode: 'vi-VN', name: 'vi-VN-Wavenet-A', ssmlGender: 'FEMALE' },
  'it': { languageCode: 'it-IT', name: 'it-IT-Wavenet-A', ssmlGender: 'FEMALE' }
} as const;
```

#### 本地化响应系统
```typescript
// 多语言响应模板
export const RESPONSES = {
  deviceControlSuccess: {
    'en': 'Successfully controlled the {device}',
    'zh': '成功控制了{device}',
    'vi': 'Đã điều khiển {device} thành công', 
    'it': 'Controllo {device} riuscito'
  },
  // ... more responses
};

// 获取本地化响应
export function getLocalizedResponse(
  key: ResponseKey,
  language: SupportedLanguage,
  variables?: Record<string, string>
): string {
  const template: string = RESPONSES[key][language] || RESPONSES[key]['en'];
  // Variable substitution logic...
}
```

### 前端实现

#### 语言选择器
- 在头部添加了优雅的语言切换组件
- 支持旗帜图标和语言名称显示
- 下拉菜单选择不同语言

#### UI本地化
```javascript
// UI文本多语言配置
const UI_TEXTS = {
  en: {
    greeting: "Hi! I'm your room assistant. How can I help you?",
    tapToSpeak: 'Tap to Speak',
    // ...
  },
  zh: {
    greeting: "您好！我是您的客房助手。有什么可以为您服务的吗？",
    tapToSpeak: '点击说话',
    // ...
  },
  // vi, it configurations...
};
```

## 使用方法 (Usage)

### 1. 语言选择
- 点击页面顶部的语言按钮
- 从下拉菜单中选择所需语言
- 界面将立即切换到选定语言

### 2. 语音控制
- 使用选定语言说话
- 系统会自动检测语言并相应回复
- 支持混合语言使用（自动检测优先）

### 3. 支持的语音命令示例

**English:**
- "Turn on the bathroom light"
- "Activate sleep mode"
- "Set the temperature to 22 degrees"

**中文:**
- "打开浴室的灯"
- "激活睡眠模式"  
- "把温度调到22度"

**Tiếng Việt:**
- "Bật đèn phòng tắm"
- "Kích hoạt chế độ ngủ"
- "Đặt nhiệt độ 22 độ"

**Italiano:**
- "Accendi la luce del bagno"
- "Attiva modalità sonno"
- "Imposta la temperatura a 22 gradi"

## API接口 (API Interface)

### 语音处理接口
```
POST /api/voice
Content-Type: multipart/form-data

Body:
- audio: 音频文件
- language: 语言偏好 (可选)
- sessionId: 会话ID (可选)

Response:
{
  "transcript": "识别的文本",
  "detectedLanguage": "检测到的语言代码",
  "language": "使用的语言",
  "intent": "检测到的意图", 
  "deviceResult": "设备控制结果",
  "replyText": "回复文本",
  "audio": "base64编码的音频"
}
```

## 配置要求 (Configuration Requirements)

### Google Cloud 服务
1. **Speech-to-Text API**
   - 启用多语言支持
   - 配置语言代码

2. **Dialogflow**
   - 为每种语言配置训练短语
   - 设置多语言实体

3. **Text-to-Speech API**
   - 配置各语言的Wavenet语音
   - 设置音频格式为MP3

### 环境变量
确保以下环境变量正确配置：
```
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

## 扩展性 (Extensibility)

### 添加新语言
1. 在 `SUPPORTED_LANGUAGES` 中添加语言代码
2. 在 `VOICE_CONFIGS` 中配置语音
3. 在 `RESPONSES` 中添加翻译
4. 在前端 `UI_TEXTS` 中添加界面文本
5. 在 Dialogflow 中训练新语言的意图

### 自定义响应
- 修改 `languageService.ts` 中的响应模板
- 添加新的响应类型和翻译
- 支持变量替换和动态内容

## 性能优化 (Performance Optimization)

- 语言检测结果缓存
- 响应模板预编译
- 语音合成结果缓存（可选）
- 前端语言状态持久化

## 故障排除 (Troubleshooting)

### 常见问题
1. **语音识别失败**
   - 检查麦克风权限
   - 确认语言配置正确
   - 验证Google Cloud API密钥

2. **语言检测不准确**
   - 使用语言偏好设置
   - 确保音频质量清晰
   - 检查支持的语言列表

3. **语音合成错误**
   - 验证Text-to-Speech API配置
   - 检查语言代码匹配
   - 确认音频格式支持

## 未来改进 (Future Improvements)

- [ ] 添加更多语言支持
- [ ] 语言学习和适应功能
- [ ] 方言和口音识别
- [ ] 实时语言切换
- [ ] 语音情感识别
- [ ] 上下文感知翻译 