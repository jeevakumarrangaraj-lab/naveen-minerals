import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const EMBLEM_SRC = '/assets/splash/splash-emblem.png';

interface Particle {
  x: number;
  y: number;
  startX: number;
  startY: number;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  targetX: number;
  targetY: number;
  size: number;
  color: string;
  alpha: number;
  delay: number;
}

export const SplashScreen: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showEmblem, setShowEmblem] = useState(false);
  const [showTagline, setShowTagline] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const isFinishedRef = useRef(false);

  const finishSplash = () => {
    if (isFinishedRef.current) return;
    isFinishedRef.current = true;
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    document.body.style.overflow = '';
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem('naveen_splash_seen', 'true');
      onComplete?.();
    }, 450);
  };

  useEffect(() => {
    // 1. Session Storage & ?splash=1 URL test parameter check
    const forceSplash = typeof window !== 'undefined' && window.location.search.includes('splash=1');
    const seen = sessionStorage.getItem('naveen_splash_seen');

    if (seen && !forceSplash) {
      setIsVisible(false);
      onComplete?.();
      return;
    }

    // 2. Lock body scroll while splash is active
    document.body.style.overflow = 'hidden';

    // 3. Safety 8-Second Timeout so splash can NEVER hang or block the site
    const safetyTimer = setTimeout(() => {
      finishSplash();
    }, 8000);

    // 4. Check prefers-reduced-motion
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setShowEmblem(true);
      setShowTagline(true);
      const reducedTimer = setTimeout(() => {
        finishSplash();
      }, 1000);
      return () => {
        clearTimeout(safetyTimer);
        clearTimeout(reducedTimer);
        document.body.style.overflow = '';
      };
    }

    // 5. Canvas Particle Engine Setup - START IMMEDIATELY
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const isMobile = width < 768;
    const targetParticleCount = isMobile ? 1200 : 2500;

    const colors = ['#FFFFFF', '#FFF7ED', '#F5B301', '#FFD700', '#FDE047'];

    // Generate ambient swirling particles IMMEDIATELY before image finishes loading
    let particles: Particle[] = Array.from({ length: targetParticleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (isMobile ? 180 : 320) + 100;
      const startX = width / 2 + Math.cos(angle) * radius;
      const startY = height / 2 + Math.sin(angle) * radius;

      return {
        x: startX,
        y: startY,
        startX,
        startY,
        orbitAngle: angle,
        orbitRadius: radius,
        orbitSpeed: (Math.random() * 0.02 + 0.01) * (Math.random() > 0.5 ? 1 : -1),
        targetX: startX,
        targetY: startY,
        size: Math.random() * 1.5 + 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.5,
        delay: Math.random() * 0.35,
      };
    });

    let imageLoaded = false;
    let startTime = performance.now();

    // Parallel Image Loading & Sampling
    const img = new Image();
    img.src = EMBLEM_SRC;
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      if (isFinishedRef.current) return;

      const offCanvas = document.createElement('canvas');
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      const logoWidth = isMobile ? Math.min(width * 0.72, 260) : Math.min(width * 0.45, 360);
      const logoHeight = logoWidth * (img.height / img.width);

      offCanvas.width = Math.floor(logoWidth);
      offCanvas.height = Math.floor(logoHeight);

      offCtx.drawImage(img, 0, 0, offCanvas.width, offCanvas.height);
      const imgData = offCtx.getImageData(0, 0, offCanvas.width, offCanvas.height);
      const data = imgData.data;

      // Background color detection
      const cornerIndices = [
        0,
        (offCanvas.width - 1) * 4,
        ((offCanvas.height - 1) * offCanvas.width) * 4,
        ((offCanvas.height - 1) * offCanvas.width + (offCanvas.width - 1)) * 4,
      ];

      let hasAlphaBg = false;
      let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;

      cornerIndices.forEach((idx) => {
        const a = data[idx + 3];
        if (a < 50) {
          hasAlphaBg = true;
        } else {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
          bgCount++;
        }
      });

      if (bgCount > 0) {
        bgR = Math.round(bgR / bgCount);
        bgG = Math.round(bgG / bgCount);
        bgB = Math.round(bgB / bgCount);
      }

      const isValidPixel = (r: number, g: number, b: number, a: number) => {
        if (a < 50) return false;
        if (!hasAlphaBg && bgCount > 0) {
          const dist = Math.sqrt(Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2));
          if (dist < 45) return false;
        }
        return true;
      };

      const validPoints: { x: number; y: number }[] = [];
      const offsetX = (width - logoWidth) / 2;
      const offsetY = (height - logoHeight) / 2 - (isMobile ? 30 : 40);

      for (let y = 0; y < offCanvas.height; y += 2) {
        for (let x = 0; x < offCanvas.width; x += 2) {
          const idx = (y * offCanvas.width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const a = data[idx + 3];

          if (isValidPixel(r, g, b, a)) {
            validPoints.push({
              x: offsetX + x,
              y: offsetY + y,
            });
          }
        }
      }

      // Shuffle valid points
      for (let i = validPoints.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [validPoints[i], validPoints[j]] = [validPoints[j], validPoints[i]];
      }

      // Assign target coordinates to existing particles
      particles.forEach((p, idx) => {
        const pt = validPoints[idx % validPoints.length];
        if (pt) {
          p.targetX = pt.x;
          p.targetY = pt.y;
        }
      });

      imageLoaded = true;
    };

    // Render loop starts synchronously on mount
    let lastFrameTime = startTime;
    let slowFramesCount = 0;

    const render = (now: number) => {
      if (isFinishedRef.current) return;

      const delta = now - lastFrameTime;
      lastFrameTime = now;

      if (delta > 36) {
        slowFramesCount++;
        if (slowFramesCount > 3 && particles.length > 800) {
          particles = particles.filter((_, idx) => idx % 2 === 0);
          slowFramesCount = 0;
        }
      }

      const elapsed = (now - startTime) / 1000;

      ctx.fillStyle = '#050B18';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2 - (isMobile ? 30 : 40);

      // 1. Draw 3D Tilting Gold Ring
      if (elapsed < 3.2) {
        const ringAlpha = Math.min(elapsed / 0.8, 1) * (elapsed > 2.4 ? (3.2 - elapsed) / 0.8 : 1);
        if (ringAlpha > 0) {
          ctx.save();
          ctx.translate(centerX, centerY);
          ctx.rotate(elapsed * 0.4);
          ctx.scale(1.0, 0.45 + Math.sin(elapsed * 1.5) * 0.15);

          const ringRadius = isMobile ? 85 : 125;
          ctx.beginPath();
          ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 179, 1, ${ringAlpha * 0.75})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#F5B301';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 2. Draw & Animate Particles
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      particles.forEach((p) => {
        let currentX = p.x;
        let currentY = p.y;
        let pAlpha = p.alpha;

        if (elapsed < 1.0 || !imageLoaded) {
          // Phase 1: Drifting In / Orbiting
          const tPhase = Math.min(elapsed / 1.0, 1);
          currentX = p.startX + (centerX + Math.cos(p.orbitAngle) * p.orbitRadius - p.startX) * tPhase;
          currentY = p.startY + (centerY + Math.sin(p.orbitAngle) * p.orbitRadius - p.startY) * tPhase;
          pAlpha = tPhase * p.alpha;
        } else if (elapsed < 2.0) {
          // Phase 2: Swirling Orbit
          p.orbitAngle += p.orbitSpeed;
          const orbitT = (elapsed - 1.0) / 1.0;
          const currentRadius = p.orbitRadius * (1 - orbitT * 0.3);
          currentX = centerX + Math.cos(p.orbitAngle) * currentRadius;
          currentY = centerY + Math.sin(p.orbitAngle) * currentRadius;
        } else if (elapsed < 3.2) {
          // Phase 3: Pull to Target Emblem
          const pElapsed = Math.max(0, elapsed - 2.0 - p.delay);
          const progress = Math.min(pElapsed / (1.2 - p.delay), 1);
          const ease = 1 - Math.pow(1 - progress, 3);

          const lastOrbitX = centerX + Math.cos(p.orbitAngle) * (p.orbitRadius * 0.7);
          const lastOrbitY = centerY + Math.sin(p.orbitAngle) * (p.orbitRadius * 0.7);

          currentX = lastOrbitX + (p.targetX - lastOrbitX) * ease;
          currentY = lastOrbitY + (p.targetY - lastOrbitY) * ease;
        } else {
          // Phase 4: Settle & Fade Out
          currentX = p.targetX;
          currentY = p.targetY;
          const fadeT = Math.min((elapsed - 3.2) / 0.7, 1);
          pAlpha = p.alpha * (1 - fadeT);
        }

        p.x = currentX;
        p.y = currentY;

        if (pAlpha > 0.01) {
          ctx.beginPath();
          ctx.arc(currentX, currentY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, pAlpha));
          ctx.fill();
        }
      });

      ctx.restore();

      // Trigger Phase 4 Crossfade (3.2s)
      if (elapsed >= 3.2 && !showEmblem) {
        setShowEmblem(true);
      }

      // Trigger Phase 5 Tagline Fade (4.0s)
      if (elapsed >= 4.0 && !showTagline) {
        setShowTagline(true);
      }

      // Trigger Finish (4.6s)
      if (elapsed >= 4.6) {
        finishSplash();
      }

      if (!isFinishedRef.current) {
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      clearTimeout(safetyTimer);
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      aria-label={t('splash.loading', 'Loading Cinematic Splash Screen')}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#050B18] transition-opacity duration-700 select-none overflow-hidden ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Canvas for Particle Physics & 3D Gold Ring */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
      />

      {/* Foreground Content Container */}
      <div className="relative z-10 flex flex-col items-center px-4 max-w-xl mx-auto text-center pointer-events-none -mt-10 sm:-mt-12">
        {/* Full-Color Eagle Emblem Cross-Fade Layer */}
        <div
          className={`relative mb-6 transform transition-all duration-1000 ${
            showEmblem ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-[#FFD700]/20 via-[#38BDF8]/20 to-[#FFD700]/20 rounded-full blur-2xl opacity-80 animate-pulse" />
          <img
            src={EMBLEM_SRC}
            alt={t('splash.alt', 'Naveen Minerals Eagle Emblem')}
            className="relative w-[72vw] max-w-[260px] sm:w-[45vw] sm:max-w-[360px] h-auto object-contain drop-shadow-[0_12px_35px_rgba(0,0,0,0.9)]"
          />
        </div>

        {/* Tagline & Brand Title Fade-In Layer */}
        <div
          className={`space-y-2 transition-all duration-1000 ${
            showTagline ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
        >
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-[#FDE047] via-[#FFD700] to-[#CA8A04] drop-shadow-md">
            NAVEEN MINERALS
          </h1>
          <p className="text-xs sm:text-sm font-semibold tracking-[0.22em] text-slate-200 uppercase">
            {t('about.tagline', 'Quality Materials. Reliable Supply.')}
          </p>
        </div>
      </div>

      {/* Skip Button - z-[100000] clickable above everything */}
      <button
        type="button"
        onClick={finishSplash}
        className="absolute bottom-8 right-8 z-[100000] text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all border border-white/15 backdrop-blur-md cursor-pointer pointer-events-auto"
      >
        {t('splash.skip', 'Skip Intro')}
      </button>
    </div>
  );
};

export default SplashScreen;
