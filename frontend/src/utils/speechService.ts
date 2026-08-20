import { LanguageCode } from '../types';
import { api } from '../services/api';

export type SpeechState = 'idle' | 'generating' | 'speaking' | 'paused';

export interface VoiceInfo {
  voiceName: string;
  lang: string;
  isAvailable: boolean;
  provider: string;
  unavailableMessage?: string;
}

// Voice test prompts
export const VOICE_TEST_PROMPTS: Record<LanguageCode, string> = {
  te: "నమస్కారం రైతు గారు. AgriCare AI మీ వ్యవసాయానికి సహాయం చేస్తుంది.",
  hi: "नमस्ते किसान जी। AgriCare AI आपकी खेती में सहायता करेगा।",
  en: "Hello farmer. AgriCare AI is ready to help you."
};

// Language display metadata
export const LANGUAGE_DISPLAY: Record<LanguageCode, { name: string; nativeName: string; tag: string }> = {
  te: { name: 'Telugu', nativeName: 'తెలుగు', tag: 'te-IN' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', tag: 'hi-IN' },
  en: { name: 'English', nativeName: 'English (India)', tag: 'en-IN' }
};

export const NEURAL_VOICE_NAMES: Record<LanguageCode, string> = {
  te: 'Microsoft Mohan (Telugu Neural)',
  hi: 'Microsoft Madhur (Hindi Neural)',
  en: 'Microsoft Neerja (English India Neural)'
};

class SpeechService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentAudioUrl: string | null = null;
  private state: SpeechState = 'idle';
  private currentText: string = '';
  private currentLanguage: LanguageCode = 'en';
  private stateListeners: Array<(state: SpeechState) => void> = [];
  private activeAbortController: AbortController | null = null;
  private activeRequestId: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stop();
      });
    }
  }

  public getLanguageTag(lang: LanguageCode): string {
    switch (lang) {
      case 'te': return 'te-IN';
      case 'hi': return 'hi-IN';
      default: return 'en-IN';
    }
  }

  public getState(): SpeechState {
    return this.state;
  }

  public isSpeaking(): boolean {
    return this.state === 'speaking';
  }

  public isGenerating(): boolean {
    return this.state === 'generating';
  }

  public isPaused(): boolean {
    return this.state === 'paused';
  }

  public getCurrentLanguage(): LanguageCode {
    return this.currentLanguage;
  }

  public onStateChange(listener: (state: SpeechState) => void): () => void {
    this.stateListeners.push(listener);
    listener(this.state);
    return () => {
      this.stateListeners = this.stateListeners.filter(l => l !== listener);
    };
  }

  private setState(newState: SpeechState) {
    this.state = newState;
    this.stateListeners.forEach(listener => {
      try {
        listener(newState);
      } catch (e) {
        console.error('Speech state listener error:', e);
      }
    });
  }

  /**
   * Called immediately whenever the global application language changes.
   * Cancels in-flight requests, stops playback, revokes object URLs, and resets state to idle.
   */
  public onLanguageChange(newLang: LanguageCode) {
    // 1. Invalidate any in-flight request
    this.activeRequestId++;
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {}
      this.activeAbortController = null;
    }

    // 2. Stop and clear any active audio element
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch {}
      this.currentAudio = null;
    }

    // 3. Clean up active Object URL
    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {}
      this.currentAudioUrl = null;
    }

    // 4. Cancel browser speech synthesis if active
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // 5. Update language and reset state to idle
    this.currentLanguage = newLang;
    this.currentText = '';
    this.setState('idle');
  }

  /**
   * Returns current active voice metadata for the selected language.
   */
  public getVoiceInfo(language: LanguageCode): VoiceInfo {
    const tag = this.getLanguageTag(language);
    return {
      voiceName: NEURAL_VOICE_NAMES[language] || `${LANGUAGE_DISPLAY[language].name} Neural Voice`,
      lang: tag,
      isAvailable: true,
      provider: 'Cloud Neural TTS (Azure AI / Microsoft Neural)'
    };
  }

  /**
   * Cleans text for speech synthesis without modifying Unicode characters.
   */
  public cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^\s*[-•*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[🚨💊💰🌾🌦️🚜🤖📊📈⚠️📌✔️❌💡🍅🍂👨🌾]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Primary Cloud Text-to-Speech synthesis and playback.
   */
  public async speak(
    text: string,
    language: LanguageCode,
    options: {
      speed?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<boolean> {
    const cleaned = this.cleanText(text);
    if (!cleaned) {
      options.onError?.("No text provided to read.");
      return false;
    }

    // 1. Cancel previous request and audio
    this.stop();

    const requestId = ++this.activeRequestId;
    this.activeAbortController = new AbortController();
    const signal = this.activeAbortController.signal;

    this.currentText = cleaned;
    this.currentLanguage = language;
    this.setState('generating');

    const langTag = this.getLanguageTag(language);

    try {
      // 2. Fetch audio blob from backend Cloud Neural TTS
      const audioBlob = await api.synthesizeVoice(cleaned, langTag, signal);

      // Check if this request was superseded while fetch was in flight
      if (requestId !== this.activeRequestId || signal.aborted) {
        return false;
      }

      // 3. Create fresh Object URL
      const blobUrl = URL.createObjectURL(audioBlob);
      if (this.currentAudioUrl) {
        try {
          URL.revokeObjectURL(this.currentAudioUrl);
        } catch {}
      }
      this.currentAudioUrl = blobUrl;

      // 4. Create and play Audio
      return new Promise<boolean>((resolve) => {
        try {
          const audio = new Audio(blobUrl);
          this.currentAudio = audio;

          // Apply speed if specified
          if (options.speed && options.speed > 0) {
            audio.playbackRate = options.speed;
          }

          audio.onplay = () => {
            if (requestId === this.activeRequestId) {
              this.setState('speaking');
              options.onStart?.();
            }
          };

          audio.onpause = () => {
            if (requestId === this.activeRequestId && audio.currentTime > 0 && !audio.ended) {
              this.setState('paused');
            }
          };

          audio.onended = () => {
            if (requestId === this.activeRequestId) {
              this.setState('idle');
              this.currentAudio = null;
              if (this.currentAudioUrl) {
                try {
                  URL.revokeObjectURL(this.currentAudioUrl);
                } catch {}
                this.currentAudioUrl = null;
              }
              options.onEnd?.();
              resolve(true);
            }
          };

          audio.onerror = (e) => {
            console.error('Audio playback error:', e);
            if (requestId === this.activeRequestId) {
              this.setState('idle');
              this.currentAudio = null;
              if (this.currentAudioUrl) {
                try {
                  URL.revokeObjectURL(this.currentAudioUrl);
                } catch {}
                this.currentAudioUrl = null;
              }
              const errMsg = "Voice service temporarily unavailable. Please try again.";
              options.onError?.(errMsg);
              resolve(false);
            }
          };

          audio.play().catch(playErr => {
            console.warn('Audio play() error:', playErr);
            if (requestId === this.activeRequestId) {
              this.setState('idle');
              const errMsg = "Playback blocked by browser autoplay policy. Please tap Voice Readout again.";
              options.onError?.(errMsg);
              resolve(false);
            }
          });
        } catch (e) {
          if (requestId === this.activeRequestId) {
            this.setState('idle');
            options.onError?.("Voice service temporarily unavailable. Please try again.");
            resolve(false);
          }
        }
      });
    } catch (cloudErr: any) {
      if (requestId !== this.activeRequestId || signal.aborted) {
        return false;
      }

      console.warn('Cloud TTS synthesis error:', cloudErr);

      // Fallback only for English if browser has an authentic voice
      if (language === 'en') {
        const fallbackSuccess = await this.speakWithBrowserFallback(cleaned, language, options, requestId);
        if (fallbackSuccess) {
          return true;
        }
      }

      // For Telugu and Hindi, NEVER fall back to English voice!
      this.setState('idle');
      const errMsg = "Voice service temporarily unavailable. Please try again.";
      options.onError?.(errMsg);
      return false;
    }
  }

  /**
   * Browser SpeechSynthesis fallback ONLY when an authentic matching voice exists.
   * NEVER falls back to an English voice for Telugu or Hindi!
   */
  private speakWithBrowserFallback(
    text: string,
    language: LanguageCode,
    options: {
      speed?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    },
    requestId: number
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve(false);
        return;
      }

      const voices = window.speechSynthesis.getVoices() || [];
      let matchingVoice: SpeechSynthesisVoice | undefined;

      if (language === 'te') {
        matchingVoice = voices.find(v => {
          const l = (v.lang || '').toLowerCase();
          const n = (v.name || '').toLowerCase();
          return l.startsWith('te') || n.includes('telugu');
        });
      } else if (language === 'hi') {
        matchingVoice = voices.find(v => {
          const l = (v.lang || '').toLowerCase();
          const n = (v.name || '').toLowerCase();
          return l.startsWith('hi') || n.includes('hindi') || n.includes('madhur') || n.includes('swara');
        });
      } else {
        matchingVoice = voices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
      }

      // If no language-matching voice exists, do not use browser TTS
      if (!matchingVoice) {
        resolve(false);
        return;
      }

      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = matchingVoice;
        utterance.lang = matchingVoice.lang;
        utterance.rate = options.speed || ((language === 'te' || language === 'hi') ? 0.85 : 0.95);

        utterance.onstart = () => {
          if (requestId === this.activeRequestId) {
            this.setState('speaking');
            options.onStart?.();
          }
        };

        utterance.onend = () => {
          if (requestId === this.activeRequestId) {
            this.setState('idle');
            options.onEnd?.();
            resolve(true);
          }
        };

        utterance.onerror = () => {
          if (requestId === this.activeRequestId) {
            this.setState('idle');
            resolve(false);
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch {
        resolve(false);
      }
    });
  }

  public pause() {
    if (this.currentAudio && this.state === 'speaking') {
      this.currentAudio.pause();
      this.setState('paused');
    }
  }

  public resume() {
    if (this.currentAudio && this.state === 'paused') {
      this.currentAudio.play().then(() => {
        this.setState('speaking');
      }).catch(e => {
        console.warn('Resume error:', e);
      });
    }
  }

  public stop() {
    this.activeRequestId++;
    if (this.activeAbortController) {
      try {
        this.activeAbortController.abort();
      } catch {}
      this.activeAbortController = null;
    }

    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio.src = '';
      } catch (e) {
        console.warn('Audio stop error:', e);
      }
      this.currentAudio = null;
    }

    if (this.currentAudioUrl) {
      try {
        URL.revokeObjectURL(this.currentAudioUrl);
      } catch {}
      this.currentAudioUrl = null;
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    this.setState('idle');
  }

  public testVoice(
    language: LanguageCode,
    options: {
      speed?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<boolean> {
    const testText = VOICE_TEST_PROMPTS[language] || VOICE_TEST_PROMPTS.en;
    return this.speak(testText, language, options);
  }
}

export const speechService = new SpeechService();
