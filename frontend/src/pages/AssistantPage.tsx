import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, DiseaseScanResult, LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { api } from '../services/api';
import { VoiceButton } from '../components/VoiceButton';
import {
  Send,
  Bot,
  User,
  Sparkles,
  FileCheck,
  TrendingUp,
  CloudSun,
  Trash2,
  Volume2
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
        text: "Sorry, I am having trouble reaching the assistant service. Please check your connection.",
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

  const quickPrompts = [
    { label: "💰 Tomato Market Price", query: "What is the current tomato market price?" },
    { label: "🌾 Paddy Blast Treatment", query: "What is the recommended treatment for rice blast?" },
    { label: "🌦️ Can I spray today?", query: "Is the weather suitable for chemical spraying today?" },
    { label: "☁️ Cotton Leaf Curl Vector", query: "How do I control whitefly in cotton?" }
  ];

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-700 to-emerald-500 text-white flex items-center justify-center shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900">{t.assistantHeader}</h1>
            <p className="text-xs text-slate-500 font-medium">{t.assistantSubtitle}</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors text-xs flex items-center gap-1 font-bold"
          title="Clear chat history"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
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
                
                <div className="flex items-center justify-between text-[10px] pt-1 opacity-70 border-t border-current/10">
                  <span>{m.timestamp}</span>
                  {isAi && (
                    <VoiceButton
                      textToSpeak={m.text}
                      language={language}
                      mode="speak"
                      className="p-1 bg-transparent hover:bg-slate-200 border-none text-[10px]"
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
              <span>Analyzing agricultural context & formulating advisory...</span>
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
