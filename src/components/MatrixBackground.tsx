import { useEffect, useMemo, useRef, useState } from 'react';
import { Lock, Shield } from 'lucide-react';

export function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array.from({ length: columns }, () => Math.random() * -120);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 3, 6, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = Math.random() > 0.5 ? '1' : '0';
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        if (y > 0 && y < canvas.height) {
          const gradient = ctx.createLinearGradient(x, y - 90, x, y);
          gradient.addColorStop(0, 'rgba(255, 23, 68, 0)');
          gradient.addColorStop(0.7, 'rgba(255, 23, 68, 0.45)');
          gradient.addColorStop(1, 'rgba(255, 235, 240, 0.95)');
          ctx.fillStyle = gradient;
          ctx.fillText(char, x, y);
        }

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.965) {
          drops[i] = 0;
        }

        drops[i] += 0.9;
      }
    };

    const interval = window.setInterval(draw, 33);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-45" />
      <div className="fixed inset-0 z-0 pointer-events-none hex-grid opacity-50" />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,23,68,0.22),transparent_34%),radial-gradient(circle_at_78%_58%,rgba(24,215,255,0.10),transparent_28%),linear-gradient(180deg,rgba(5,3,6,0.25),rgba(5,3,6,0.95))]" />
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-cyber-red/12 via-transparent to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyber-red/15 animate-pulse" />
        <div className="absolute right-[14%] top-[32%] h-72 w-72 rounded-full border border-cyber-cyan/10 animate-pulse" />
      </div>
    </>
  );
}

export function ScanLines() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.045]">
      <div
        className="w-full h-full"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 23, 68, 0.18) 2px, rgba(255, 23, 68, 0.18) 4px)',
        }}
      />
    </div>
  );
}

export function GlitchText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      <span className="absolute inset-0 text-cyber-red opacity-70 animate-pulse" style={{ transform: 'translate(-2px, 0)' }} aria-hidden="true">
        {children}
      </span>
      <span className="absolute inset-0 text-cyber-cyan opacity-45 animate-pulse" style={{ transform: 'translate(2px, 0)' }} aria-hidden="true">
        {children}
      </span>
    </span>
  );
}

export function CyberGrid() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-20">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 23, 68, 0.16) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 23, 68, 0.12) 1px, transparent 1px)
          `,
          backgroundSize: '54px 54px',
        }}
      />
    </div>
  );
}

export function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: Math.random() * 38 + 14,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 16 + 12,
        delay: Math.random() * 8,
      })),
    []
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="bubble animate-float"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function BootSequence({ isFading, onComplete }: { isFading: boolean; onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const duration = 1600; // 1.6 seconds progress simulation
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`boot-overlay ${isFading ? 'fade-out' : ''}`}>
      <div className="absolute inset-0 hex-grid opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,23,68,0.28),transparent_36%),linear-gradient(180deg,rgba(5,3,6,0.2),rgba(5,3,6,0.96))]" />
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center px-6 text-center">
        <div className="relative mb-8 flex h-36 w-36 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-cyber-red/25 animate-ping" />
          <div className="absolute inset-3 rounded-full border-4 border-cyber-red/30 border-t-cyber-red animate-spin" />
          <div className="absolute inset-8 rounded-full border border-cyber-cyan/25 animate-pulse" />
          <div className="rounded-2xl border border-cyber-red/60 bg-black/45 p-5 shadow-glow-red backdrop-blur-md">
            <Lock className="h-10 w-10 text-cyber-red" />
          </div>
        </div>

        <h1 className="boot-title mb-4 text-5xl font-black text-white md:text-7xl">SENTINEL AI</h1>
        <div className="mb-8 flex items-center gap-3 font-mono text-sm uppercase tracking-[0.35em] text-gray-200">
          <span className="text-cyber-red">&gt;_</span>
          <span>Autonomous Security Core</span>
          <span className="text-cyber-cyan">&lt;&gt;</span>
        </div>

        <div className="mb-6 w-full max-w-xl">
          <div className="mb-2 flex items-center justify-between font-mono text-xs uppercase text-gray-300">
            <span>Initializing Sentinel Core</span>
            <span className="text-cyber-cyan">{Math.floor(progress)}%</span>
          </div>
          <div className="progress-bar h-2">
            <div className="progress-bar-fill h-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 font-mono text-xs uppercase">
          <div className="text-cyber-green">Secure Shell Active</div>
          <div className="text-cyber-cyan">Encryption AES-256</div>
          <div className="text-cyber-red">AI Engine Online</div>
        </div>

        <button
          onClick={isReady ? onComplete : undefined}
          disabled={!isReady}
          className={`mt-10 inline-flex items-center gap-3 rounded-lg border px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.18em] text-white shadow-glow-red backdrop-blur-md transition-all duration-300 ${
            isReady
              ? 'border-cyber-red/50 bg-cyber-red/20 hover:bg-cyber-red/40 hover:scale-105 active:scale-95 cursor-pointer opacity-100'
              : 'border-gray-800 bg-gray-900/10 cursor-not-allowed opacity-40'
          }`}
        >
          <Shield className="h-4 w-4" />
          Access Secure Terminal
        </button>
      </div>
    </div>
  );
}
