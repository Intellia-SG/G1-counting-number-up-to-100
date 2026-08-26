import { useState, useCallback } from 'react';
import { stopNarration } from './utils/audio';
import IntroScreen from './components/IntroScreen';
import WonderPhase from './components/WonderPhase';
import StoryPhase from './components/StoryPhase';
import SimulatePhase from './components/SimulatePhase';
import PlayPhase from './components/PlayPhase';
import ReflectPhase from './components/ReflectPhase';
import FloatingNumbers from './components/FloatingNumbers';

const PHASES = [
  { id: 'wonder', label: 'Wonder', icon: '🔍', num: '01' },
  { id: 'story', label: 'Story', icon: '📖', num: '02' },
  { id: 'simulate', label: 'Simulate', icon: '🧪', num: '03' },
  { id: 'play', label: 'Practice', icon: '🎮', num: '04' },
  { id: 'reflect', label: 'Reflect', icon: '📓', num: '05' },
];

const STORAGE_KEY = 'intellia_counting_numbers_v1';

function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, timestamp: Date.now() }));
}

export default function App() {
  const [phase, setPhase] = useState('intro');
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [playStats, setPlayStats] = useState(null);

  const goHome = useCallback(() => setPhase('intro'), []);

  const handleWonderComplete = useCallback(() => setPhase('story'), []);
  const handleStoryComplete = useCallback(() => setPhase('simulate'), []);
  const handleSimulateComplete = useCallback(() => setPhase('play'), []);

  const handlePlayComplete = useCallback((stats) => {
    setPlayStats(stats);
    saveProgress({ phase: 'reflect', stats });
    setPhase('reflect');
  }, []);

  const handleRestart = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPhase('intro');
    setPlayStats(null);
  }, []);

  const currentPhaseIndex = PHASES.findIndex(p => p.id === phase);

  return (
    <>
      <FloatingNumbers />
      <div className="app-container">
        {/* Consolidated Navigation Bar — Hidden in intro phase */}
        {phase !== 'intro' && (
          <header className="journey-bar">
            {/* Home button */}
            <button className="home-btn-nav" onClick={goHome} aria-label="Go home">
              🏠 Home
            </button>

            {/* Stepper buttons (All phases unlocked) */}
            <div className="journey-steps-container">
              {PHASES.map((p, i) => (
                <div
                  key={p.id}
                  className={`journey-step ${p.id === phase ? 'active' : i < currentPhaseIndex ? 'completed' : ''}`}
                  onClick={() => setPhase(p.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to ${p.label} phase`}
                >
                  <div className="journey-step-dot">
                    {i < currentPhaseIndex ? '✓' : p.num}
                  </div>
                  <span className="journey-step-label">{p.icon} {p.label}</span>
                  {i < PHASES.length - 1 && (
                    <div className={`journey-connector ${i < currentPhaseIndex ? 'filled' : ''}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Audio / Mute button beside navbar */}
            <button
              onClick={() => {
                setAudioEnabled(prev => {
                  const next = !prev;
                  if (!next) stopNarration();
                  return next;
                });
              }}
              className="audio-toggle-btn-nav"
              aria-label="Toggle audio"
            >
              {audioEnabled ? '🔊' : '🔇'}
            </button>
          </header>
        )}

        {/* Phases */}
        {phase === 'intro' && (
          <IntroScreen
            onStart={() => setPhase('wonder')}
          />
        )}
        {phase === 'wonder' && (
          <WonderPhase onComplete={handleWonderComplete} audioEnabled={audioEnabled} />
        )}
        {phase === 'story' && (
          <StoryPhase onComplete={handleStoryComplete} audioEnabled={audioEnabled} />
        )}
        {phase === 'simulate' && (
          <SimulatePhase onComplete={handleSimulateComplete} audioEnabled={audioEnabled} />
        )}
        {phase === 'play' && (
          <PlayPhase onComplete={handlePlayComplete} audioEnabled={audioEnabled} />
        )}
        {phase === 'reflect' && (
          <ReflectPhase stats={playStats} onRestart={handleRestart} onGoHome={goHome} audioEnabled={audioEnabled} />
        )}
      </div>
    </>
  );
}
