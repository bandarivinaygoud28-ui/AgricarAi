import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DiseaseScanResult, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { VoiceButton } from '../components/VoiceButton';
import {
  speechService,
  VoiceInfo,
  LANGUAGE_DISPLAY,
  VOICE_TEST_PROMPTS
} from '../utils/speechService';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileCheck,
  TrendingUp,
  CloudSun,
  Trash2,
  Volume2,
  VolumeX,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Mic,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AssistantPageProps {
  language: LanguageCode;
  activeDiagnosisContext?: DiseaseScanResult | null;
  onClearDiagnosisContext?: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  language,
  activeDiagnosisContext,
  onClearDiagnosisContext
}) => {
  const t = translations[language];

  // Speech settings state
  const [speechSpeed, setSpeechSpeed] = useState<number>(() => {
    return (language === 'te' || language === 'hi') ? 0.85 : 0.95;
  });
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [voiceInfo, setVoiceInfo] = useState<VoiceInfo>(() =>
    speechService.getBestVoice(language)
  );
  const [availableLanguageVoices, setAvailableLanguageVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);

  // Sync default speed and voice when language changes
  useEffect(() => {
    const defaultSpeed = (language === 'te' || language === 'hi') ? 0.85 : 0.95;
    setSpeechSpeed(defaultSpeed);
    setSelectedVoiceURI('');
    
    const info = speechService.getBestVoice(language);
    setVoiceInfo(info);
    setAvailableLanguageVoices(speechService.getVoicesForLanguage(language));
  }, [language]);

  // Listen for browser voices loaded / changed
  useEffect(() => {
    const updateVoiceState = () => {
      const info = speechService.getBestVoice(language, selectedVoiceURI || undefined);
      setVoiceInfo(info);
      setAvailableLanguageVoices(speechService.getVoicesForLanguage(language));
    };

    updateVoiceState();
    const unsubVoices = speechService.onVoicesChanged(() => {
      updateVoiceState();
    });

    const unsubSpeaking = speechService.onSpeakingStatusChange((speaking) => {
      if (!speaking) {
        setIsTestingVoice(false);
      }
    });

    return () => {
      unsubVoices();
      unsubSpeaking();
    };
  }, [language, selectedVoiceURI]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: language === 'te'
        ? "నమస్కారం! నేను మీ అగ్రికేర్ AI వ్యవసాయ సహాయకుడిని. పంట తెగుళ్లు, నివారణ మందులు, మార్కెట్ ధరలు లేదా వాతావరణం గురించి ఏదైనా అడగండి."
        : language === 'hi'
        ? "नमस्ते! मैं आपका एग्रीकेयर AI किसान सहायक हूँ। फसल रोग, उपचार, मंडी भाव या मौसम के बारे में कोई भी प्रश्न पूछें।"
        : "Hello! I am your AgriCare AI Farmer Assistant. Ask me anything about crop diseases, treatment dosages, live market rates, or weather risks.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputVal, setInputVal] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // If active diagnosis context was passed from Crop Health Report, send an introductory context message
  useEffect(() => {
    if (activeDiagnosisContext) {
      const contextMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'assistant',
        text: language === 'te'
          ? `నేను మీ ${activeDiagnosisContext.crop} నివేదికను ('${activeDiagnosisContext.disease}') లోడ్ చేసాను. దీని నివారణ మందులు లేదా మార్కెట్ ధరల గురించి నన్ను అడగవచ్చు.`
          : language === 'hi'
          ? `मैंने आपकी ${activeDiagnosisContext.crop} रिपोर्ट ('${activeDiagnosisContext.disease}') लोड कर ली है। आप इसके उपचार या मंडी भाव के बारे में पूछ सकते हैं।`
          : `Active diagnosis context loaded for ${activeDiagnosisContext.crop} (${activeDiagnosisContext.affected_area}) with '${activeDiagnosisContext.disease}'. Ask me for customized treatment steps, market prices, or spray schedules.`,
        topic: 'diagnosis',
        diagnosis_context: activeDiagnosisContext,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, contextMsg]);
    }
  }, [activeDiagnosisContext]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal;
    if (!query.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsSending(true);

    try {
      const farmerLocation =
        localStorage.getItem('agricare_farm_location_name') ||
        `${localStorage.getItem('agricare_farmer_district') || 'Warangal'}, ${localStorage.getItem('agricare_farmer_state') || 'Telangana'}`;

      const res = await api.askAssistant(
        query.trim(),
        language,
        activeDiagnosisContext || undefined,
        farmerLocation
      );

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.response,
        topic: res.topic,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: language === 'te'
          ? "క్షమించండి, సర్వర్‌ను సంప్రదించడంలో సమస్య ఏర్పడింది. దయచేసి ఇంటర్నెట్ కనెక్షన్ తనిఖీ చేయండి."
          : language === 'hi'
          ? "क्षमा करें, सर्वर से संपर्क करने में समस्या आ रही है। कृपया इंटरनेट कनेक्शन जांचें।"
          : "Sorry, I am having trouble reaching the assistant service. Please check your connection.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setInputVal(transcript);
    handleSendMessage(transcript);
  };

  const handleTestVoice = async () => {
    if (isTestingVoice) {
      speechService.cancel();
      setIsTestingVoice(false);
      return;
    }

    if (!voiceInfo.isAvailable || !voiceInfo.voice) {
      alert(
        voiceInfo.unavailableMessage ||
        `${LANGUAGE_DISPLAY[language].name} voice is not available on this device.`
      );
      return;
    }

    setIsTestingVoice(true);
    await speechService.testVoice(language, {
      speed: speechSpeed,
      voiceURI: selectedVoiceURI || undefined,
      onStart: () => setIsTestingVoice(true),
      onEnd: () => setIsTestingVoice(false),
      onError: (err) => {
        setIsTestingVoice(false);
        alert(err);
      }
    });
  };

  const speedOptions = [0.75, 0.85, 0.9, 1.0, 1.1];

  const quickPrompts = [
    {
      label: language === 'te' ? "💰 టమాట మార్కెట్ ధర" : language === 'hi' ? "💰 टमाटर मंडी भाव" : "💰 Tomato Market Price",
      query: language === 'te' ? "టమాట మార్కెట్ ధర ఎంత ఉంది?" : language === 'hi' ? "टमाटर का आज का मंडी भाव क्या है?" : "What is the current tomato market price?"
    },
    {
      label: language === 'te' ? "🌾 వరి అగ్గితెగులు నివారణ" : language === 'hi' ? "🌾 धान ब्लास्ट रोग उपचार" : "🌾 Paddy Blast Treatment",
      query: language === 'te' ? "వరి పంటలో అగ్గితెగులు నివారణకు మందు ఏమిటి?" : language === 'hi' ? "धान के ब्लास्ट रोग के नियंत्रण के लिए क्या उपाय करें?" : "What is the recommended treatment for rice blast?"
    },
    {
      label: language === 'te' ? "🍂 టమాటా ఆకులు పసుపు" : language === 'hi' ? "🍂 टमाटर पत्ते पीले" : "🍂 Tomato Yellow Leaves",
      query: language === 'te' ? "నా టమాటా పంటకు ఆకులు పసుపు రంగులోకి మారుతున్నాయి. ఏమి చేయాలి?" : language === 'hi' ? "मेरी टमाटर की फसल के पत्ते पीले हो रहे हैं। मुझे क्या करना चाहिए?" : "My tomato crop leaves are turning yellow. What should I do?"
    },
    {
      label: language === 'te' ? "🌦️ నేడు స్ప్రే చేయవచ్చా?" : language === 'hi' ? "🌦️ क्या आज छिड़काव करें?" : "🌦️ Can I spray today?",
      query: language === 'te' ? "ఈ రోజు మందులు స్ప్రే చేయడానికి వాతావరణం అనుకూలమా?" : language === 'hi' ? "क्या आज कीटनाशक छिड़काव के लिए मौसम सही है?" : "Is the weather suitable for chemical spraying today?"
    }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-700 to-emerald-500 text-white flex items-center justify-center shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">{t.assistantHeader}</h1>
              <p className="text-xs text-slate-500 font-medium">{t.assistantSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVoiceSettings(!showVoiceSettings)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                showVoiceSettings
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
              title="Voice AI Settings"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Voice Settings</span>
              {showVoiceSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors text-xs flex items-center gap-1 font-bold border border-transparent hover:border-red-200"
              title="Clear chat history"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          </div>
        </div>

        {/* Voice AI Status & Controls Bar */}
        <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            {/* Language Display */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Language:</span>
              <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                {LANGUAGE_DISPLAY[language].nativeName}
              </span>
            </div>

            {/* Voice Status Display */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Voice:</span>
              {voiceInfo.isAvailable ? (
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="max-w-[180px] sm:max-w-[240px] truncate" title={voiceInfo.voiceName}>
                    {voiceInfo.voiceName}
                  </span>
                </span>
              ) : (
                <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{voiceInfo.voiceName}</span>
                </span>
              )}
            </div>

            {/* Speech Speed Indicator */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Speed:</span>
              <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                {speechSpeed}x
              </span>
            </div>
          </div>

          {/* Test Voice Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestVoice}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 shadow-2xs border ${
                isTestingVoice
                  ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse'
                  : voiceInfo.isAvailable
                  ? 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              }`}
              title="Test Voice Pronunciation"
            >
              {isTestingVoice ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{isTestingVoice ? 'Stop Testing' : '🔊 Test Voice'}</span>
            </button>
          </div>
        </div>

        {/* Collapsible Voice Settings Panel */}
        {showVoiceSettings && (
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/80 space-y-3 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-emerald-700" />
              <span>Voice AI Synthesis Settings</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Voice Dropdown */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Installed Voice:
                </label>
                {availableLanguageVoices.length > 0 ? (
                  <select
                    value={selectedVoiceURI || voiceInfo.voice?.voiceURI || ''}
                    onChange={(e) => setSelectedVoiceURI(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    {availableLanguageVoices.map((v) => (
                      <option key={v.voiceURI} value={v.voiceURI}>
                        {v.name} ({v.lang})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-white border border-amber-200 rounded-xl p-2 text-amber-800 font-medium">
                    No matching {LANGUAGE_DISPLAY[language].name} voice found in browser.
                  </div>
                )}
              </div>

              {/* Speech Speed Buttons */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Speech Speed (Rate):
                </label>
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                  {speedOptions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSpeechSpeed(s)}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        speechSpeed === s
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {(language === 'te' || language === 'hi') ? '0.85x recommended for clarity' : '1.0x standard'}
                </span>
              </div>

              {/* Pitch & Volume Info */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Audio Modulation:
                </label>
                <div className="bg-white p-2 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-700">
                  <div className="flex justify-between">
                    <span>Pitch:</span>
                    <span className="font-bold">1.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volume:</span>
                    <span className="font-bold">1.0 (100%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voice Unavailable Warning Banner */}
        {!voiceInfo.isAvailable && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">
                {language === 'te'
                  ? 'Telugu voice is not available on this device/browser.'
                  : language === 'hi'
                  ? 'Hindi voice is not available on this device/browser.'
                  : 'English voice is not available on this device/browser.'}
              </p>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                {voiceInfo.unavailableMessage ||
                  'Please install or enable a speech voice package in your Operating System settings (e.g. Windows Language Settings → Add Telugu/Hindi speech, or Android Text-to-Speech settings), or use Google Chrome/Microsoft Edge with Indian TTS enabled.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Diagnosis Context Pill */}
      {activeDiagnosisContext && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Active Diagnosis:</strong> {activeDiagnosisContext.crop} • {activeDiagnosisContext.disease} ({activeDiagnosisContext.severity} Severity)
            </span>
          </div>
          {onClearDiagnosisContext && (
            <button
              onClick={onClearDiagnosisContext}
              className="text-emerald-700 hover:text-emerald-900 font-bold underline text-[11px] shrink-0 ml-2"
            >
              Clear Context
            </button>
          )}
        </div>
      )}

      {/* Chat Messages Log Area */}
      <div className="glass-card bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl min-h-[420px] max-h-[580px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isAi = m.sender === 'assistant';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
            >
              {isAi && (
                <div className="w-8 h-8 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isAi
                    ? 'bg-slate-50 text-slate-800 border border-slate-200 shadow-xs'
                    : 'bg-emerald-700 text-white font-medium shadow-md'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
                
                <div className="flex items-center justify-between text-[10px] pt-1 opacity-80 border-t border-current/10">
                  <span>{m.timestamp}</span>
                  {isAi && (
                    <VoiceButton
                      textToSpeak={m.text}
                      language={language}
                      mode="speak"
                      speed={speechSpeed}
                      voiceURI={selectedVoiceURI || undefined}
                      className="p-1.5 bg-white/80 hover:bg-white text-emerald-900 border border-slate-200 text-[10px] shadow-2xs"
                    />
                  )}
                </div>
              </div>

              {!isAi && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-green-700 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {language === 'te'
                  ? 'వ్యవసాయ సమాచారాన్ని విశ్లేషిస్తున్నాము...'
                  : language === 'hi'
                  ? 'कृषि सलाह तैयार की जा रही है...'
                  : 'Analyzing agricultural context & formulating advisory...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp.query)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs text-slate-700 font-semibold transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Message & Voice Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm"
      >
        <VoiceButton
          onSpeechResult={handleVoiceInput}
          language={language}
          mode="listen"
        />

        <input
          type="text"
          placeholder={t.assistantPlaceholder}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="flex-1 px-3 py-2 text-xs sm:text-sm text-slate-800 bg-transparent focus:outline-none font-medium"
        />

        <button
          type="submit"
          disabled={!inputVal.trim() || isSending}
          className="p-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white rounded-xl transition-colors shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
