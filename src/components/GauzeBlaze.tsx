import React, { useEffect, useRef, useState } from 'react';

interface GauzeBlazeProps {
  background?: string;
  baseColor?: string;
  midColor?: string;
  accentColor?: string;
  amplitude?: number;
  speed?: number;
  particles?: number;
  advanced?: {
    coreColor?: string;
    hazeColor?: string;
    haze?: number;
    vignette?: number;
    exposure?: number;
    lineOpacity?: number;
    centerY?: number;
    lineCount?: number;
  };
  style?: React.CSSProperties;
}

export const GauzeBlaze: React.FC<GauzeBlazeProps> = ({
  background = '#141a2e',
  baseColor = '#1d3a8a',
  midColor = '#dc2626',
  accentColor = '#f59e0b',
  amplitude = 30,
  speed = 35,
  particles = 250,
  advanced = {
    coreColor: '#FFB020',
    hazeColor: '#1c2237',
    haze: 30,
    vignette: 35,
    exposure: 220,
    lineOpacity: 30,
    centerY: 62,
    lineCount: 36,
  },
  style,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d', { alpha: false });
    } catch {
      setIsSupported(false);
      return;
    }

    if (!ctx) {
      setIsSupported(false);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = mediaQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let animId: number | null = null;
    let lastTime = performance.now();
    let timeSec = 0;

    const isMobile = window.innerWidth < 640;
    const activeParticles = isMobile ? Math.min(particles, 120) : particles;
    const activeLineCount = isMobile ? Math.min(advanced.lineCount || 36, 24) : (advanced.lineCount || 36);

    // Particle state
    interface Particle {
      x: number;
      y: number;
      z: number;
      r: number;
      vx: number;
      vy: number;
      phase: number;
      speedPhase: number;
    }

    let particleList: Particle[] = [];

    const initParticles = (w: number, h: number) => {
      const list: Particle[] = [];
      for (let i = 0; i < activeParticles; i++) {
        const z = 0.2 + (i % 5) * 0.2;
        list.push({
          x: ((i * 137.5) % 100) * 0.01 * w,
          y: ((i * 73.1) % 100) * 0.01 * h,
          z,
          r: (isMobile ? 1.0 : 1.4) * (0.6 + z * 0.5),
          vx: (0.05 + z * 0.08) * (i % 2 === 0 ? 1 : -0.6),
          vy: -0.03 - z * 0.04,
          phase: i * 0.9,
          speedPhase: 0.5 + (i % 4) * 0.15,
        });
      }
      particleList = list;
    };

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.25 : 1.75);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      initParticles(width, height);
    };

    updateSize();

    const renderFrame = (elapsed: number) => {
      if (!ctx || width <= 0 || height <= 0) return;

      // 1. Fill background
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);

      // Ambient radial glow using baseColor and accentColor
      const cx = width * 0.55;
      const cy = height * (1 - (advanced.centerY || 62) / 100);
      const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.8);
      radGrad.addColorStop(0, baseColor + '55');
      radGrad.addColorStop(0.5, midColor + '33');
      radGrad.addColorStop(1, background + '00');
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Flowing ribbon / wave lines
      const amp = amplitude;
      const spd = speed * 0.005;
      const lineOp = (advanced.lineOpacity || 30) / 100;

      for (let i = 0; i < activeLineCount; i++) {
        const norm = i / Math.max(1, activeLineCount - 1);
        const lineBaseY = height * (0.2 + norm * 0.65);
        const freq = 0.0018 + (i % 3) * 0.0006;
        const phaseShift = elapsed * spd + i * 0.35;

        ctx.beginPath();
        const step = width < 640 ? 32 : 20;

        for (let x = -step; x <= width + step; x += step) {
          const nx = x / width;
          const y =
            lineBaseY +
            Math.sin(x * freq + phaseShift) * amp * (0.7 + norm * 0.5) +
            Math.cos(x * freq * 0.5 - phaseShift * 0.8) * (amp * 0.4);

          if (x === -step) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const strokeGrad = ctx.createLinearGradient(0, 0, width, 0);
        strokeGrad.addColorStop(0, accentColor + '00');
        strokeGrad.addColorStop(0.3, baseColor + Math.floor(lineOp * 255).toString(16).padStart(2, '0'));
        strokeGrad.addColorStop(0.7, midColor + Math.floor(lineOp * 220).toString(16).padStart(2, '0'));
        strokeGrad.addColorStop(1, accentColor + '00');

        ctx.strokeStyle = strokeGrad;
        ctx.lineWidth = i % 4 === 0 ? 1.5 : 0.8;
        ctx.stroke();
      }

      // 3. Particles
      for (let i = 0; i < particleList.length; i++) {
        const p = particleList[i];
        const pulse = 0.6 + 0.4 * Math.sin(elapsed * p.speedPhase + p.phase);
        const alpha = (0.2 + p.z * 0.4) * pulse;

        ctx.fillStyle = accentColor;
        ctx.globalAlpha = Math.min(1, alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    };

    const updateParticles = (dt: number) => {
      const stepFactor = Math.min(dt, 0.05) * 60;
      for (let i = 0; i < particleList.length; i++) {
        const p = particleList[i];
        p.x += p.vx * stepFactor;
        p.y += p.vy * stepFactor;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;
      }
    };

    const loop = (now: number) => {
      const dt = Math.max(0, (now - lastTime) / 1000);
      lastTime = now;

      if (!reducedMotion) {
        timeSec += dt * (speed / 35);
        updateParticles(dt);
        renderFrame(timeSec);
        animId = requestAnimationFrame(loop);
      } else {
        renderFrame(timeSec);
      }
    };

    renderFrame(timeSec);
    if (!reducedMotion) {
      animId = requestAnimationFrame(loop);
    }

    const handleResize = () => {
      updateSize();
      renderFrame(timeSec);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [background, baseColor, midColor, accentColor, amplitude, speed, particles, advanced]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background,
        ...style,
      }}
    >
      {isSupported ? (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 50% 50%, ${baseColor}44 0%, ${background} 100%)`,
          }}
        />
      )}
    </div>
  );
};

export default GauzeBlaze;
