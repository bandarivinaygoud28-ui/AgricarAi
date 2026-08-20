import { LanguageCode } from '../types';

export interface VoiceInfo {
  voice: SpeechSynthesisVoice | null;
  voiceName: string;
  lang: string;
  isAvailable: boolean;
  unavailableMessage?: string;
}

export interface VoiceSettings {
  speed: number;
  pitch: number;
  volume: number;
  selectedVoiceURI?: string;
}

// Voice test sentences specified in requirements
export const VOICE_TEST_PROMPTS: Record<LanguageCode, string> = {
  te: "నమస్కారం రైతు గారు. మీ వ్యవసాయానికి AgriCare AI సహాయం చేస్తుంది.",
  hi: "नमस्ते किसान जी। AgriCare AI आपकी खेती में सहायता करेगा।",
  en: "Hello farmer. AgriCare AI is here to help you with farming."
};

// Language display names
export const LANGUAGE_DISPLAY: Record<LanguageCode, { name: string; nativeName: string; tag: string }> = {
  te: { name: 'Telugu', nativeName: 'తెలుగు', tag: 'te-IN' },
  hi: { name: 'Hindi', nativeName: 'हिन्दी', tag: 'hi-IN' },
  en: { name: 'English', nativeName: 'English (India)', tag: 'en-IN' }
};

