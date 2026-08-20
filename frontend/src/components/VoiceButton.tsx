import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Pause, Play, Loader2, AlertCircle } from 'lucide-react';
import { LanguageCode } from '../types';
import { translations } from '../utils/translations';
import { speechService, SpeechState } from '../utils/speechService';

interface VoiceButtonProps {
  onSpeechResult?: (transcript: string) => void;
  textToSpeak?: string;
  language: LanguageCode;
  mode?: 'listen' | 'speak';
  speed?: number;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onSpeechResult,
  textToSpeak,
  language,
  mode = 'listen',
  speed,
  className = ""
}) => {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [speechState, setSpeechState] = useState<SpeechState>(speechService.getState());
  const [isCurrentSpeaker, setIsCurrentSpeaker] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Subscribe to speechService state
  useEffect(() => {
    const unsubscribe = speechService.onStateChange((state) => {
      setSpeechState(state);
      if (state === 'idle') {
        setIsCurrentSpeaker(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Reset speaker on language change
  useEffect(() => {
    setIsCurrentSpeaker(false);
    setErrorMessage(null);
  }, [language]);

  const getLangTag = (l: LanguageCode) => {
    switch (l) {
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  };

  const handleToggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
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

    if (isCurrentSpeaker && (speechState === 'speaking' || speechState === 'generating')) {
      speechService.stop();
      setIsCurrentSpeaker(false);
      return;
    }

    if (isCurrentSpeaker && speechState === 'paused') {
      speechService.resume();
      return;
    }

    setErrorMessage(null);
    setIsCurrentSpeaker(true);

    await speechService.speak(textToSpeak, language, {
      speed,
      onStart: () => setIsCurrentSpeaker(true),
      onEnd: () => setIsCurrentSpeaker(false),
      onError: (err) => {
        setIsCurrentSpeaker(false);
        setErrorMessage(err);
      }
    });
  };

  const handlePauseResume = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speechState === 'speaking') {
      speechService.pause();
    } else if (speechState === 'paused') {
      speechService.resume();
    }
  };

  if (mode === 'speak') {
    const isThisButtonActive = isCurrentSpeaker && speechState !== 'idle';
    const isGeneratingThis = isCurrentSpeaker && speechState === 'generating';
    const isSpeakingThis = isCurrentSpeaker && speechState === 'speaking';
    const isPausedThis = isCurrentSpeaker && speechState === 'paused';

    return (
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={handleToggleSpeak}
          disabled={isGeneratingThis}
          className={`p-2 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
            isSpeakingThis
              ? 'bg-emerald-600 text-white border-emerald-600 animate-pulse ring-2 ring-emerald-300'
              : isGeneratingThis
              ? 'bg-amber-50 text-amber-800 border-amber-300 cursor-wait'
              : isPausedThis
              ? 'bg-amber-500 text-white border-amber-600'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
          } ${className}`}
          title={isThisButtonActive ? (t.voiceStop || 'Stop Voice') : (t.voiceReadout || 'Voice Readout')}
        >
          {isGeneratingThis ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
              <span>{t.voiceGenerating || 'Generating voice...'}</span>
            </>
          ) : isSpeakingThis ? (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>{t.voiceStop || 'Stop Voice'}</span>
            </>
          ) : isPausedThis ? (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>{t.voiceResume || 'Resume'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.voiceReadout || 'Voice Readout'}</span>
            </>
          )}
        </button>

        {/* Pause/Resume secondary button when active */}
        {isSpeakingThis && (
          <button
            type="button"
            onClick={handlePauseResume}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold transition-all shadow-2xs"
            title={t.voicePause || 'Pause'}
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        )}

        {errorMessage && (
          <span className="text-red-500 text-[10px] flex items-center gap-0.5" title={errorMessage}>
            <AlertCircle className="w-3 h-3" /> {t.error || 'Error'}
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
      title={t.voiceInput || 'Voice Input'}
    >
      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      <span>{isListening ? (t.voiceListening || 'Listening...') : (t.voiceInput || 'Voice Input')}</span>
    </button>
  );
};
