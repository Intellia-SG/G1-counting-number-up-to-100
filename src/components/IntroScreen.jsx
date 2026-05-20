import { useEffect } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { introNarration } from '../utils/narration';

const JOURNEY_PHASES = [
  { icon: '🔍', label: 'Wonder', desc: 'Spark your curiosity' },
  { icon: '📖', label: 'Story', desc: 'Hear the tale' },
  { icon: '🧪', label: 'Simulate', desc: 'Explore & discover' },
  { icon: '🎮', label: 'Play', desc: 'Test your skills' },
  { icon: '📓', label: 'Reflect', desc: 'What did you learn?' },
];

export default function IntroScreen({ onStart, audioEnabled }) {
  useEffect(() => {
    if (audioEnabled) {
      narrate(introNarration(), true);
    }
    return () => stopNarration();
  }, [audioEnabled]);

  return (
    <div className="intro-screen">
      <div className="intro-badge">
        ✨ Singapore MOE Curriculum · Grade 1
      </div>

      <h1 className="intro-title">
        Counting of{' '}
        <span style={{ color: 'var(--gold)' }}>Numbers</span>
      </h1>

      <div className="mascot-container">
        <div className="mascot">🐻</div>
        <div className="speech-bubble">
          Ready for a counting adventure? 🎉
        </div>
      </div>

      <p className="intro-desc">
        Join Wei Ming on a journey to count numbers 0–100 through stories, simulations, and fun games!
      </p>

      <div className="intro-journey-map">
        <h3 className="intro-journey-title">Your Learning Journey</h3>
        <div className="intro-journey-steps">
          {JOURNEY_PHASES.map((p, i) => (
            <div key={i} className="intro-journey-step">
              <div className="intro-journey-icon">{p.icon}</div>
              <div className="intro-journey-info">
                <div className="intro-journey-label">{p.label}</div>
                <div className="intro-journey-desc">{p.desc}</div>
              </div>
              {i < JOURNEY_PHASES.length - 1 && <div className="intro-journey-arrow">→</div>}
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-primary btn-lg intro-start-btn" onClick={onStart} id="start-journey-btn">
        🚀 Begin Your Journey!
      </button>

      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-card-icon">🔢</div>
          <div className="feature-card-label">Count & Skip</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🧱</div>
          <div className="feature-card-label">Simulations</div>
        </div>
        <div className="feature-card">
          <div className="feature-card-icon">🏆</div>
          <div className="feature-card-label">3 Game Worlds</div>
        </div>
      </div>
    </div>
  );
}