class SpeechService {
  private voices: SpeechSynthesisVoice[] = [];
  private isLoaded = false;
  private voiceChangeListeners: Array<(voices: SpeechSynthesisVoice[]) => void> = [];
  private currentSpeakSessionId = 0;
  private isSpeakingInternal = false;
  private speakingStatusListeners: Array<(isSpeaking: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  private initVoices() {
    const updateVoices = () => {
      try {
        const available = window.speechSynthesis.getVoices() || [];
        if (available.length > 0) {
          this.voices = available;
          this.isLoaded = true;
          this.notifyVoiceChangeListeners();
        }
      } catch (e) {
        console.warn('Speech synthesis getVoices error:', e);
      }
    };

    // Initial check
    updateVoices();

    // Event listener for voice changes
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        updateVoices();
      };
      if (typeof window.speechSynthesis.addEventListener === 'function') {
        window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      }
      
      // Fallback timer in case onvoiceschanged does not trigger immediately
      setTimeout(updateVoices, 250);
      setTimeout(updateVoices, 1000);
    }
  }

  public onVoicesChanged(listener: (voices: SpeechSynthesisVoice[]) => void): () => void {
    this.voiceChangeListeners.push(listener);
    if (this.isLoaded && this.voices.length > 0) {
      listener(this.voices);
    }
    return () => {
      this.voiceChangeListeners = this.voiceChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyVoiceChangeListeners() {
    this.voiceChangeListeners.forEach(listener => {
      try {
        listener(this.voices);
      } catch (e) {
        console.error('Error in voice change listener:', e);
      }
    });
  }

  public onSpeakingStatusChange(listener: (isSpeaking: boolean) => void): () => void {
    this.speakingStatusListeners.push(listener);
    return () => {
      this.speakingStatusListeners = this.speakingStatusListeners.filter(l => l !== listener);
    };
  }

  private setSpeakingStatus(speaking: boolean) {
    this.isSpeakingInternal = speaking;
    this.speakingStatusListeners.forEach(listener => {
      try {
        listener(speaking);
      } catch (e) {
        console.error('Error in speaking status listener:', e);
      }
    });
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && typeof window !== 'undefined' && window.speechSynthesis) {
      this.voices = window.speechSynthesis.getVoices() || [];
    }
    return this.voices;
  }

  /**
   * Get all voices matching a specific language code.
   */
  public getVoicesForLanguage(language: LanguageCode): SpeechSynthesisVoice[] {
    const all = this.getAvailableVoices();
    if (language === 'te') {
      return all.filter(v => {
        const lang = (v.lang || '').toLowerCase().replace('_', '-');
        const name = (v.name || '').toLowerCase();
        return lang === 'te-in' || lang.startsWith('te') || name.includes('telugu') || name.includes('te-in');
      });
    }

    if (language === 'hi') {
      return all.filter(v => {
        const lang = (v.lang || '').toLowerCase().replace('_', '-');
        const name = (v.name || '').toLowerCase();
        return (
          lang === 'hi-in' ||
          lang.startsWith('hi') ||
          name.includes('hindi') ||
          name.includes('hi-in') ||
          name.includes('kalpana') ||
          name.includes('swara') ||
          name.includes('madhur')
        );
      });
    }

    // English: All English voices, prioritizing Indian English
    return all.filter(v => {
      const lang = (v.lang || '').toLowerCase().replace('_', '-');
      const name = (v.name || '').toLowerCase();
      return lang.startsWith('en') || name.includes('english');
    });
  }

  /**
   * Finds the best voice for the target language according to priority rules.
   * STRICT: NEVER returns an English voice for Telugu or Hindi text.
   */
  public getBestVoice(language: LanguageCode, preferredURI?: string): VoiceInfo {
    const allVoices = this.getAvailableVoices();

    if (language === 'te') {
      // 1. If preferred URI provided and matches Telugu
      if (preferredURI) {
        const pref = allVoices.find(v => v.voiceURI === preferredURI);
        if (pref && ((pref.lang || '').toLowerCase().startsWith('te') || pref.name.toLowerCase().includes('telugu'))) {
          return { voice: pref, voiceName: pref.name, lang: pref.lang, isAvailable: true };
        }
      }

      // 2. Exact 'te-IN' or 'te_IN'
      const exactTe = allVoices.find(v => {
        const l = (v.lang || '').toLowerCase().replace('_', '-');
        return l === 'te-in';
      });
      if (exactTe) {
        return { voice: exactTe, voiceName: exactTe.name, lang: exactTe.lang, isAvailable: true };
      }

      // 3. Language starting with 'te'
      const prefixTe = allVoices.find(v => (v.lang || '').toLowerCase().startsWith('te'));
      if (prefixTe) {
        return { voice: prefixTe, voiceName: prefixTe.name, lang: prefixTe.lang, isAvailable: true };
      }

      // 4. Name containing 'telugu'
      const nameTe = allVoices.find(v => (v.name || '').toLowerCase().includes('telugu'));
      if (nameTe) {
        return { voice: nameTe, voiceName: nameTe.name, lang: nameTe.lang, isAvailable: true };
      }

      // NOT AVAILABLE: Never fallback to English for Telugu!
      return {
        voice: null,
        voiceName: '⚠️ Telugu voice unavailable',
        lang: 'te-IN',
        isAvailable: false,
        unavailableMessage: 'Telugu voice is not available on this device/browser. Please install or enable a Telugu speech voice, or use a browser/device with Telugu TTS support.'
      };
    }

    if (language === 'hi') {
      // 1. If preferred URI provided and matches Hindi
      if (preferredURI) {
        const pref = allVoices.find(v => v.voiceURI === preferredURI);
        if (pref && ((pref.lang || '').toLowerCase().startsWith('hi') || pref.name.toLowerCase().includes('hindi'))) {
          return { voice: pref, voiceName: pref.name, lang: pref.lang, isAvailable: true };
        }
      }

      // 2. Exact 'hi-IN' or 'hi_IN'
      const exactHi = allVoices.find(v => {
        const l = (v.lang || '').toLowerCase().replace('_', '-');
        return l === 'hi-in';
      });
      if (exactHi) {
        return { voice: exactHi, voiceName: exactHi.name, lang: exactHi.lang, isAvailable: true };
      }

      // 3. Language starting with 'hi'
      const prefixHi = allVoices.find(v => (v.lang || '').toLowerCase().startsWith('hi'));
      if (prefixHi) {
        return { voice: prefixHi, voiceName: prefixHi.name, lang: prefixHi.lang, isAvailable: true };
      }

      // 4. Name containing 'hindi' or known Indian Hindi voice names
      const nameHi = allVoices.find(v => {
        const n = (v.name || '').toLowerCase();
        return n.includes('hindi') || n.includes('kalpana') || n.includes('swara') || n.includes('madhur');
      });
      if (nameHi) {
        return { voice: nameHi, voiceName: nameHi.name, lang: nameHi.lang, isAvailable: true };
      }

      // NOT AVAILABLE: Never fallback to English for Hindi!
      return {
        voice: null,
        voiceName: '⚠️ Hindi voice unavailable',
        lang: 'hi-IN',
        isAvailable: false,
        unavailableMessage: 'Hindi voice is not available on this device/browser. Please install or enable a Hindi speech voice, or use a browser/device with Hindi TTS support.'
      };
    }

    // English Language handling
    if (preferredURI) {
      const pref = allVoices.find(v => v.voiceURI === preferredURI);
      if (pref && ((pref.lang || '').toLowerCase().startsWith('en') || pref.name.toLowerCase().includes('english'))) {
        return { voice: pref, voiceName: pref.name, lang: pref.lang, isAvailable: true };
      }
    }

    // 1. Prefer Indian English voice (en-IN or name containing India / Ravi / Heera / Neerja / Prabhat)
    const indianEn = allVoices.find(v => {
      const l = (v.lang || '').toLowerCase().replace('_', '-');
      const n = (v.name || '').toLowerCase();
      return l === 'en-in' || (l.startsWith('en') && (n.includes('india') || n.includes('ravi') || n.includes('heera') || n.includes('neerja') || n.includes('prabhat')));
    });
    if (indianEn) {
      return { voice: indianEn, voiceName: indianEn.name, lang: indianEn.lang, isAvailable: true };
    }

    // 2. Fallback to en-US or any English voice
    const anyEn = allVoices.find(v => (v.lang || '').toLowerCase().startsWith('en'));
    if (anyEn) {
      return { voice: anyEn, voiceName: anyEn.name, lang: anyEn.lang, isAvailable: true };
    }

    // 3. Any default system voice as last resort for English
    const defVoice = allVoices.find(v => v.default) || allVoices[0] || null;
    return {
      voice: defVoice,
      voiceName: defVoice ? defVoice.name : 'System Default',
      lang: defVoice ? defVoice.lang : 'en-IN',
      isAvailable: !!defVoice
    };
  }

  /**
   * Cleans text for speech synthesis without modifying Unicode Telugu or Hindi characters.
   * Strips markdown formatting (bold, headers, bullets, URLs, emojis) that might cause TTS glitches.
   */
  public cleanTextForSpeech(text: string): string {
    if (!text) return '';
    return text
      // Remove markdown bold/italic asterisks & underscores
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove markdown headers
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bullet markdown symbols
      .replace(/^\s*[-•*+]\s+/gm, '')
      // Remove numbered list markers like "1. "
      .replace(/^\s*\d+\.\s+/gm, '')
      // Replace code blocks and inline code
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Clean up common symbol noise
      .replace(/[🚨💊💰🌾🌦️🚜🤖📊📈⚠️📌✔️❌💡]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Splits long text into natural sentence chunks for smooth utterance playback.
   * Prevents browser speech synthesis engine cutoffs.
   */
  public splitIntoChunks(text: string): string[] {
    const cleaned = this.cleanTextForSpeech(text);
    if (!cleaned) return [];

    // Split on full stops, question marks, exclamation marks, Hindi danda (।), or newlines
    const rawSentences = cleaned.split(/(?<=[.?!।\n])\s+/);
    const chunks: string[] = [];

    let currentChunk = '';
    for (const s of rawSentences) {
      const sentence = s.trim();
      if (!sentence) continue;

      if ((currentChunk + ' ' + sentence).trim().length > 140 && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence;
      } else {
        currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
      }
    }

    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [cleaned];
  }

  /**
   * Cancels any ongoing speech.
   */
  public cancel() {
    this.currentSpeakSessionId++;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('speechSynthesis.cancel error:', e);
      }
    }
    this.setSpeakingStatus(false);
  }

  /**
   * Speaks text using language-specific voice and sequential chunking.
   */
  public speak(
    text: string,
    language: LanguageCode,
    options: {
      speed?: number;
      pitch?: number;
      volume?: number;
      voiceURI?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        const msg = 'Speech synthesis is not supported on this browser.';
        options.onError?.(msg);
        resolve(false);
        return;
      }

      // Cancel any previous speech
      this.cancel();

      const voiceInfo = this.getBestVoice(language, options.voiceURI);

      if (!voiceInfo.isAvailable || !voiceInfo.voice) {
        const errorMsg =
          voiceInfo.unavailableMessage ||
          `${LANGUAGE_DISPLAY[language].name} voice is not available on this device.`;
        options.onError?.(errorMsg);
        resolve(false);
        return;
      }

      const chunks = this.splitIntoChunks(text);
      if (chunks.length === 0) {
        resolve(true);
        return;
      }

      const sessionId = ++this.currentSpeakSessionId;
      this.setSpeakingStatus(true);
      options.onStart?.();

      let chunkIndex = 0;

      const speakNextChunk = () => {
        if (sessionId !== this.currentSpeakSessionId) {
          // Speak session was cancelled or superseded
          resolve(false);
          return;
        }

        if (chunkIndex >= chunks.length) {
          this.setSpeakingStatus(false);
          options.onEnd?.();
          resolve(true);
          return;
        }

        const chunkText = chunks[chunkIndex++];
        const utterance = new SpeechSynthesisUtterance(chunkText);

        utterance.voice = voiceInfo.voice;
        utterance.lang = voiceInfo.lang;
        
        // Speed default: 0.85x for Telugu/Hindi, 0.95x for English if not overridden
        const defaultRate = (language === 'te' || language === 'hi') ? 0.85 : 0.95;
        utterance.rate = options.speed !== undefined ? options.speed : defaultRate;
        utterance.pitch = options.pitch !== undefined ? options.pitch : 1.0;
        utterance.volume = options.volume !== undefined ? options.volume : 1.0;

        utterance.onend = () => {
          if (sessionId === this.currentSpeakSessionId) {
            speakNextChunk();
          }
        };

        utterance.onerror = (e) => {
          console.warn('Speech synthesis chunk error:', e);
          if (sessionId === this.currentSpeakSessionId) {
            // Attempt to continue with next chunk even if one chunk encountered a non-fatal error
            if (chunkIndex < chunks.length) {
              speakNextChunk();
            } else {
              this.setSpeakingStatus(false);
              options.onError?.('Speech playback encountered an error.');
              resolve(false);
            }
          }
        };

        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('speechSynthesis.speak exception:', e);
          this.setSpeakingStatus(false);
          options.onError?.('Failed to initiate speech playback.');
          resolve(false);
        }
      };

      // Start speaking first chunk
      speakNextChunk();
    });
  }

  /**
   * Tests the voice for the selected language using the specified standard prompt.
   */
  public testVoice(
    language: LanguageCode,
    options: {
      speed?: number;
      voiceURI?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (error: string) => void;
    } = {}
  ): Promise<boolean> {
    const testText = VOICE_TEST_PROMPTS[language] || VOICE_TEST_PROMPTS.en;
    return this.speak(testText, language, options);
  }

  public isSpeaking(): boolean {
    return this.isSpeakingInternal;
  }
}

export const speechService = new SpeechService();
