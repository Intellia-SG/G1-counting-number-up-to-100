import { useState, useCallback, useRef, useEffect } from 'react';
import { numberToWord } from '../utils/numberWords';
import { speak, narrate, stopNarration } from '../utils/audio';
import { simulateStation1Intro, simulateStation2Intro, simulateStation3Intro, simulateStation4Intro } from '../utils/narration';

const STATIONS = [
  { id: 0, title: 'Count 0–10', subtitle: 'Ten-Frame Counting', icon: '🔢' },
  { id: 1, title: 'Count 11–20', subtitle: 'Teen Numbers', icon: '🔟' },
  { id: 2, title: 'Skip Counting', subtitle: 'Count by 2s, 5s, 10s', icon: '🦘' },
  { id: 3, title: 'Hundred Chart', subtitle: 'Explore 1–100', icon: '📊' },
];

/* Station 1: Ten-Frame 0-10 */
function Station1({ audioEnabled, onNext }) {
  const [filled, setFilled] = useState(0);
  const narrationRef = useRef(null);

  // Narrate instruction paragraph on mount (NOT the title)
  useEffect(() => {
    if (audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(simulateStation1Intro(), true);
    }
    return () => { narrationRef.current?.cancel(); stopNarration(); };
  }, [audioEnabled]);

  const toggle = (i) => {
    const next = i < filled ? i : i + 1;
    setFilled(Math.min(10, Math.max(0, next)));
    speak(numberToWord(Math.min(10, Math.max(0, next))), audioEnabled);
  };
  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🔢 Counting 0 to 10</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Click the squares to count. Each filled square = <strong style={{ color: 'var(--gold)' }}>1</strong>!
      </p>
      <div className="simulate-tip">💡 Try counting to different numbers! There are no wrong answers.</div>
      <div className="number-display">
        <span className="big-number">{filled}</span>
        <span className="number-word">{numberToWord(filled)}</span>
      </div>
      <div className="ten-frame">
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`ten-frame-cell ${i < filled ? 'filled' : ''}`}
            onClick={() => toggle(i)} role="button" tabIndex={0}
            aria-label={`Cell ${i + 1}, ${i < filled ? 'filled' : 'empty'}`}>
            {i < filled ? '⭐' : ''}
          </div>
        ))}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '12px 0' }}>
        Fill the frame from left to right, top to bottom
      </p>
      <button className="btn btn-primary" onClick={onNext} style={{ marginTop: 16 }}>
        Next Station →
      </button>
    </div>
  );
}

/* Station 2: Teen Numbers 11-20 */
function Station2({ audioEnabled, onNext }) {
  const [ones, setOnes] = useState(1);
  const num = 10 + ones;
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(simulateStation2Intro(), true);
    }
    return () => { narrationRef.current?.cancel(); stopNarration(); };
  }, [audioEnabled]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🔟 Counting 11 to 20</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        <strong style={{ color: 'var(--gold)' }}>1 ten</strong> and <strong style={{ color: 'var(--gold)' }}>{ones} one{ones !== 1 ? 's' : ''}</strong> = {num}
      </p>
      <div className="simulate-tip">💡 Slide the control to count the teen numbers!</div>
      <div className="number-display">
        <span className="big-number">{num}</span>
        <span className="number-word">{numberToWord(num)}</span>
      </div>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'flex-end', margin: '20px 0' }}>
        <div>
          <div className="column-label">1 Ten</div>
          <div className="ten-frame" style={{ maxWidth: 200 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="ten-frame-cell filled" style={{ width: 32, height: 32 }}>⭐</div>
            ))}
          </div>
        </div>
        <div>
          <div className="column-label">{ones} One{ones !== 1 ? 's' : ''}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 100 }}>
            {Array.from({ length: ones }, (_, i) => (
              <div key={i} className="ten-frame-cell filled" style={{ width: 32, height: 32 }}>⭐</div>
            ))}
          </div>
        </div>
      </div>
      <div className="blocks-controls">
        <button className="block-control-btn" onClick={() => { const n = Math.max(1, ones - 1); setOnes(n); speak(numberToWord(10 + n), audioEnabled); }}>−</button>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, minWidth: 40, textAlign: 'center' }}>{ones}</span>
        <button className="block-control-btn" onClick={() => { const n = Math.min(10, ones + 1); setOnes(n); speak(numberToWord(10 + n), audioEnabled); }}>+</button>
      </div>
      <button className="btn btn-primary" onClick={onNext} style={{ marginTop: 20 }}>Next Station →</button>
    </div>
  );
}

