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
    curtainControls: 'Curtain Control',
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
  const [controlLoading, setControlLoading] = useState(null); // Track which control button is loading
  const [controlFeedback, setControlFeedback] = useState(''); // Show feedback message
  const [toasts, setToasts] = useState([]); // Toast notifications
  const [buttonStates, setButtonStates] = useState({}); // Button states (on/off)
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

  // Execute a scene with enhanced feedback
  const executeScene = async (sceneId) => {
    setLoadingScene(sceneId);
    setRobotState('thinking');
    
    // Find scene name
    const scene = scenes.find(s => s.id === sceneId);
    const sceneName = scene ? scene.name : sceneId;
    
    // Show loading toast
    addToast(`Activating ${sceneName}...`, 'loading', 2000);
    
    try {
      const response = await fetch(`/api/scenes/${sceneId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomNumber: '101' }),
      });
      const data = await response.json();
      
      // Update scene state
      setButtonStates(prev => ({
        ...prev,
        [sceneId]: true,
        // Deactivate other scenes (only one can be active)
        ...Object.keys(prev).reduce((acc, key) => {
          if (key !== sceneId && scenes.find(s => s.id === key)) {
            acc[key] = false;
          }
          return acc;
        }, {})
      }));
      
      // Show success toast
      addToast(`${sceneName} activated successfully! ✅`, 'success');
      
      setResult(`Scene "${data.sceneName}" executed successfully!`);
      setRobotState('idle');
    } catch (error) {
      console.error('Failed to execute scene:', error);
      
      // Show error toast
      addToast(`Failed to activate ${sceneName} ❌`, 'error');
      
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
        
        // Check if a scene was activated via voice and sync UI
        if (data.sceneActivated) {
          const activatedSceneId = data.sceneActivated;
          
          // Update button states to reflect voice-activated scene
          setButtonStates(prev => ({
            ...prev,
            [activatedSceneId]: true,
            // Deactivate other scenes (only one can be active)
            ...Object.keys(prev).reduce((acc, key) => {
              if (key !== activatedSceneId && scenes.find(s => s.id === key)) {
                acc[key] = false;
              }
              return acc;
            }, {})
          }));
          
          // Show toast notification for voice-activated scene
          const scene = scenes.find(s => s.id === activatedSceneId);
          const sceneName = scene ? scene.name : activatedSceneId;
          addToast(`${sceneName} activated via voice! ✅`, 'success');
        }
        
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

  // Toast notification management
  const addToast = (message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle control button clicks (simple version)
  const handleControlClick = async (controlType, actionName) => {
    setControlLoading(controlType);
    setControlFeedback('');
    
    // Simulate API call with delay
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success feedback
      const feedbackMessages = {
        'lights-on': texts.allLightsOn + ' - Success!',
        'lights-off': texts.allLightsOff + ' - Success!',
        'climate': texts.climateControl + ' - Adjusted!',
        'curtains': texts.curtainControls + ' - Controlled!',
        'guest-services': 'Guest Services - Contacted!',
        'dnd': 'Do Not Disturb - Activated!'
      };
      
      setControlFeedback(feedbackMessages[controlType] || actionName + ' - Success!');
      
      // Clear feedback after 3 seconds
      setTimeout(() => {
        setControlFeedback('');
      }, 3000);
      
    } catch (error) {
      setControlFeedback('Error: ' + error.message);
    } finally {
      setControlLoading(null);
    }
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <img src="/images/guestease-logo.jpg" alt="GuestEase Logo" className="header-logo" />
            <h1 className="hotel-name">{texts.title}</h1>
          </div>
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
            <img 
              src="/images/guestease-robot.jpg" 
              alt="GuestEase Robot Assistant" 
              className="robot-image"
            />
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
                className={`scene-card ${buttonStates[scene.id] ? 'active' : ''}`}
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
                  <span className="scene-status">
                    {buttonStates[scene.id] ? 'ACTIVE' : 'INACTIVE'}
                  </span>
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
          
          {/* Control Feedback */}
          {controlFeedback && (
            <div className="control-feedback">
              <p>{controlFeedback}</p>
            </div>
          )}
          
          <div className="control-buttons">
            <button 
              className={`control-btn lights ${controlLoading === 'lights-on' ? 'loading' : ''}`}
              onClick={() => handleControlClick('lights-on', texts.allLightsOn)}
              disabled={controlLoading !== null}
            >
              <div className="control-icon">
                {controlLoading === 'lights-on' ? '⏳' : '💡'}
              </div>
              <div className="control-info">
                <h4>{texts.allLightsOn}</h4>
              </div>
              {controlLoading === 'lights-on' && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </button>
            <button 
              className={`control-btn lights-off ${controlLoading === 'lights-off' ? 'loading' : ''}`}
              onClick={() => handleControlClick('lights-off', texts.allLightsOff)}
              disabled={controlLoading !== null}
            >
              <div className="control-icon">
                {controlLoading === 'lights-off' ? '⏳' : '🌚'}
              </div>
              <div className="control-info">
                <h4>{texts.allLightsOff}</h4>
              </div>
              {controlLoading === 'lights-off' && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                </div>
              )}
            </button>
            <button className="control-btn temperature">
              <div className="control-icon">🌡️</div>
              <div className="control-info">
                <h4>{texts.climateControl}</h4>
              </div>
            </button>
            <button className="control-btn curtains">
              <div className="control-icon">🪟</div>
              <div className="control-info">
                <h4>{texts.curtainControls}</h4>
              </div>
            </button>
            <button className="control-btn guest-services">
              <div className="control-icon">🛎️</div>
              <div className="control-info">
                <h4>Guest Services</h4>
              </div>
            </button>
            <button className="control-btn dnd">
              <div className="control-icon">🚫</div>
              <div className="control-info">
                <h4>Do Not Disturb</h4>
              </div>
            </button>
          </div>
        </section>
      </main>

      {/* Audio Player */}
      {audioUrl && (
        <audio src={audioUrl} controls autoPlay style={{ display: 'none' }} />
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <div className="toast-content">
              <div className="toast-icon">
                {toast.type === 'success' && '✅'}
                {toast.type === 'error' && '❌'}
                {toast.type === 'loading' && '⏳'}
                {toast.type === 'info' && 'ℹ️'}
              </div>
              <div className="toast-message">{toast.message}</div>
              <button 
                className="toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  removeToast(toast.id);
                }}
              >
                ✕
              </button>
            </div>
            <div className="toast-progress">
              <div 
                className="toast-progress-bar" 
                style={{ 
                  animationDuration: `${toast.duration}ms`,
                  animationName: 'progressBar'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="footer">
        <p>{texts.footer}</p>
      </footer>
    </div>
  );
}