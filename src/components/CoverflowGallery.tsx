// Coverflow Gallery — Originkit "use client"
import { useState, useEffect, useCallback, useRef, type CSSProperties, } from "react"

const useIsStaticRenderer = () => false

interface Slide {
  image?: {
    src?: string
    srcSet?: string
    alt?: string
  }
  title?: string
}

type AutoplayDir = "leftToRight" | "rightToLeft"
type TitleCorner = "topLeft" | "topRight" | "bottomLeft" | "bottomRight"

interface Smooth3DSlideshowProps {
  slides?: Slide[]
  cardWidth?: number
  cardHeight?: number
  radius?: number
  tilt?: number
  sideTilt?: number
  gap?: number
  opacity?: number
  transition?: any
  autoplay?: boolean
  autoplayDirection?: AutoplayDir
  showTitle?: boolean
  titleFont?: CSSProperties
  titleColor?: string
  titlePosition?: {
    position?: TitleCorner
    paddingLeft?: number
    paddingRight?: number
    paddingTop?: number
    paddingBottom?: number
  }
  style?: CSSProperties
}

const DEFAULT_SLIDES: Slide[] = [
  {
    image: {
      src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/316d1761-fd79-4ca9-b8d4-f2bb20521a00/w=800",
    },
    title: "For Sitting\nMetal\nMinimal",
  },
  {
    image: {
      src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/aeaa0756-9647-4f6c-d900-204bd25e4a00/w=800",
    },
    title: "For Living\nConcrete\nForm",
  },
  {
    image: {
      src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/34ce1842-4b7a-4d52-0302-38582c341700/w=800",
    },
    title: "For Working\nSteel\nClean",
  },
]

const PERSPECTIVE = 1200
const SCALE_STEP = 0.22
const MAX_VISIBLE = 2
const DEPTH = 150

function cssTransition(t: any): { dur: number; ease: string } {
  const dur = t && typeof t.duration === "number" ? t.duration : 0.6
  let ease = "cubic-bezier(0.22, 1, 0.36, 1)"
  const e = t?.ease
  if (Array.isArray(e) && e.length === 4) {
    ease = `cubic-bezier(${e[0]}, ${e[1]}, ${e[2]}, ${e[3]})`
  } else if (typeof e === "string") {
    const map: Record<string, string> = {
      linear: "linear",
      easeIn: "ease-in",
      easeOut: "ease-out",
      easeInOut: "ease-in-out",
    }
    ease = map[e] || "ease"
  }
  return { dur, ease }
}