/* Station 3: Skip Counting */
function Station3({ audioEnabled, onNext }) {
  const [skipBy, setSkipBy] = useState(2);
  const [highlighted, setHighlighted] = useState([]);
  const timeoutsRef = useRef([]);
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(simulateStation3Intro(), true);
    }
    return () => { narrationRef.current?.cancel(); stopNarration(); };
  }, [audioEnabled]);

  const generateSequence = (by) => {
    const seq = [];
    for (let i = by; i <= 100; i += by) seq.push(i);
    return seq;
  };

  const handleSkipChange = (by) => {
    timeoutsRef.current.forEach(id => clearTimeout(id));
    timeoutsRef.current = [];
    narrationRef.current?.cancel();
    stopNarration();

    setSkipBy(by);
    setHighlighted([]);

    const seq = generateSequence(by);
    const newTimeouts = [];
    seq.forEach((n, i) => {
      const id = setTimeout(() => {
        setHighlighted(prev => [...prev, n]);
        speak(String(n), audioEnabled);
      }, i * 300);
      newTimeouts.push(id);
    });
    timeoutsRef.current = newTimeouts;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>🦘 Skip Counting</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
        Count by <strong style={{ color: 'var(--gold)' }}>{skipBy}s</strong> — watch the numbers light up!
      </p>
      <div className="simulate-tip">💡 Skip counting is like taking big jumps on a number line!</div>
      <div className="blocks-controls" style={{ marginBottom: 16 }}>
        {[2, 5, 10].map(by => (
          <button key={by} className={`block-control-btn`}
            style={{ background: skipBy === by ? 'var(--gold)' : '', color: skipBy === by ? '#1a1a2e' : '', fontWeight: 700, width: 50 }}
            onClick={() => handleSkipChange(by)}>
            {by}s
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, maxWidth: 500, margin: '0 auto' }}>
        {Array.from({ length: 100 }, (_, i) => {
          const n = i + 1;
          const isHit = highlighted.includes(n);
          return (
            <div key={n} style={{
              padding: '6px 2px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700,
              background: isHit ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
              color: isHit ? '#1a1a2e' : 'var(--text-muted)',
              border: `1px solid ${isHit ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
              transition: 'all 0.3s ease',
              transform: isHit ? 'scale(1.1)' : 'scale(1)',
            }}>
              {n}
            </div>
          );
        })}
      </div>
      <button className="btn btn-primary" onClick={onNext} style={{ marginTop: 20 }}>Next Station →</button>
    </div>
  );
}

/* Station 4: Hundred Chart Explorer */
function Station4({ audioEnabled, onComplete }) {
  const [selected, setSelected] = useState(null);
  const narrationRef = useRef(null);

  useEffect(() => {
    if (audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(simulateStation4Intro(), true);
    }
    return () => { narrationRef.current?.cancel(); stopNarration(); };
  }, [audioEnabled]);

  const handleClick = (n) => {
    setSelected(n);
    speak(numberToWord(n), audioEnabled);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div className="station-header"><h2>📊 Hundred Chart Explorer</h2></div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Click any number to hear it! Explore patterns in the chart.</p>
      <div className="simulate-tip">💡 Notice how each row ends with a number ending in 0!</div>
      {selected !== null && (
        <div className="number-display" style={{ width: 120, height: 120, margin: '12px auto' }}>
          <span className="big-number" style={{ fontSize: '2.5rem' }}>{selected}</span>
          <span className="number-word" style={{ fontSize: '0.85rem' }}>{numberToWord(selected)}</span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 3, maxWidth: 500, margin: '0 auto' }}>
        {Array.from({ length: 100 }, (_, i) => {
          const n = i + 1;
          return (
            <div key={n} onClick={() => handleClick(n)}
              style={{
                padding: '6px 2px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                background: selected === n ? 'var(--gold)' : 'rgba(255,255,255,0.05)',
                color: selected === n ? '#1a1a2e' : 'var(--text-secondary)',
                border: `1px solid ${selected === n ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.2s ease',
              }}>
              {n}
            </div>
          );
        })}
      </div>
      <button className="btn btn-green btn-lg" onClick={onComplete} style={{ marginTop: 20, animation: 'bounceIn 0.5s ease' }}>
        🎉 Complete Simulation!
      </button>
    </div>
  );
}

export default function SimulatePhase({ onComplete, audioEnabled }) {
  const [station, setStation] = useState(0);
  const nextStation = useCallback(() => { stopNarration(); if (station < 3) setStation(s => s + 1); }, [station]);

  return (
    <div className="simulate-phase">
      <div className="simulate-header">
        <h3 className="simulate-label">🧪 Simulate</h3>
        <p className="simulate-sublabel">Explore and discover — no wrong answers!</p>
      </div>
      <div className="progress-dots">
        {STATIONS.map((s, i) => (
          <div
            key={i}
            className={`simulate-dot-wrapper ${i === station ? 'active' : ''}`}
            onClick={() => {
              stopNarration();
              setStation(i);
            }}
            role="button"
            tabIndex={0}
            title={s.title}
            aria-label={`Jump to station ${s.title}`}
          >
            <div className={`progress-dot ${i === station ? 'active' : i < station ? 'completed' : ''}`} />
            <span className="simulate-dot-label">{s.icon} {s.title}</span>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ maxWidth: 800, width: '100%', animation: 'slideUp 0.4s ease' }}>
        {station === 0 && <Station1 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 1 && <Station2 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 2 && <Station3 audioEnabled={audioEnabled} onNext={nextStation} />}
        {station === 3 && <Station4 audioEnabled={audioEnabled} onComplete={onComplete} />}
      </div>
    </div>
  );
}

