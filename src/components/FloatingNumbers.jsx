const COUNT = 20;
const FLOATING_NUMBERS = Array.from({ length: COUNT }, (_, i) => {
  const rand1 = ((i * 37 + 12) % 100) / 100;
  const rand2 = ((i * 53 + 24) % 100) / 100;
  const rand3 = ((i * 71 + 9) % 100) / 100;
  const rand4 = ((i * 17 + 81) % 100) / 100;
  const rand5 = ((i * 43 + 19) % 100) / 100;
  return {
    value: Math.floor(rand1 * 100),
    left: `${rand2 * 100}%`,
    delay: `${rand3 * 20}s`,
    duration: `${15 + rand4 * 15}s`,
    size: `${2 + rand5 * 3}rem`,
  };
});

export default function FloatingNumbers() {
  return (
    <div className="floating-numbers">
      {FLOATING_NUMBERS.map((n, i) => (
        <span key={i} className="floating-number" style={{
          left: n.left,
          animationDelay: n.delay,
          animationDuration: n.duration,
          fontSize: n.size,
        }}>
          {n.value}
        </span>
      ))}
    </div>
  );
}
