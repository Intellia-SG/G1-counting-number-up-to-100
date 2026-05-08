import { useState, useEffect, useCallback } from 'react';
import { speak } from '../utils/audio';

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
    const t1 = setTimeout(() => setStage(1), 800);
    const t2 = setTimeout(() => setStage(2), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (stage === 1 && audioEnabled) {
      speak(wonder.question, true);
    }
  }, [stage, wonder.question, audioEnabled]);

  const handleDiscover = useCallback(() => {
    if (audioEnabled) speak("Let's find out together!", true);
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