function __OriginkitBase_Smooth3DSlideshow(props: Smooth3DSlideshowProps) {
  props = { ...COMPONENT_DEFAULTS, ...props } as Smooth3DSlideshowProps
  const {
    slides = DEFAULT_SLIDES,
    cardWidth = 460,
    cardHeight = 320,
    radius = 16,
    tilt = 7,
    sideTilt = 1.5,
    gap = 4.5,
    opacity = 65,
    transition,
    autoplay = false,
    autoplayDirection = "rightToLeft",
    showTitle = true,
    titleFont,
    titleColor = "#ffffff",
    titlePosition,
    style,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(1160)

  useEffect(() => {
    if (!containerRef.current) return
    const updateWidth = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        if (w > 0) setContainerWidth(w)
      }
    }
    updateWidth()
    const ro = new ResizeObserver(updateWidth)
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const isDesktop = containerWidth >= 1024
  const isTablet = containerWidth >= 640 && containerWidth < 1024

  // Responsive calculations:
  // Desktop target: Center card 440-480px wide, 300-330px tall
  // 1 large active center card + 4 background cards (2 left, 2 right)
  let cWidth = cardWidth
  let cHeight = cardHeight
  let scaleStep = 0.16
  let offset1 = 210
  let offset2 = 390
  let rotY = tilt
  let rotZ = sideTilt
  let zDepth = 90

  if (isDesktop) {
    cWidth = Math.min(470, Math.max(450, cardWidth))
    cHeight = Math.min(330, Math.max(310, cardHeight))
    scaleStep = 0.16
    offset1 = 210
    offset2 = 390
    rotY = tilt
    rotZ = sideTilt
    zDepth = 90
  } else if (isTablet) {
    cWidth = Math.min(390, Math.round(containerWidth * 0.44))
    cHeight = Math.round(cWidth * (320 / 460))
    scaleStep = 0.17
    offset1 = Math.round(containerWidth * 0.20)
    offset2 = Math.round(containerWidth * 0.38)
    rotY = 6
    rotZ = 1
    zDepth = 75
  } else {
    // Mobile
    cWidth = Math.min(300, Math.round(containerWidth * 0.72))
    cHeight = Math.round(cWidth * (320 / 460))
    scaleStep = 0.20
    offset1 = Math.round(containerWidth * 0.22)
    offset2 = Math.round(containerWidth * 0.40)
    rotY = 4
    rotZ = 0.5
    zDepth = 55
  }

  const isStatic = useIsStaticRenderer()
  const list = slides && slides.length ? slides : DEFAULT_SLIDES
  const n = list.length
  const loop = true

  const [active, setActive] = useState(0)

  useEffect(() => {
    setActive((a) => Math.max(0, Math.min(n - 1, a)))
  }, [n])

  const moveDur = transition && typeof transition.duration === "number" ? transition.duration : 0.6
  const lockRef = useRef(false)
  const lock = useCallback(() => {
    lockRef.current = true
    window.setTimeout(
      () => {
        lockRef.current = false
      },
      Math.max(50, moveDur * 1000)
    )
  }, [moveDur])

  const step = useCallback(
    (dir: number) => {
      if (lockRef.current) return
      lock()
      setActive((a) => (((a + dir) % n) + n) % n)
    },
    [n, lock]
  )

  const handleCardClick = useCallback(
    (i: number) => {
      if (isStatic || autoplay || lockRef.current) return
      lock()
      setActive((a) => (i === a ? (a + 1) % n : i))
    },
    [isStatic, autoplay, n, lock]
  )

  const delay = transition && typeof transition.delay === "number" ? transition.delay : 2.5
  useEffect(() => {
    if (isStatic || !autoplay || n < 2) return
    const ms = Math.max(0.3, delay) * 1000
    const dir = autoplayDirection === "leftToRight" ? -1 : 1
    const id = window.setInterval(() => step(dir), ms)
    return () => window.clearInterval(id)
  }, [isStatic, autoplay, autoplayDirection, delay, n, step])

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault()
        step(1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        step(-1)
      }
    },
    [step]
  )

  // Touch swipe support for mobile
  const touchStartXRef = useRef<number | null>(null)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }, [])
  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return
    const diff = touchStartXRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) {
      step(diff > 0 ? 1 : -1)
    }
    touchStartXRef.current = null
  }, [step])

  const { dur, ease } = cssTransition(transition)
  const transitionCss = `transform ${dur}s ${ease}, opacity ${dur}s ${ease}`

  // Rounded rectangular cards from original design: 16px border-radius
  const effectiveRadius = typeof radius === 'number' ? radius : 16

  const rootStyle: CSSProperties = {
    ...(style || {}),
    position: "relative",
    width: "100%",
    height: "100%",
    minWidth: 280,
    minHeight: isDesktop ? 400 : isTablet ? 340 : 280,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    perspective: `${PERSPECTIVE}px`,
    overflow: "hidden",
    outline: "none",
  }

  return (
    <div
      ref={containerRef}
      style={rootStyle}
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      onKeyDown={isStatic ? undefined : onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        style={{
          position: "relative",
          width: cWidth,
          height: cHeight,
          transformStyle: "preserve-3d",
        }}
      >
        {list.map((slide, i) => {
          let rel = i - active
          if (loop) {
            if (rel > n / 2) rel -= n
            if (rel < -n / 2) rel += n
          }

          const ax = Math.abs(rel)
          // Exactly 1 active center card + 4 background cards (2 left, 2 right)
          const visible = ax <= 2
          const isActive = rel === 0

          const sc = Math.max(0.48, 1 - ax * scaleStep)
          let tx = 0
          if (ax === 1) {
            tx = rel * offset1
          } else if (ax === 2) {
            tx = (rel / 2) * offset2
          }
          const tz = -ax * zDepth
          const ry = -rel * rotY
          const rz = rel * rotZ

          const src = slide.image?.src || ""

          const cardStyle: CSSProperties = {
            position: "absolute",
            left: "50%",
            top: "50%",
            width: cWidth,
            height: cHeight,
            borderRadius: effectiveRadius,
            overflow: "hidden",
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
            transform: `translate(-50%, -50%) translateX(${tx}px) translateZ(${tz}px) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${sc})`,
            transition: transitionCss,
            opacity: visible ? 1 : 0,
            cursor: isActive ? "default" : "pointer",
            pointerEvents: visible && !isStatic ? "auto" : "none",
            backgroundColor: "#0a2a6b",
            // Center card (ax=0) overlaps inner cards (ax=1), which overlap outer cards (ax=2)
            zIndex: visible ? 30 - ax * 10 : 0,
            boxShadow: isActive
              ? "0 25px 50px -12px rgba(0,0,0,0.7), 0 0 25px rgba(245,158,11,0.25)"
              : "0 12px 28px -10px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }

          return (
            <div
              key={i}
              style={cardStyle}
              onClick={
                isStatic ? undefined : () => handleCardClick(i)
              }
              aria-label={slide.title}
              aria-hidden={!visible}
            >
              {src ? (
                <img
                  src={src}
                  alt={slide.image?.alt || slide.title || ""}
                  draggable={false}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                    userSelect: "none",
                    borderRadius: effectiveRadius,
                  }}
                />
              ) : null}

              {/* Dimming overlay to emphasize active card while keeping background cards distinct */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#030a1c",
                  opacity: isActive ? 0 : ax === 1 ? 0.24 : 0.44,
                  transition: `opacity ${dur}s ${ease}`,
                  pointerEvents: "none",
                  zIndex: 10,
                  borderRadius: effectiveRadius,
                }}
              />

              {/* Title Overlay with high z-index, centered horizontally at the bottom of every card */}
              {showTitle && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: isDesktop ? "38px 18px 20px 18px" : "26px 14px 14px 14px",
                    background: "linear-gradient(to top, rgba(3, 10, 28, 0.96) 0%, rgba(3, 10, 28, 0.72) 65%, transparent 100%)",
                    pointerEvents: "none",
                    zIndex: 20,
                    borderBottomLeftRadius: effectiveRadius,
                    borderBottomRightRadius: effectiveRadius,
                  }}
                >
                  <span
                    style={{
                      color: titleColor || "#ffffff",
                      fontSize: isDesktop ? 22 : isTablet ? 18 : 15,
                      fontWeight: 700,
                      lineHeight: "1.25em",
                      letterSpacing: "-0.01em",
                      textAlign: "center",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      textShadow: "0 2px 8px rgba(0,0,0,0.85)",
                      display: "block",
                      maxWidth: "100%",
                      width: "100%",
                      margin: "0 auto",
                      ...(titleFont || {}),
                    }}
                  >
                    {slide.title}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const COMPONENT_DEFAULTS = {
  slides: [
    {
      image: {
        src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/7d4d2641-d6a8-4fef-e85c-b12ed100d500/w=800",
      },
      title: "James Walker",
    },
    {
      image: {
        src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/933a7615-f4b6-4eae-8ed1-705fa0e24400/w=800",
      },
      title: "Olivia Carter",
    },
    {
      image: {
        src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/859c75ea-953e-489e-be61-91a03a35d700/w=800",
      },
      title: "Amelia Foster",
    },
    {
      image: {
        src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/31afae9c-5ba3-4ec3-2534-ed8198ed1100/w=800",
      },
      title: "Benjamin Harris",
    },
    {
      image: {
        src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/ed7b1c40-3332-43d8-a9eb-4615ef341b00/w=800",
      },
      title: "Lucas Martin",
    },
  ],
  cardWidth: 460,
  cardHeight: 320,
  radius: 16,
  tilt: 7,
  sideTilt: 1.5,
  gap: 4.5,
  opacity: 65,
  autoplay: false,
  autoplayDirection: "rightToLeft",
  transition: {
    type: "tween",
    duration: 0.6,
    delay: 2.5,
    ease: [0.22, 1, 0.36, 1],
  },
  showTitle: true,
  titleFont: {
    fontFamily: "inherit",
    variant: "Bold",
    fontSize: 22,
    letterSpacing: "-0.01em",
    lineHeight: "1.25em",
    textAlign: "center",
  } as any,
  titleColor: "#ffffff",
  titlePosition: {
    position: "bottomCenter",
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
}

const __originkitPresetProps = {
  "showTitle": true
};

export default function Smooth3DSlideshow(props: Record<string, unknown>) {
  return <__OriginkitBase_Smooth3DSlideshow {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
