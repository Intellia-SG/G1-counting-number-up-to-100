import { useState, useCallback, useEffect, useRef } from 'react';
import { numberToWord } from '../utils/numberWords';
import { speak, narrate, stopNarration, sounds } from '../utils/audio';
import { reflectQuestionNarration, reflectCorrectNarration, reflectConfidenceNarration, reflectCertificateNarration } from '../utils/narration';

const REFLECT_QUESTIONS = [
  { q: "What number comes after 29?", options: [
    { text: "30", correct: true, emoji: "✅" },
    { text: "28", correct: false, emoji: "❌" },
    { text: "39", correct: false, emoji: "🔄" },
  ]},
  { q: "Count by 5s: 5, 10, 15, ___. What comes next?", options: [
    { text: "16", correct: false, emoji: "❌" },
    { text: "20", correct: true, emoji: "✅" },
    { text: "25", correct: false, emoji: "🔄" },
  ]},
  { q: "Which is more: 47 or 74?", options: [
    { text: "47", correct: false, emoji: "📉" },
    { text: "74", correct: true, emoji: "📈" },
    { text: "They are the same", correct: false, emoji: "❌" },
  ]},
];

const CONFIDENCE_LEVELS = [
  { emoji: '😊', label: "I'm great at counting!", color: '#4caf50' },
  { emoji: '🙂', label: 'I can count most numbers!', color: '#ff9800' },
  { emoji: '😐', label: "I'm still learning to count", color: '#42a5f5' },
];

