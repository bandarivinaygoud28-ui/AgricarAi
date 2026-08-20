import os
import re
import io
import asyncio
from typing import Dict, Any, Optional

# Supported Cloud Neural Voices
NEURAL_VOICES = {
    "te-IN": "te-IN-MohanNeural",      # Microsoft Mohan Neural (Telugu - India)
    "hi-IN": "hi-IN-MadhurNeural",     # Microsoft Madhur Neural (Hindi - India)
    "en-IN": "en-IN-NeerjaNeural"      # Microsoft Neerja Neural (English - India)
}

GTTS_LANG_MAP = {
    "te-IN": "te",
    "hi-IN": "hi",
    "en-IN": "en"
}

def normalize_language_tag(lang: str) -> str:
    """Normalize incoming language code to standard IETF tag."""
    if not lang:
        return "en-IN"
    l = lang.strip().lower().replace("_", "-")
    if l.startswith("te"):
        return "te-IN"
    if l.startswith("hi"):
        return "hi-IN"
    if l.startswith("en"):
        return "en-IN"
    return "en-IN"

def clean_text_for_tts(text: str) -> str:
    """
    Cleans markdown formatting and emojis while keeping pure Telugu, Hindi, and English Unicode text.
    """
    if not text:
        return ""
    
    # Remove markdown bold/italics
    cleaned = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)
    cleaned = re.sub(r'\*([^*]+)\*', r'\1', cleaned)
    cleaned = re.sub(r'__([^_]+)__', r'\1', cleaned)
    cleaned = re.sub(r'_([^_]+)_', r'\1', cleaned)
    
    # Remove markdown headers
    cleaned = re.sub(r'^#{1,6}\s+', '', cleaned, flags=re.MULTILINE)
    
    # Remove bullet markers
    cleaned = re.sub(r'^\s*[-•*+]\s+', '', cleaned, flags=re.MULTILINE)
    
    # Remove numbered list markers
    cleaned = re.sub(r'^\s*\d+\.\s+', '', cleaned, flags=re.MULTILINE)
    
    # Remove URLs
    cleaned = re.sub(r'https?://\S+', '', cleaned)
    
    # Remove emojis and special icons that might confuse TTS
    cleaned = re.sub(r'[🚨💊💰🌾🌦️🚜🤖📊📈⚠️📌✔️❌💡🍅🍂👨🌾]', '', cleaned)
    
    # Normalize whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned

async def _synthesize_edge_tts(text: str, voice: str) -> bytes:
    """Synthesize speech using Microsoft Edge Neural TTS."""
    import edge_tts
    communicate = edge_tts.Communicate(text, voice)
    audio_chunks = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_chunks.append(chunk["data"])
    return b"".join(audio_chunks)

def _synthesize_gtts(text: str, lang_code: str) -> bytes:
    """Fallback synthesis using gTTS (Google Translate TTS)."""
    from gtts import gTTS
    tts = gTTS(text=text, lang=lang_code, slow=False)
    fp = io.BytesIO()
    tts.write_to_fp(fp)
    fp.seek(0)
    return fp.read()

async def synthesize_speech(text: str, language: str = "te-IN") -> bytes:
    """
    Synthesizes speech using cloud neural voices for Telugu, Hindi, and Indian English.
    Returns audio/mpeg MP3 bytes.
    """
    norm_lang = normalize_language_tag(language)
    clean_text = clean_text_for_tts(text)
    
    if not clean_text:
        raise ValueError("Text to synthesize is empty after cleaning.")

    voice_name = NEURAL_VOICES.get(norm_lang, "en-IN-NeerjaNeural")

    # 1. Primary: Edge Neural TTS (High-fidelity Indian Neural Voices)
    try:
        audio_data = await _synthesize_edge_tts(clean_text, voice_name)
        if audio_data and len(audio_data) > 0:
            return audio_data
    except Exception as e:
        print(f"Edge TTS synthesis warning: {e}. Falling back to secondary cloud TTS...")

    # 2. Secondary Fallback: gTTS
    try:
        gtts_lang = GTTS_LANG_MAP.get(norm_lang, "en")
        # Run gTTS in executor since it is synchronous
        loop = asyncio.get_event_loop()
        audio_data = await loop.run_in_executor(None, _synthesize_gtts, clean_text, gtts_lang)
        if audio_data and len(audio_data) > 0:
            return audio_data
    except Exception as e:
        print(f"gTTS fallback error: {e}")

    raise RuntimeError(f"Cloud TTS synthesis failed for language {norm_lang}.")

def get_voice_info(language: str = "te-IN") -> Dict[str, Any]:
    """Returns metadata about the active cloud neural voice for the specified language."""
    norm_lang = normalize_language_tag(language)
    voice_name = NEURAL_VOICES.get(norm_lang, "en-IN-NeerjaNeural")
    return {
        "language": norm_lang,
        "voice_name": voice_name,
        "provider": "Cloud Neural Speech (Azure / Edge TTS)",
        "is_available": True
    }
