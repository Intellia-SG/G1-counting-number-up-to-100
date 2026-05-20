import { useState, useEffect, useCallback, useRef } from 'react';
import { narrate, stopNarration, preloadNarration } from '../utils/audio';
import { getStoryNarration } from '../utils/narration';

const STORY_SLIDES = [
  {
    image: '/images/story_playground.png',
    title: 'Counting at the Playground',
    text: "One morning, Wei Ming ran to the school playground. His friends were playing hopscotch! He counted the squares: 1, 2, 3... all the way to 10. \"Counting is fun!\" he laughed.",
    highlight: '"1, 2, 3, 4, 5, 6, 7, 8, 9, 10!"',
    mascotText: "Let's count with Wei Ming! 🔢",
  },
  {
    image: '/images/story_market.png',
    title: 'The Market Challenge!',
    text: "After school, Wei Ming went to the market. The fruit seller had arranged apples in groups of ten. \"I have one hundred apples!\" she said. Wei Ming was amazed — that is so many! But how do you count to 100?",
    highlight: '"Groups of 10 make counting easy!"',
    mascotText: 'Hmm... how DO you count to 100? 🤔',
  },
  {
    image: '/images/story_classroom.png',
    title: 'The Skip Counting Secret!',
    text: "The next day, his teacher showed the class a trick! Instead of counting one by one, you can skip count! By 2s: 2, 4, 6, 8... By 5s: 5, 10, 15, 20... By 10s: 10, 20, 30... all the way to 100!",
    highlight: '"Skip counting is like taking giant leaps!"',
    mascotText: "So THAT's the secret! 💡",
  },
  {
    image: '/images/story_celebrate.png',
    title: "Let's Count Together!",
    text: "Wei Ming was so excited! Now he could count anything — forwards, backwards, and even by skipping numbers! \"Can we practice more?\" he asked. And so, the counting adventure began...",
    highlight: '"Numbers 0 to 100 — here we count!"',
    mascotText: 'Your turn now! 🚀',
  },
];

export default function StoryPhase({ onComplete, audioEnabled }) {
  const [slide, setSlide] = useState(0);
  const [anim, setAnim] = useState(false);
  const [textVis, setTextVis] = useState(false);
  const [hlVis, setHlVis] = useState(false);
  const narrationRef = useRef(null);
  const s = STORY_SLIDES[slide];
  const isLast = slide === STORY_SLIDES.length - 1;
  const pct = ((slide + 1) / STORY_SLIDES.length) * 100;

  useEffect(() => {
    if (audioEnabled) {
      preloadNarration(getStoryNarration(slide));
      if (slide + 1 < STORY_SLIDES.length) {
        preloadNarration(getStoryNarration(slide + 1));
      }
    }
  }, [slide, audioEnabled]);

  useEffect(() => {
    setTextVis(false); setHlVis(false);
    const t1 = setTimeout(() => setTextVis(true), 100);
    const t2 = setTimeout(() => setHlVis(true), 800);
    return () => { clearTimeout(t1); clearTimeout(t2); stopNarration(); };
  }, [slide]);

  // Narrate paragraph + mascot text (NOT the title)
  useEffect(() => {
    if (textVis && audioEnabled) {
      narrationRef.current?.cancel();
      narrationRef.current = narrate(getStoryNarration(slide), true);
    }
    return () => { narrationRef.current?.cancel(); };
  }, [textVis, slide, audioEnabled]);

  const goNext = useCallback(() => {
    if (anim) return;
    narrationRef.current?.cancel();
    stopNarration();
    setAnim(true);
    setTimeout(() => { isLast ? onComplete() : setSlide(i => i + 1); setAnim(false); }, 400);
  }, [anim, isLast, onComplete]);

  const goPrev = useCallback(() => {
    if (anim || slide === 0) return;
    narrationRef.current?.cancel();
    stopNarration();
    setAnim(true);
    setTimeout(() => { setSlide(i => i - 1); setAnim(false); }, 400);
  }, [anim, slide]);

  return (
    <div className="story-phase">
      <div className="story-progress">
        <div className="story-progress-bar"><div className="story-progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="story-progress-label">{slide + 1} / {STORY_SLIDES.length}</span>
      </div>
      <div className={`story-card ${anim ? 'flipping' : ''}`}>
        <div className="story-image-section">
          <img src={s.image} alt={s.title} className="story-image" />
          <div className="story-image-overlay" />
        </div>
        <div className="story-text-section">
          <h2 className="story-title">{s.title}</h2>
          <p className={`story-text ${textVis ? 'revealed' : ''}`}>{s.text}</p>
          <div className={`story-highlight ${hlVis ? 'visible' : ''}`}>
            <span>✨</span><span className="story-highlight-text">{s.highlight}</span><span>✨</span>
          </div>
          <div className="story-mascot">
            <div className="mascot" style={{ width: 50, height: 50, fontSize: '1.4rem' }}>🐻</div>
            <div className="speech-bubble" style={{ fontSize: '0.8rem', padding: '8px 14px', maxWidth: 180 }}>{s.mascotText}</div>
          </div>
        </div>
      </div>
      <div className="story-nav">
        <button className="btn btn-outline btn-sm" onClick={goPrev} disabled={slide === 0} style={{ opacity: slide === 0 ? 0.3 : 1 }}>← Back</button>
        <div className="story-dots">
          {STORY_SLIDES.map((_, i) => (<div key={i} className={`story-dot ${i === slide ? 'active' : i < slide ? 'completed' : ''}`} />))}
        </div>
        <button className={`btn ${isLast ? 'btn-green' : 'btn-primary'} btn-sm`} onClick={goNext}>
          {isLast ? "🚀 Let's Explore!" : 'Next →'}
        </button>
      </div>
    </div>
  );
}