export default function ReflectPhase({ stats, onRestart, onGoHome, audioEnabled }) {
  const [step, setStep] = useState(0);
  const [teachIdx, setTeachIdx] = useState(0);
  const [teachAnswered, setTeachAnswered] = useState(false);
  const [teachCorrect, setTeachCorrect] = useState(0);
  const [favNum, setFavNum] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  
  const narrationRef = useRef(null);

  const { score = 0, totalAnswered = 0, xp = 0, maxStreak = 0, worldResults = {} } = stats || {};
  const pct = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
  const totalStars = Object.values(worldResults).reduce((a, r) => a + (r.stars || 0), 0);

  useEffect(() => {
    if (showConfetti) {
      const pieces = Array.from({ length: 40 }, (_, i) => ({
        id: i, x: Math.random() * 100, delay: Math.random() * 2,
        color: ['#ffc107', '#e91e63', '#4caf50', '#2196f3', '#ff5722', '#9c27b0'][i % 6],
        size: 6 + Math.random() * 10, duration: 2 + Math.random() * 3,
      }));
      setConfettiPieces(pieces);
    }
  }, [showConfetti]);

  // Narrate question text when it changes (NOT the "Reflect" title)
  useEffect(() => {
    if (step === 0 && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(reflectQuestionNarration(REFLECT_QUESTIONS[teachIdx].q), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [step, teachIdx, audioEnabled]);

  // Narrate confidence step
  useEffect(() => {
    if (step === 2 && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(reflectConfidenceNarration(), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [step, audioEnabled]);

  // Narrate certificate
  useEffect(() => {
    if (step === 3 && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(reflectCertificateNarration(pct), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [step, pct, audioEnabled]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      narrationRef.current?.cancel();
      stopNarration();
    };
  }, []);

  const handleTeachAnswer = useCallback((option) => {
    if (teachAnswered) return;
    setTeachAnswered(true);
    if (option.correct) {
      setTeachCorrect(c => c + 1);
      sounds.correct();
      if (audioEnabled) {
        narrationRef.current?.cancel();
        narrationRef.current = narrate(reflectCorrectNarration(), true);
      }
    } else {
      sounds.wrong();
    }
    setTimeout(() => {
      setTeachAnswered(false);
      if (teachIdx + 1 < REFLECT_QUESTIONS.length) setTeachIdx(i => i + 1);
      else setStep(1);
    }, 1500);
  }, [teachAnswered, teachIdx, audioEnabled]);

  const handleFavSelect = useCallback((num) => {
    setFavNum(num);
    if (audioEnabled) speak(`${num}, ${numberToWord(num)}`, true);
  }, [audioEnabled]);

  const handleConfidenceSelect = useCallback((idx) => {
    setConfidence(idx);
    sounds.badge();
    setShowConfetti(true);
    setTimeout(() => setStep(3), 1000);
  }, []);

  // Step 0: Teach the Mascot
  if (step === 0) {
    const rq = REFLECT_QUESTIONS[teachIdx];
    return (
      <div className="reflect-phase">
        <div className="reflect-header">
          <h3 className="reflect-label">📓 Reflect</h3>
          <p className="reflect-sublabel">Teach the mascot what you learned!</p>
        </div>
        <div className="reflect-card">
          <div className="reflect-mascot-row">
            <div className="mascot thinking" style={{ width: 70, height: 70, fontSize: '2rem' }}>🐻</div>
            <div className="speech-bubble" style={{ maxWidth: 280 }}>Can you help me? {rq.q}</div>
          </div>
          <div className="reflect-options">
            {rq.options.map((opt, i) => (
              <button key={i} className={`reflect-option ${teachAnswered ? (opt.correct ? 'correct' : 'wrong') : ''}`}
                onClick={() => handleTeachAnswer(opt)} disabled={teachAnswered}>
                <span className="reflect-option-emoji">{opt.emoji}</span>
                <span>{opt.text}</span>
              </button>
            ))}
          </div>
          <div className="reflect-progress">
            {REFLECT_QUESTIONS.map((_, i) => (<div key={i} className={`reflect-dot ${i === teachIdx ? 'active' : i < teachIdx ? 'done' : ''}`} />))}
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Favorite Number
  if (step === 1) {
    const favNums = [7, 10, 25, 42, 55, 77, 88, 99, 100];
    return (
      <div className="reflect-phase">
        <div className="reflect-card">
          <h3 className="reflect-card-title">📝 My Number Journal</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Pick your favorite number!</p>
          <div className="fav-num-grid">
            {favNums.map(n => (
              <button key={n} className={`fav-num-btn ${favNum === n ? 'selected' : ''}`}
                onClick={() => handleFavSelect(n)}>{n}</button>
            ))}
          </div>
          {favNum !== null && (
            <div className="fav-num-display" style={{ animation: 'bounceIn 0.4s ease' }}>
              <div className="fav-num-big">{favNum}</div>
              <div className="fav-num-word">{numberToWord(favNum)}</div>
              <div className="fav-num-decomp">
                {favNum >= 10 ? <span>{Math.floor(favNum / 10)} tens and {favNum % 10} ones</span> : <span>{favNum} ones</span>}
              </div>
              <div className="fav-num-blocks">
                {Array.from({ length: Math.floor(favNum / 10) }, (_, i) => (<div key={`t${i}`} className="ten-stick" style={{ height: 50, width: 20 }} />))}
                {Array.from({ length: favNum % 10 }, (_, i) => (<div key={`o${i}`} className="unit-cube" style={{ width: 20, height: 20 }} />))}
              </div>
            </div>
          )}
          {favNum !== null && (
            <button className="btn btn-primary" onClick={() => setStep(2)} style={{ marginTop: 20 }}>Continue →</button>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Confidence
  if (step === 2) {
    return (
      <div className="reflect-phase">
        <div className="reflect-card">
          <h3 className="reflect-card-title">How do you feel about counting?</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Be honest — every answer is great!</p>
          <div className="confidence-grid">
            {CONFIDENCE_LEVELS.map((c, i) => (
              <button key={i} className={`confidence-btn ${confidence === i ? 'selected' : ''}`}
                onClick={() => handleConfidenceSelect(i)} style={{ '--conf-color': c.color }}>
                <span className="confidence-emoji">{c.emoji}</span>
                <span className="confidence-label">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Certificate
  return (
    <div className="reflect-phase">
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map(p => (
            <div key={p.id} className="confetti-piece" style={{
              left: `${p.x}%`, animationDelay: `${p.delay}s`,
              backgroundColor: p.color, width: p.size, height: p.size,
              animationDuration: `${p.duration}s`,
            }} />
          ))}
        </div>
      )}
      <div className="certificate-card">
        <div className="cert-badge">🏆</div>
        <h2 className="cert-title">Journey Complete!</h2>
        <p className="cert-subtitle">You finished all 5 phases!</p>
        <div className="score-circle">
          <span className="score-number">{pct}%</span>
          <span className="score-label">{score}/{totalAnswered}</span>
        </div>
        <div style={{ fontSize: '2rem', display: 'flex', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
          {[1, 2, 3].map(i => (<span key={i} style={{ opacity: i <= Math.ceil(totalStars / 3) ? 1 : 0.2 }}>⭐</span>))}
        </div>
        <div className="cert-stats">
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--gold)' }}>{xp}</div>
            <div className="cert-stat-label">XP Earned</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--coral)' }}>🔥 {maxStreak}</div>
            <div className="cert-stat-label">Max Streak</div>
          </div>
          <div className="cert-stat">
            <div className="cert-stat-value" style={{ color: 'var(--green-light)' }}>{teachCorrect}/{REFLECT_QUESTIONS.length}</div>
            <div className="cert-stat-label">Teaching</div>
          </div>
        </div>
        <div className="cert-worlds">
          {Object.entries(worldResults).map(([id, r]) => (
            <div key={id} className="cert-world-item">
              <span>{['🏡', '🏔️', '🚀'][id]}</span>
              <span>{r.score}/{r.total}</span>
              <span>{Array.from({ length: 3 }, (_, i) => i < r.stars ? '⭐' : '☆').join('')}</span>
            </div>
          ))}
        </div>
        <div className="mascot-container" style={{ marginTop: 16 }}>
          <div className="mascot happy" style={{ width: 80, height: 80, fontSize: '2rem' }}>🐻</div>
          <div className="speech-bubble">
            {pct >= 80 ? 'Incredible! You are a Counting Master! 🏆' : pct >= 50 ? 'Great effort! Keep counting! 💪' : 'Good start! Try again to improve! 📚'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-primary btn-lg" onClick={onRestart}>🔄 Play Again</button>
          <button className="btn btn-secondary" onClick={onGoHome}>🏠 Home</button>
        </div>
      </div>
    </div>
  );
}
