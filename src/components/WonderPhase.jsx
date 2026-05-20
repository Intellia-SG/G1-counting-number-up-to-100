import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration } from '../utils/audio';
import { wonderNarration, wonderDiscoverNarration } from '../utils/narration';

const WONDER_QUESTIONS = [
  {
    question: "If you had a jar full of marbles, how would you count them super fast?",
    subtext: "What if there's a magical trick using groups of ten?",
    emoji: "🔮",
    bgEmojis: ["🔮", "✨", "🌟", "💫"],
  },
  {
    question: "What comes after ninety-nine? Can you count that high?",
    subtext: "The biggest number we'll explore today has a very special name!",
    emoji: "💯",
    bgEmojis: ["💯", "🏆", "🎉", "🌈"],
  },
  {
    question: "Can you count by twos? 2, 4, 6... what comes next?",
    subtext: "Skip counting is like taking big jumps on a number line!",
    emoji: "🦘",
    bgEmojis: ["🦘", "🔢", "⭐", "🎯"],
  },
  {
    question: "How many fingers do you have on both hands? Can you count by fives to 100?",
    subtext: "Your fingers are the best counting tool ever!",
    emoji: "🖐️",
    bgEmojis: ["🖐️", "✋", "🤚", "🎪"],
  },
  {
    question: "If you count backwards from 10, what happens when you reach zero?",
    subtext: "Counting backwards is like a rocket countdown — 3, 2, 1, blast off!",
    emoji: "🚀",
    bgEmojis: ["🚀", "🌟", "💥", "🔥"],
  },
];

export default function WonderPhase({ onComplete, audioEnabled }) {
  const [wonder] = useState(() => WONDER_QUESTIONS[Math.floor(Math.random() * WONDER_QUESTIONS.length)]);
  const [stage, setStage] = useState(0);
  const [particles, setParticles] = useState([]);
  const narrationRef = useRef(null);

  useEffect(() => {
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      emoji: wonder.bgEmojis[i % wonder.bgEmojis.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      size: 1.2 + Math.random() * 1.5,
    }));
    setParticles(p);
  }, [wonder]);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);
    const t2 = setTimeout(() => setStage(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); stopNarration(); };
  }, []);

  // Narrate question + subtext (NOT the emoji or title)
  useEffect(() => {
    if (stage === 1 && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(wonderNarration(wonder.question, wonder.subtext), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [stage, wonder.question, wonder.subtext, audioEnabled]);

  const handleDiscover = useCallback(() => {
    narrationRef.current?.cancel();
    stopNarration();
    if (audioEnabled) {
      narrationRef.current = narrate(wonderDiscoverNarration(), true);
    }
    setTimeout(() => onComplete(), 600);
  }, [onComplete, audioEnabled]);

  return (
    <div className="wonder-phase">
      <div className="wonder-particles">
        {particles.map(p => (
          <span
            key={p.id}
            className="wonder-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              fontSize: `${p.size}rem`,
            }}
          >
            {p.emoji}
          </span>
        ))}
      </div>

      <div className="wonder-content">
        <div className={`wonder-qmark ${stage >= 1 ? 'revealed' : ''}`}>
          <span className="wonder-qmark-icon">?</span>
          <div className="wonder-qmark-glow" />
        </div>

        <div className={`wonder-mascot ${stage >= 1 ? 'visible' : ''}`}>
          <div className="mascot thinking">🐻</div>
          <div className="speech-bubble wonder-bubble">
            Hmm... I wonder... 🤔
          </div>
        </div>

        <div className={`wonder-question-card ${stage >= 1 ? 'visible' : ''}`}>
          <div className="wonder-emoji">{wonder.emoji}</div>
          <h2 className="wonder-question-text">{wonder.question}</h2>
          <p className="wonder-subtext">{wonder.subtext}</p>
        </div>

        <button
          className={`btn btn-wonder ${stage >= 2 ? 'visible' : ''}`}
          onClick={handleDiscover}
          id="discover-btn"
        >
          <span className="wonder-btn-sparkle">✨</span>
          Let's Discover!
          <span className="wonder-btn-sparkle">✨</span>
        </button>
      </div>
    </div>
  );
}

