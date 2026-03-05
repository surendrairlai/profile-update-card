import { useEffect, useState } from 'react';

const COLORS = ['#7c3aed', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#ec4899'];
const PIECE_COUNT = 40;
const DURATION = 1800;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function makePieces() {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: randomBetween(10, 90),
    delay: randomBetween(0, 400),
    drift: randomBetween(-40, 40),
    size: randomBetween(5, 9),
    rotation: randomBetween(0, 360),
  }));
}

export function Confetti({ onDone }: { onDone: () => void }) {
  const [pieces] = useState(makePieces);

  useEffect(() => {
    const t = setTimeout(onDone, DURATION);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-[9999]">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-8px',
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: '1px',
            opacity: 1,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall ${DURATION}ms ${p.delay}ms ease-in forwards`,
            ['--drift' as string]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
