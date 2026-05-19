import audioMap from './audioMap';

let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

export function getAudioUrl(text) {
  if (audioMap[text]) {
    return audioMap[text];
  }
  return null;
}

const audioCache = {};

export function preloadNarration(text) {
  const url = getAudioUrl(text);
  if (url && !audioCache[url]) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    audioCache[url] = audio;
  }
}

let currentAudio = null;

export function speak(text, enabled = true) {
  if (!enabled) return;
  
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  
  const url = getAudioUrl(text);
  if (url) {
    let audio = audioCache[url];
    if (!audio) {
      audio = new Audio(url);
      audioCache[url] = audio;
    }
    currentAudio = audio;
    audio.play().catch(e => console.error("Audio play failed:", e));
  } else {
    console.warn("No audio mapped for text:", text);
  }
}

export function narrate(segments, enabled = true) {
  if (!enabled || !segments || segments.length === 0) return;
  let idx = 0;
  
  function playNext() {
    if (idx >= segments.length) return;
    
    // Eagerly preload next segment
    if (idx + 1 < segments.length) {
      preloadNarration(segments[idx + 1].text);
    }
    
    const segment = segments[idx];
    const url = getAudioUrl(segment.text);
    
    if (url) {
      let audio = audioCache[url];
      if (!audio) {
        audio = new Audio(url);
        audioCache[url] = audio;
      }
      currentAudio = audio;
      audio.onended = () => {
        idx++;
        playNext();
      };
      audio.play().catch(e => {
        console.error("Audio play failed:", e);
        idx++;
        playNext();
      });
    } else {
       console.warn("No audio mapped for text:", segment.text);
       idx++;
       playNext();
    }
  }
  
  playNext();
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
