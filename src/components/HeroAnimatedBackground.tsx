import React, { useEffect, useRef, useState } from 'react';

interface MineralParticle {
  x: number;
  y: number;
  z: number; // 0.2 (far) to 1.0 (near)
  radius: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
  isGold: boolean;
}

interface GeologicalRibbon {
  baseYRatio: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phaseOffset: number;
  strandCount: number;
  strandSpread: number;
  primaryColor: string;
  accentColor: string;
  opacity: number;
  tilt: number;
}

const RIBBONS: GeologicalRibbon[] = [
  {
    baseYRatio: 0.24,
    amplitude: 34,
    frequency: 0.0022,
    speed: 0.18,
    phaseOffset: 0.0,
    strandCount: 11,
    strandSpread: 4.2,
    primaryColor: '#172554',
    accentColor: '#334E78',
    opacity: 0.42,
    tilt: -0.06,
  },
  {
    baseYRatio: 0.46,
    amplitude: 42,
    frequency: 0.0019,
    speed: 0.14,
    phaseOffset: 1.7,
    strandCount: 14,
    strandSpread: 3.6,
    primaryColor: '#334E78',
    accentColor: '#D4A72C',
    opacity: 0.34,
    tilt: 0.04,
  },
  {
    baseYRatio: 0.68,
    amplitude: 30,
    frequency: 0.0025,
    speed: 0.16,
    phaseOffset: 3.4,
    strandCount: 12,
    strandSpread: 4.0,
    primaryColor: '#172554',
    accentColor: '#F59E0B',
    opacity: 0.3,
    tilt: -0.03,
  },
  {
    baseYRatio: 0.84,
    amplitude: 24,
    frequency: 0.0028,
    speed: 0.11,
    phaseOffset: 4.9,
    strandCount: 9,
    strandSpread: 3.5,
    primaryColor: '#334E78',
    accentColor: '#D4A72C',
    opacity: 0.26,
    tilt: 0.02,
  },
];

