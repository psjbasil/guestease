import React, { useRef, useState, useEffect } from 'react';
import './App.css';

// Language configurations
const LANGUAGES = {
  en: { name: 'English', flag: '🇺🇸' },
  zh: { name: '中文', flag: '🇨🇳' },
  vi: { name: 'Tiếng Việt', flag: '🇻🇳' },
  it: { name: 'Italiano', flag: '🇮🇹' }
};

// UI texts in different languages
const UI_TEXTS = {
  en: {
    title: 'GuestEase',
    greeting: "Hi! I'm your room assistant. How can I help you?",
    tips: 'Try saying: "activate sleep mode", "turn on room lights", "set relax mode"',
    listening: "I'm listening... 👂",
    thinking: "Let me process that... 🤔",
    speaking: "Here's what I found! 💬",
    tapToSpeak: 'Tap to Speak',
    stopRecording: 'Stop Recording',
    quickScenes: 'Quick Scene Control',
    roomStatus: 'Room Status',
    quickControls: 'Quick Controls',
    temperature: 'Temperature',
    lights: 'Lights',
    curtains: 'Curtains',
    security: 'Security',
    allLightsOn: 'All Lights On',
    allLightsOff: 'All Lights Off',
    climateControl: 'Climate Control',
    curtainControls: 'Curtain Controls',
    roomService: 'Room Service',
    housekeeping: 'Housekeeping',
    footer: 'Room 201 • Voice Assistant • Available 24/7',
    selectLanguage: 'Select Language'
  },
  zh: {
    title: 'GuestEase',
    greeting: "您好！我是您的客房助手。有什么可以为您服务的吗？",
    tips: '您可以说："激活睡眠模式"、"打开灯光"、"设置放松模式"',
    listening: "我在听... 👂",
    thinking: "正在处理... 🤔",
    speaking: "为您找到了结果！ 💬",
    tapToSpeak: '点击说话',
    stopRecording: '停止录音',
    quickScenes: '快速场景控制',
    roomStatus: '房间状态',
    quickControls: '快速控制',
    temperature: '温度',
    lights: '灯光',
    curtains: '窗帘',
    security: '安全',
    allLightsOn: '打开所有灯',
    allLightsOff: '关闭所有灯',
    climateControl: '温度控制',
    curtainControls: '窗帘控制',
    roomService: '客房服务',
    housekeeping: '客房清洁',
    footer: '201房间 • 语音助手 • 24小时为您服务',
    selectLanguage: '选择语言'
  },
  vi: {
    title: 'GuestEase',
    greeting: "Xin chào! Tôi là trợ lý phòng của bạn. Tôi có thể giúp gì cho bạn?",
    tips: 'Thử nói: "kích hoạt chế độ ngủ", "bật đèn", "đặt chế độ thư giãn"',
    listening: "Tôi đang nghe... 👂",
    thinking: "Để tôi xử lý... 🤔",
    speaking: "Đây là kết quả! 💬",
    tapToSpeak: 'Nhấn để nói',
    stopRecording: 'Dừng ghi âm',
    quickScenes: 'Điều khiển cảnh nhanh',
    roomStatus: 'Trạng thái phòng',
    quickControls: 'Điều khiển nhanh',
    temperature: 'Nhiệt độ',
    lights: 'Đèn',
    curtains: 'Rèm cửa',
    security: 'Bảo mật',
    allLightsOn: 'Bật tất cả đèn',
    allLightsOff: 'Tắt tất cả đèn',
    climateControl: 'Điều khiển khí hậu',
    curtainControls: 'Điều khiển rèm',
    roomService: 'Dịch vụ phòng',
    housekeeping: 'Dọn dẹp phòng',
    footer: 'Phòng 201 • Trợ lý giọng nói • Có sẵn 24/7',
    selectLanguage: 'Chọn ngôn ngữ'
  },
  it: {
    title: 'GuestEase',
    greeting: "Ciao! Sono il tuo assistente di camera. Come posso aiutarti?",
    tips: 'Prova a dire: "attiva modalità sonno", "accendi luci", "imposta modalità relax"',
    listening: "Sto ascoltando... 👂",
    thinking: "Sto elaborando... 🤔",
    speaking: "Ecco cosa ho trovato! 💬",
    tapToSpeak: 'Tocca per parlare',
    stopRecording: 'Ferma registrazione',
    quickScenes: 'Controllo scene rapido',
    roomStatus: 'Stato camera',
    quickControls: 'Controlli rapidi',
    temperature: 'Temperatura',
    lights: 'Luci',
    curtains: 'Tende',
    security: 'Sicurezza',
    allLightsOn: 'Tutte le luci accese',
    allLightsOff: 'Tutte le luci spente',
    climateControl: 'Controllo clima',
    curtainControls: 'Controllo tende',
    roomService: 'Servizio in camera',
    housekeeping: 'Pulizie',
    footer: 'Camera 201 • Assistente vocale • Disponibile 24/7',
    selectLanguage: 'Seleziona lingua'
  }
};

