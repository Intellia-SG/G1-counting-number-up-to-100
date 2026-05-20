// ──────────────────────────────────────────────────
// Enhanced Audio Narration Engine
// Natural, teacher-like speech for young learners
// Voice: Alice (ElevenLabs) — copied from numberbound
// ──────────────────────────────────────────────────

let currentQueue = null;   // active narration queue id
let isSpeaking = false;
let currentAudio = null;   // Active HTMLAudioElement
let playId = 0;            // Counter to prevent delayed playback
const elevenLabsCache = new Map(); // Cache generated audio URLs

// Voice: Alice — Clear, Engaging Educator
const ELEVENLABS_VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2';

let audioMap = {};
try {
  import('./audioMap.js').then(module => {
    audioMap = module.audioMap || {};
  }).catch(() => {});
} catch (e) { }

// ─── Speech Styles (optimized for young learners 6-8 years) ──
const SPEECH_STYLES = {
  statement:     { rate: 0.85, pitch: 1.18, volume: 0.95 },
  question:      { rate: 0.78, pitch: 1.32, volume: 0.98 },
  encouragement: { rate: 0.90, pitch: 1.35, volume: 1.0 },
  emphasis:      { rate: 0.72, pitch: 1.25, volume: 0.98 },
  thinking:      { rate: 0.80, pitch: 1.15, volume: 0.92 },
  celebration:   { rate: 0.98, pitch: 1.42, volume: 1.0 },
  instruction:   { rate: 0.82, pitch: 1.20, volume: 0.95 },
};

// ─── ElevenLabs voice settings per style ──
const getElevenLabsSettings = (speechStyle) => {
  switch (speechStyle) {
    case 'celebration':
      return { stability: 0.12, similarity_boost: 0.45, style: 0.75, use_speaker_boost: true };
    case 'encouragement':
      return { stability: 0.16, similarity_boost: 0.50, style: 0.65, use_speaker_boost: true };
    case 'question':
      return { stability: 0.20, similarity_boost: 0.55, style: 0.55, use_speaker_boost: true };
    case 'emphasis':
      return { stability: 0.16, similarity_boost: 0.50, style: 0.60, use_speaker_boost: true };
    case 'thinking':
      return { stability: 0.24, similarity_boost: 0.60, style: 0.35, use_speaker_boost: true };
    default:
      return { stability: 0.20, similarity_boost: 0.55, style: 0.50, use_speaker_boost: true };
  }
};

// ─── Segment Helpers ──
export function say(text)       { return { text, style: 'statement' }; }
export function ask(text)       { return { text, style: 'question' }; }
export function cheer(text)     { return { text, style: 'encouragement' }; }
export function emphasize(text) { return { text, style: 'emphasis' }; }
export function think(text)     { return { text, style: 'thinking' }; }
export function celebrate(text) { return { text, style: 'celebration' }; }
export function instruct(text)  { return { text, style: 'instruction' }; }

// ─── Get Audio URL (pre-generated or dynamic) ──
export async function getAudioUrl(text, style) {
  // 1. Check pre-generated static audio
  if (audioMap && audioMap[text]) {
    return audioMap[text];
  }

  const cacheKey = `${text}_${style}`;
  if (elevenLabsCache.has(cacheKey)) {
    return elevenLabsCache.get(cacheKey);
  }

  // 2. Dynamic fallback — call ElevenLabs API
  const fetchPromise = (async () => {
    const localApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
    const voiceSettings = getElevenLabsSettings(style);

    let resp;
    try {
      // Try local API proxy first
      resp = await fetch('/api/elevenlabs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: ELEVENLABS_VOICE_ID, voiceSettings }),
      });
    } catch (e) {
      resp = null;
    }

    if (!resp || !resp.ok) {
      if (!localApiKey) {
        console.warn('[Audio] No API key and no proxy — cannot generate audio for:', text);
        return null;
      }
      try {
        resp = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': localApiKey },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: voiceSettings,
          }),
        });
      } catch (err) {
        console.error('[Audio] ElevenLabs direct call failed:', err);
        return null;
      }
    }

    if (!resp || !resp.ok) return null;

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    return url;
  })();

  elevenLabsCache.set(cacheKey, fetchPromise);
  return fetchPromise;
}

// ─── Stop all playback ──
export function stopNarration() {
  currentQueue = null;
  isSpeaking = false;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

// ─── Speak a single text ──
export async function speak(text, enabled = true, style = 'statement') {
  if (!enabled) return;
  stopNarration();

  const thisPlayId = ++playId;
  const url = await getAudioUrl(text, style);
  if (!url || thisPlayId !== playId) return;

  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => { currentAudio = null; resolve(); };
    audio.onerror = () => { currentAudio = null; resolve(); };
    audio.play().catch(() => { currentAudio = null; resolve(); });
  });
}

// ─── Narrate an array of segments sequentially ──
export async function narrate(segments, enabled = true) {
  if (!enabled || !segments || segments.length === 0) return;

  stopNarration();
  const queueId = Symbol();
  currentQueue = queueId;

  for (let i = 0; i < segments.length; i++) {
    if (currentQueue !== queueId) return; // cancelled

    const seg = segments[i];
    const url = await getAudioUrl(seg.text, seg.style);
    if (currentQueue !== queueId) return;
    if (!url) continue;

    // Preload next segment
    if (i + 1 < segments.length) {
      getAudioUrl(segments[i + 1].text, segments[i + 1].style);
    }

    await new Promise((resolve) => {
      const audio = new Audio(url);
      currentAudio = audio;
      isSpeaking = true;
      audio.onended = () => { isSpeaking = false; currentAudio = null; resolve(); };
      audio.onerror = () => { isSpeaking = false; currentAudio = null; resolve(); };
      audio.play().catch(() => { isSpeaking = false; currentAudio = null; resolve(); });
    });

    if (currentQueue !== queueId) return;
  }

  if (currentQueue === queueId) {
    currentQueue = null;
    isSpeaking = false;
  }
}

// ─── Preload narration segments ──
export function preloadNarration(segments) {
  if (!segments) return;
  segments.forEach(seg => getAudioUrl(seg.text, seg.style));
}

// ─── Tone effects ──
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function playTone(frequency, duration = 200) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration / 1000);
  } catch (e) { /* silent fallback */ }
}

export const sounds = {
  correct: () => { playTone(523, 150); setTimeout(() => playTone(659, 150), 150); setTimeout(() => playTone(784, 200), 300); },
  wrong: () => { playTone(220, 300); },
  badge: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 200), i * 150)); },
  click: () => playTone(440, 80),
  streak: () => { playTone(880, 100); setTimeout(() => playTone(1100, 150), 100); },
};
