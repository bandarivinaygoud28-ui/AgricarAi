import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { speechService } from '../utils/speechService';

interface VoiceButtonProps {
  onSpeechResult?: (transcript: string) => void;
  textToSpeak?: string;
  language: LanguageCode;
  mode?: 'listen' | 'speak';
  speed?: number;
  voiceURI?: string;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onSpeechResult,
  textToSpeak,
  language,
  mode = 'listen',
  speed,
  voiceURI,
  className = ""
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for global speech service status changes
    const unsubscribe = speechService.onSpeakingStatusChange((speaking) => {
      if (!speaking) {
        setIsSpeaking(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const getLangTag = (l: LanguageCode) => {
    switch (l) {
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  };

  const handleToggleListen = () => {
    // Check Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = getLangTag(language);
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (onSpeechResult && transcript) {
          onSpeechResult(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleToggleSpeak = async () => {
    if (!textToSpeak) return;

    if (isSpeaking) {
      speechService.cancel();
      setIsSpeaking(false);
      return;
    }

    setVoiceError(null);

    // Verify voice availability first
    const voiceInfo = speechService.getBestVoice(language, voiceURI);
    if (!voiceInfo.isAvailable || !voiceInfo.voice) {
      const msg =
        voiceInfo.unavailableMessage ||
        (language === 'te'
          ? 'Telugu voice is not available on this device/browser. Please install or enable a Telugu speech voice, or use a browser/device with Telugu TTS support.'
          : language === 'hi'
          ? 'Hindi voice is not available on this device/browser. Please install or enable a Hindi speech voice, or use a browser/device with Hindi TTS support.'
          : 'English voice is not available on this device/browser.');
      
      setVoiceError(msg);
      alert(msg);
      return;
    }

    setIsSpeaking(true);
    await speechService.speak(textToSpeak, language, {
      speed,
      voiceURI,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (err) => {
        setIsSpeaking(false);
        setVoiceError(err);
      }
    });
  };

  if (mode === 'speak') {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleToggleSpeak}
          className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
            isSpeaking
              ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse ring-2 ring-emerald-300'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-xs'
          } ${className}`}
          title={isSpeaking ? 'Stop speaking' : 'Listen to speech readout'}
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          <span>{isSpeaking ? 'Stop Voice' : 'Voice Readout'}</span>
        </button>

        {voiceError && (
          <span
            className="absolute left-0 -top-8 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded shadow-md whitespace-nowrap z-20 flex items-center gap-1"
            title={voiceError}
          >
            <AlertCircle className="w-3 h-3" /> Voice unavailable
          </span>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggleListen}
      className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
        isListening
          ? 'bg-red-500 text-white border-red-600 animate-bounce shadow-lg ring-4 ring-red-100'
          : 'bg-green-700 text-white hover:bg-green-800 border-green-800 shadow-sm'
      } ${className}`}
      title="Tap to speak"
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      <span>{isListening ? 'Listening...' : 'Voice Input'}</span>
    </button>
  );
};