export const HeroAnimatedBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [canvasSupported, setCanvasSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d', { alpha: false });
    } catch {
      setCanvasSupported(false);
      return;
    }

    if (!ctx) {
      setCanvasSupported(false);
      return;
    }

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isVisibleInViewport = true;
    let isTabVisible = document.visibilityState === 'visible';
    let animationFrameId: number | null = null;
    let lastTimestamp = performance.now();
    let elapsedSeconds = 12.5; // Start at an aesthetically balanced wave phase

    let particles: MineralParticle[] = [];

    const createParticles = (w: number, h: number): MineralParticle[] => {
      const isMobile = w < 640;
      const isTablet = w >= 640 && w < 1024;
      const count = isMobile ? 10 : isTablet ? 18 : 28;

      const list: MineralParticle[] = [];
      for (let i = 0; i < count; i++) {
        // Place more particles in the central/upper-right and lower channels so the main heading stays crisp
        const z = 0.25 + (i % 7) * 0.11;
        const isGold = i % 3 !== 0;
        list.push({
          x: ((i * 137.5) % 100) * 0.01 * w,
          y: ((i * 73.1) % 100) * 0.01 * h,
          z,
          radius: (isMobile ? 1.0 : 1.35) * (0.55 + z * 0.65),
          vx: (0.06 + z * 0.11) * (i % 2 === 0 ? 1 : -0.7),
          vy: -0.04 - z * 0.06,
          phase: i * 0.85,
          phaseSpeed: 0.4 + (i % 5) * 0.12,
          isGold,
        });
      }
      return list;
    };

    const updateSize = () => {
      if (!container || !canvas || !ctx) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      // Cap DPR at 1.75 for crisp contour lines without excess GPU fill cost
      dpr = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.25 : 1.75);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      particles = createParticles(width, height);
    };

    const drawFrame = (timeSec: number) => {
      if (!ctx || width <= 0 || height <= 0) return;

      const isMobile = width < 640;
      const isTablet = width >= 640 && width < 1024;
      const intensityScale = isMobile ? 0.68 : isTablet ? 0.85 : 1.0;

      // 1. Base Midnight Navy (#0F172A) with subtle deep blue geological depth glow
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      const ambientGrad = ctx.createRadialGradient(
        width * 0.54,
        height * 0.48,
        width * 0.05,
        width * 0.54,
        height * 0.48,
        Math.max(width, height) * 0.78
      );
      ambientGrad.addColorStop(0, 'rgba(23, 37, 84, 0.58)'); // #172554
      ambientGrad.addColorStop(0.52, 'rgba(51, 78, 120, 0.22)'); // #334E78
      ambientGrad.addColorStop(1, 'rgba(15, 23, 42, 0)'); // #0F172A
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Subtle warm mineral aura near the central seam between left copy and right stockpile card
      const mineralSeamGlow = ctx.createRadialGradient(
        width * 0.52,
        height * 0.56,
        10,
        width * 0.52,
        height * 0.56,
        Math.min(width, height) * 0.52
      );
      mineralSeamGlow.addColorStop(0, `rgba(212, 167, 44, ${0.09 * intensityScale})`); // #D4A72C
      mineralSeamGlow.addColorStop(0.55, `rgba(245, 158, 11, ${0.04 * intensityScale})`); // #F59E0B
      mineralSeamGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = mineralSeamGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Flowing Geological Gauze Ribbons & Contour Light Trails
      const stepX = isMobile ? 28 : 20;

      for (let rIdx = 0; rIdx < RIBBONS.length; rIdx++) {
        const ribbon = RIBBONS[rIdx];
        const strandCount = isMobile
          ? Math.max(5, Math.floor(ribbon.strandCount * 0.6))
          : isTablet
          ? Math.max(7, Math.floor(ribbon.strandCount * 0.8))
          : ribbon.strandCount;

        const baseY = height * ribbon.baseYRatio;
        const phase = timeSec * ribbon.speed + ribbon.phaseOffset;

        // Soft ribbon body fill between top and bottom strand for 3D layered depth
        ctx.save();
        const ribbonFillGrad = ctx.createLinearGradient(0, baseY - 60, width, baseY + 60);
        ribbonFillGrad.addColorStop(0, 'rgba(23, 37, 84, 0.0)');
        ribbonFillGrad.addColorStop(0.25, `rgba(23, 37, 84, ${0.22 * intensityScale})`); // #172554
        ribbonFillGrad.addColorStop(0.55, `rgba(51, 78, 120, ${0.18 * intensityScale})`); // #334E78
        ribbonFillGrad.addColorStop(0.82, `rgba(212, 167, 44, ${0.06 * intensityScale})`); // #D4A72C
        ribbonFillGrad.addColorStop(1, 'rgba(15, 23, 42, 0.0)');

        ctx.beginPath();
        for (let x = -stepX; x <= width + stepX; x += stepX) {
          const normX = x / width;
          const yTop =
            baseY +
            (normX - 0.5) * height * ribbon.tilt +
            Math.sin(x * ribbon.frequency + phase) * ribbon.amplitude +
            Math.cos(x * ribbon.frequency * 0.55 - phase * 0.7) * (ribbon.amplitude * 0.42);
          if (x === -stepX) ctx.moveTo(x, yTop);
          else ctx.lineTo(x, yTop);
        }
        for (let x = width + stepX; x >= -stepX; x -= stepX) {
          const normX = x / width;
          const spreadOffset = strandCount * ribbon.strandSpread;
          const yBottom =
            baseY +
            spreadOffset +
            (normX - 0.5) * height * ribbon.tilt +
            Math.sin(x * ribbon.frequency + phase + 0.65) * (ribbon.amplitude * 0.85) +
            Math.cos(x * ribbon.frequency * 0.55 - phase * 0.7 + 0.4) * (ribbon.amplitude * 0.38);
          ctx.lineTo(x, yBottom);
        }
        ctx.closePath();
        ctx.fillStyle = ribbonFillGrad;
        ctx.fill();
        ctx.restore();

        // Individual contour gauze strands with subtle gold/amber light trails on crest strands
        for (let s = 0; s < strandCount; s++) {
          const strandNorm = s / Math.max(1, strandCount - 1); // 0..1
          const isCrestStrand = s === 0 || s === Math.floor(strandCount * 0.5);

          const strandGrad = ctx.createLinearGradient(0, 0, width, 0);
          const baseAlpha =
            ribbon.opacity *
            intensityScale *
            (1 - Math.abs(strandNorm - 0.45) * 0.95);

          if (isCrestStrand) {
            // Subtle warm gold (#D4A72C) & amber (#F59E0B) light trail along the contour crest
            const crestAlpha = Math.max(0.05, baseAlpha * 0.95);
            strandGrad.addColorStop(0, 'rgba(23, 37, 84, 0)');
            strandGrad.addColorStop(0.2, `rgba(51, 78, 120, ${crestAlpha * 0.75})`); // #334E78
            strandGrad.addColorStop(0.48, `rgba(212, 167, 44, ${crestAlpha * 0.95})`); // #D4A72C
            strandGrad.addColorStop(0.68, `rgba(245, 158, 11, ${crestAlpha * 0.7})`); // #F59E0B
            strandGrad.addColorStop(0.9, `rgba(51, 78, 120, ${crestAlpha * 0.5})`);
            strandGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          } else {
            // Deep blue (#172554) and steel blue (#334E78) contour lines
            const lineAlpha = Math.max(0.03, baseAlpha * 0.65);
            strandGrad.addColorStop(0, 'rgba(23, 37, 84, 0)');
            strandGrad.addColorStop(0.18, `rgba(23, 37, 84, ${lineAlpha})`);
            strandGrad.addColorStop(0.5, `rgba(51, 78, 120, ${lineAlpha * 1.15})`);
            strandGrad.addColorStop(0.82, `rgba(23, 37, 84, ${lineAlpha})`);
            strandGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
          }

          ctx.beginPath();
          const strandPhaseShift = s * 0.11;
          const verticalShift = (s - strandCount * 0.5) * ribbon.strandSpread;

          for (let x = -stepX; x <= width + stepX; x += stepX) {
            const normX = x / width;
            // 3D wave Twistmodulation creates gauze-like convergence and divergence
            const twist = Math.sin(normX * Math.PI * 2 + phase * 0.6 + rIdx) * 0.55 + 0.75;
            const wave1 =
              Math.sin(x * ribbon.frequency + phase + strandPhaseShift) *
              ribbon.amplitude;
            const wave2 =
              Math.cos(x * ribbon.frequency * 0.52 - phase * 0.65 + strandPhaseShift * 0.7) *
              (ribbon.amplitude * 0.44);
            const y =
              baseY +
              verticalShift * twist +
              (normX - 0.5) * height * ribbon.tilt +
              wave1 +
              wave2;

            if (x === -stepX) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }

          ctx.strokeStyle = strandGrad;
          ctx.lineWidth = isCrestStrand ? 1.35 : 0.85;
          ctx.stroke();
        }
      }

      // 3. Softly Drifting Mineral Dust Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Suppress brightness if a particle drifts directly behind the primary left heading zone
        const inHeadingZone = p.x < width * 0.42 && p.y > height * 0.18 && p.y < height * 0.75;
        const zoneAttenuation = inHeadingZone ? 0.32 : 1.0;

        const pulse = 0.55 + 0.45 * Math.sin(timeSec * p.phaseSpeed + p.phase);
        const alpha = (0.14 + p.z * 0.28) * pulse * intensityScale * zoneAttenuation;

        // Soft outer mineral glow
        const glowRadius = p.radius * 4.2;
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
        if (p.isGold) {
          glowGrad.addColorStop(0, `rgba(245, 158, 11, ${alpha * 0.85})`); // #F59E0B
          glowGrad.addColorStop(0.45, `rgba(212, 167, 44, ${alpha * 0.35})`); // #D4A72C
          glowGrad.addColorStop(1, 'rgba(212, 167, 44, 0)');
        } else {
          glowGrad.addColorStop(0, `rgba(51, 78, 120, ${alpha * 0.9})`); // #334E78
          glowGrad.addColorStop(0.5, `rgba(23, 37, 84, ${alpha * 0.4})`); // #172554
          glowGrad.addColorStop(1, 'rgba(23, 37, 84, 0)');
        }

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Crisp particle core
        ctx.fillStyle = p.isGold
          ? `rgba(212, 167, 44, ${Math.min(0.75, alpha * 1.3)})`
          : `rgba(148, 163, 184, ${Math.min(0.6, alpha * 1.1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const stepParticles = (dt: number) => {
      if (width <= 0 || height <= 0) return;
      const speedFactor = Math.min(dt, 0.05) * 60;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx * speedFactor;
        p.y += p.vy * speedFactor;

        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;
        if (p.y < -12) p.y = height + 12;
        if (p.y > height + 12) p.y = -12;
      }
    };

    const stopLoop = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const tick = (now: number) => {
      const dt = Math.max(0, (now - lastTimestamp) / 1000);
      lastTimestamp = now;

      if (!prefersReducedMotion && isVisibleInViewport && isTabVisible) {
        elapsedSeconds += dt;
        stepParticles(dt);
        drawFrame(elapsedSeconds);
        animationFrameId = requestAnimationFrame(tick);
      } else {
        animationFrameId = null;
      }
    };

    const syncPlaybackState = () => {
      if (prefersReducedMotion) {
        stopLoop();
        drawFrame(elapsedSeconds);
        return;
      }

      if (isVisibleInViewport && isTabVisible) {
        if (animationFrameId === null) {
          lastTimestamp = performance.now();
          animationFrameId = requestAnimationFrame(tick);
        }
      } else {
        stopLoop();
      }
    };

    updateSize();
    drawFrame(elapsedSeconds);
    syncPlaybackState();

    // ResizeObserver for responsive container changes
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
        drawFrame(elapsedSeconds);
      });
      resizeObserver.observe(container);
    }

    const handleWindowResize = () => {
      updateSize();
      drawFrame(elapsedSeconds);
    };
    window.addEventListener('resize', handleWindowResize, { passive: true });

    // IntersectionObserver to pause when hero section is scrolled out of view
    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            isVisibleInViewport = entry.isIntersecting;
            syncPlaybackState();
          }
        },
        { threshold: 0.02 }
      );
      intersectionObserver.observe(container);
    }

    // Pause when browser tab is hidden
    const handleVisibilityChange = () => {
      isTabVisible = document.visibilityState === 'visible';
      syncPlaybackState();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Listen for prefers-reduced-motion changes
    const handleReducedMotionChange = (event: MediaQueryListEvent) => {
      prefersReducedMotion = event.matches;
      syncPlaybackState();
    };
    reducedMotionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      stopLoop();
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      reducedMotionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-[#0F172A] select-none"
    >
      {/* Layer 2: Animated Geological Gauze & Mineral Contour Canvas (or static gradient fallback) */}
      {canvasSupported ? (
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background:
              'radial-gradient(circle at 55% 45%, rgba(51, 78, 120, 0.35) 0%, rgba(23, 37, 84, 0.55) 45%, #0F172A 100%)',
          }}
        />
      )}

      {/* Layer 3: Subtle Contrast Protection Scrims for Left Hero Copy/CTAs and Right Stockpile Card */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 52% 68% at 24% 50%, rgba(15, 23, 42, 0.62) 0%, rgba(15, 23, 42, 0.24) 62%, rgba(15, 23, 42, 0) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0) 22%, rgba(15, 23, 42, 0) 78%, rgba(15, 23, 42, 0.48) 100%)',
        }}
      />
    </div>
  );
};