export default function App() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [scenes, setScenes] = useState([]);
  const [loadingScene, setLoadingScene] = useState(null);
  const [robotState, setRobotState] = useState('idle'); // idle, listening, thinking, speaking
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState(null); // Store complete voice response
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Get current UI texts based on selected language
  const texts = UI_TEXTS[selectedLanguage];

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load available scenes on component mount
  useEffect(() => {
    loadScenes();
  }, []);

  const loadScenes = async () => {
    try {
      const response = await fetch('/api/scenes');
      const data = await response.json();
      if (data.success) {
        setScenes(data.scenes);
      }
    } catch (error) {
      console.error('Failed to load scenes:', error);
    }
  };

  // Execute a scene
  const executeScene = async (sceneId) => {
    setLoadingScene(sceneId);
    setRobotState('thinking');
    try {
      const response = await fetch(`/api/scenes/${sceneId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomNumber: '101' }),
      });
      const data = await response.json();
      setResult(`Scene "${data.sceneName}" executed successfully!`);
      setRobotState('idle');
    } catch (error) {
      console.error('Failed to execute scene:', error);
      setResult(`Error executing scene: ${error.message}`);
      setRobotState('idle');
    } finally {
      setLoadingScene(null);
    }
  };

  // Start recording
  const startRecording = async () => {
    setResult('');
    setAudioUrl('');
    setVoiceResponse(null);
    setRobotState('listening');
    
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new window.MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    
    mediaRecorder.ondataavailable = (e) => {
      audioChunksRef.current.push(e.data);
    };
    
    mediaRecorder.onstop = async () => {
      setRobotState('thinking');
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      
      // Send to backend with language preference
      const formData = new FormData();
      formData.append('audio', audioBlob, 'record.wav');
      formData.append('language', selectedLanguage);
      
      try {
        const resp = await fetch('/api/voice', { method: 'POST', body: formData });
        const data = await resp.json();
        
        console.log('Voice response:', data);
        setVoiceResponse(data); // Store complete response
        
        // Support audio response
        if (data.audioUrl) {
          setAudioUrl(data.audioUrl);
        } else if (data.audio) {
          setAudioUrl(`data:audio/mp3;base64,${data.audio}`);
        }
        
        setResult(data.replyText || 'Command processed successfully!');
        setRobotState('speaking');
        
        // Return to idle after speaking
        setTimeout(() => setRobotState('idle'), 3000);
      } catch (error) {
        setResult('Sorry, I encountered an error processing your request.');
        setRobotState('idle');
      }
    };
    
    mediaRecorder.start();
    setRecording(true);
  };

  // Stop recording
  const stopRecording = () => {
    mediaRecorderRef.current && mediaRecorderRef.current.stop();
    setRecording(false);
  };

  // Get robot animation class based on state
  const getRobotClass = () => {
    switch (robotState) {
      case 'listening': return 'robot listening';
      case 'thinking': return 'robot thinking';
      case 'speaking': return 'robot speaking';
      default: return 'robot idle';
    }
  };

  // Scene icons mapping
  const getSceneIcon = (sceneId) => {
    const icons = {
      sleep: '🌙',
      relax: '🛋️',
      wakeup: '☀️',
      work: '💼'
    };
    return icons[sceneId] || '⚡';
  };

  // Scene colors mapping
  const getSceneColor = (sceneId) => {
    const colors = {
      sleep: '#4A90E2',
      relax: '#7ED321',
      wakeup: '#F5A623',
      work: '#3A7AFE'
    };
    return colors[sceneId] || '#50E3C2';
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="hotel-name">{texts.title}</h1>
          <div className="header-controls">
            <div className="language-selector">
              <button 
                className="language-button"
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
              >
                {LANGUAGES[selectedLanguage].flag} {LANGUAGES[selectedLanguage].name}
              </button>
              {showLanguageSelector && (
                <div className="language-dropdown">
                  {Object.entries(LANGUAGES).map(([code, lang]) => (
                    <button
                      key={code}
                      className={`language-option ${code === selectedLanguage ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedLanguage(code);
                        setShowLanguageSelector(false);
                      }}
                    >
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="time-display">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Robot Assistant Section */}
        <section className="robot-section">
          <div className={getRobotClass()}>
            <div className="robot-face">
              <div className="robot-eyes">
                <div className="eye left-eye"></div>
                <div className="eye right-eye"></div>
              </div>
              <div className="robot-mouth"></div>
            </div>
            <div className="robot-body">
              <div className="robot-chest"></div>
            </div>
          </div>
          
          <div className="robot-status">
            {robotState === 'idle' && (
              <div>
                <p>{texts.greeting}</p>
                <div className="voice-tips">
                  <small>{texts.tips}</small>
                </div>
              </div>
            )}
            {robotState === 'listening' && <p>{texts.listening}</p>}
            {robotState === 'thinking' && <p>{texts.thinking}</p>}
            {robotState === 'speaking' && <p>{texts.speaking}</p>}
          </div>

          <button 
            className={`voice-button ${recording ? 'recording' : ''}`}
            onClick={recording ? stopRecording : startRecording}
          >
            <div className="voice-icon">
              {recording ? '⏹️' : '🎤'}
            </div>
            <span>{recording ? texts.stopRecording : texts.tapToSpeak}</span>
          </button>

          {result && (
            <div className="response-bubble">
              <p>{result}</p>
            </div>
          )}
        </section>

        {/* Quick Actions Section */}
        <section className="quick-actions">
          <h2>{texts.quickScenes}</h2>
          <div className="scene-grid">
            {scenes.map((scene) => (
              <button
                key={scene.id}
                className="scene-card"
                onClick={() => executeScene(scene.id)}
                disabled={loadingScene === scene.id}
                style={{ '--scene-color': getSceneColor(scene.id) }}
              >
                <div className="scene-icon">
                  {loadingScene === scene.id ? '⏳' : getSceneIcon(scene.id)}
                </div>
                <div className="scene-info">
                  <h3>{scene.name}</h3>
                  <p>{scene.description}</p>
                </div>
                {loadingScene === scene.id && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Room Status */}
        <section className="room-status">
          <h3>{texts.roomStatus}</h3>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-icon">🌡️</div>
              <div className="status-info">
                <h4>Room Temperature</h4>
                <p>22°C</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon">❄️</div>
              <div className="status-info">
                <h4>AC Temperature</h4>
                <p>24°C</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon">💡</div>
              <div className="status-info">
                <h4>{texts.lights}</h4>
                <p>2 Active</p>
              </div>
            </div>
            <div className="status-card">
              <div className="status-icon">🪟</div>
              <div className="status-info">
                <h4>{texts.curtains}</h4>
                <p>Closed</p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Quick Controls */}
        <section className="additional-controls">
          <h3>{texts.quickControls}</h3>
          <div className="control-buttons">
            <button className="control-btn lights" onClick={() => executeScene('wakeup')} style={{ background: 'linear-gradient(145deg, #ffeaa7, #fdcb6e)', color: '#333' }}>
              💡 {texts.allLightsOn}
            </button>
            <button className="control-btn lights-off" onClick={() => executeScene('sleep')} style={{ background: 'linear-gradient(145deg, #636e72, #2d3436)', color: '#fff' }}>
              🌚 {texts.allLightsOff}
            </button>
            <button className="control-btn temperature" style={{ background: 'linear-gradient(145deg, #74b9ff, #0984e3)', color: '#fff' }}>
              🌡️ {texts.climateControl}
            </button>
            <button className="control-btn curtains" style={{ background: 'linear-gradient(145deg, #a29bfe, #6c5ce7)', color: '#fff' }}>
              🪟 {texts.curtainControls}
            </button>
            <button className="control-btn guest-services" style={{ background: 'linear-gradient(145deg, #fd79a8, #e84393)', color: '#fff' }}>
              🛎️ Guest Services
            </button>
            <button className="control-btn dnd" style={{ background: 'linear-gradient(145deg, #ff7675, #d63031)', color: '#fff' }}>
              🚫 Do Not Disturb
            </button>
          </div>
        </section>
      </main>

      {/* Audio Player */}
      {audioUrl && (
        <audio src={audioUrl} controls autoPlay style={{ display: 'none' }} />
      )}

      {/* Footer */}
      <footer className="footer">
        <p>{texts.footer}</p>
      </footer>
    </div>
  );
}