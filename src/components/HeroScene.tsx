import { useEffect, useRef, type CSSProperties } from "react";
import { solidusWordmark, robotNoEyes, subtleWaveMp4, subtleWaveWebm } from "../assets";

/**
 * Letter slices of solidus-uzrasas.png (1199px wide), cut halfway between
 * glyphs so each letter can drift independently. Values are % of width.
 */
const LETTER_CUTS = [0, 13.5, 30.2, 45.9, 53.5, 70.1, 86.5, 100];

const LETTERS = LETTER_CUTS.slice(0, -1).map((left, i) => {
  const right = LETTER_CUTS[i + 1];
  const center = (left + right) / 2;
  return {
    left,
    right,
    /** -1 (far left) … 1 (far right) */
    k: (center - 50) / 50,
  };
});

type Particle = {
  x: number;
  y: number;
  z: number;
  r: number;
  hue: number;
  phase: number;
};

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    z: 0.25 + Math.random() * 0.75,
    r: 0.6 + Math.random() * 1.6,
    hue: Math.random() < 0.55 ? 205 : 280,
    phase: Math.random() * Math.PI * 2,
  }));
}

/** Eye arc, drawn in a 111×57 box (the eye's size on robot.png). */
function Eye({ side }: { side: "l" | "r" }) {
  const id = `hero-eye-${side}`;
  return (
    <svg className={`hero__eye hero__eye--${side}`} viewBox="0 0 111 57" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8ff7ff" />
          <stop offset="1" stopColor="#3cc8ff" />
        </linearGradient>
      </defs>
      <path
        d="M 9 54 A 46.5 46.5 0 0 1 102 54"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="17"
        strokeLinecap="round"
      />
    </svg>
  );
}

const SPRITE_SIZE = 32;

function makeSprite(hue: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = SPRITE_SIZE;
  const g = c.getContext("2d");
  if (!g) return c;
  const mid = SPRITE_SIZE / 2;
  const grad = g.createRadialGradient(mid, mid, 0, mid, mid, mid);
  grad.addColorStop(0, `hsla(${hue}, 100%, 80%, 1)`);
  grad.addColorStop(0.18, `hsla(${hue}, 100%, 72%, 0.9)`);
  grad.addColorStop(0.32, `hsla(${hue}, 100%, 65%, 0.2)`);
  grad.addColorStop(1, `hsla(${hue}, 100%, 65%, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
  return c;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const settle = (a: number, b: number, t: number) =>
  Math.abs(b - a) < 0.0005 ? b : lerp(a, b, t);
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export default function HeroScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const eyesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const ctx = canvas.getContext("2d");
    const particles = makeParticles(window.innerWidth < 700 ? 45 : 90);
    // Pre-rendered glow dots: one drawImage per particle instead of two
    // path fills + a fresh colour string every frame.
    const sprites = new Map([205, 280].map((hue) => [hue, makeSprite(hue)]));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Target values (raw input) and smoothed values (what we render).
    const target = { mx: 0, my: 0 };
    const state = { mx: 0, my: 0 };

    // Eyes: gaze in -1..1 (smoothed), plus the raw cursor for hit tests.
    const eyes = eyesRef.current;
    const art = artRef.current;
    const pointer = { x: 0, y: 0, lastMove: 0, used: false };
    const gaze = { x: 0, y: 0, tx: 0, ty: 0, nextWander: 0 };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.mx = clamp((e.clientX / window.innerWidth) * 2 - 1, -1, 1);
      target.my = clamp((e.clientY / window.innerHeight) * 2 - 1, -1, 1);
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.lastMove = performance.now();
      pointer.used = true;
    };

    // Only touch the DOM when a value actually changes; rewriting identical
    // custom properties every frame forces a restyle/repaint of the scene.
    const written = new Map<string, string>();
    const write = (el: HTMLElement, name: string, value: string) => {
      const key = el === root ? name : `eyes${name}`;
      if (written.get(key) === value) return;
      written.set(key, value);
      el.style.setProperty(name, value);
    };
    const setClass = (name: string, on: boolean) => {
      if (eyes && eyes.classList.contains(name) !== on) eyes.classList.toggle(name, on);
    };
    const apply = () => {
      write(root, "--mx", state.mx.toFixed(3));
      write(root, "--my", state.my.toFixed(3));
    };

    // Layout read only after scroll/resize, not every frame.
    let artRect: DOMRect | null = null;
    const invalidateRect = () => {
      artRect = null;
    };

    const updateEyes = (now: number) => {
      if (!eyes || !art) return;
      const rect = (artRect ??= art.getBoundingClientRect());
      // Midpoint between the two eyes, as % of the robot image.
      const cx = rect.left + rect.width * 0.62;
      const cy = rect.top + rect.height * 0.256;
      const mouseActive = pointer.used && now - pointer.lastMove < 6000;

      if (mouseActive) {
        gaze.tx = clamp((pointer.x - cx) / 600, -1, 1);
        gaze.ty = clamp((pointer.y - cy) / 450, -1, 1);
      } else if (now > gaze.nextWander) {
        // No mouse (phone, or idle): glance around now and then.
        const centre = Math.random() < 0.35;
        gaze.tx = centre ? 0 : (Math.random() * 2 - 1) * 0.7;
        gaze.ty = centre ? 0 : (Math.random() * 2 - 1) * 0.4;
        gaze.nextWander = now + 1800 + Math.random() * 2600;
      }
      gaze.x = settle(gaze.x, gaze.tx, 0.08);
      gaze.y = settle(gaze.y, gaze.ty, 0.08);

      // Small range so the eyes stay in place on the visor: ±1.6% / ±1%.
      write(eyes, "--ex", `${(gaze.x * rect.width * 0.016).toFixed(1)}px`);
      write(eyes, "--ey", `${(gaze.y * rect.width * 0.01).toFixed(1)}px`);

      const over =
        mouseActive &&
        pointer.x >= rect.left &&
        pointer.x <= rect.right &&
        pointer.y >= rect.top &&
        pointer.y <= rect.bottom;
      setClass("is-happy", over);
      setClass("is-sleepy", pointer.used && now - pointer.lastMove > 12000);
    };

    let blinkTimer = 0;
    const blink = (times: number) => {
      setClass("is-blinking", true);
      blinkTimer = window.setTimeout(() => {
        setClass("is-blinking", false);
        blinkTimer = window.setTimeout(
          () => (times > 1 ? blink(times - 1) : scheduleBlink()),
          times > 1 ? 140 : 0,
        );
      }, 130);
    };
    const scheduleBlink = () => {
      blinkTimer = window.setTimeout(
        () => blink(Math.random() < 0.2 ? 2 : 1),
        2200 + Math.random() * 4200,
      );
    };

    const drawParticles = (t: number) => {
      if (!ctx) return;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, width, height);
      for (const pt of particles) {
        // Slow upward drift, nearer particles move faster.
        const drift = (t * 0.000012 * pt.z) % 1;
        let y = (pt.y - drift + 1) % 1;
        y = y * height;
        const x =
          pt.x * width +
          Math.sin(t * 0.0004 + pt.phase) * 6 * pt.z -
          state.mx * 18 * pt.z;
        const twinkle = 0.55 + 0.45 * Math.sin(t * 0.002 + pt.phase);
        const size = pt.r * pt.z * 7;
        const sprite = sprites.get(pt.hue);
        if (!sprite) continue;
        ctx.globalAlpha = twinkle * pt.z;
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
    };

    apply();

    if (reduced) {
      videoRef.current?.pause();
      drawParticles(0);
      return () => ro.disconnect();
    }

    let visible = true;
    let raf = 0;
    let lastDraw = 0;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (!visible) return;

      state.mx = settle(state.mx, target.mx, 0.06);
      state.my = settle(state.my, target.my, 0.06);

      apply();
      updateEyes(t);
      // Particles drift slowly; 30 fps is indistinguishable and halves the work.
      if (t - lastDraw >= 32) {
        lastDraw = t;
        drawParticles(t);
      }
    };
    raf = requestAnimationFrame(loop);
    scheduleBlink();

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    io.observe(root);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", invalidateRect, { passive: true });
    window.addEventListener("resize", invalidateRect);
    // Image load and the robot's drop-in animation move it too.
    const artRo = new ResizeObserver(invalidateRect);
    if (art) artRo.observe(art);
    const settleTimer = window.setTimeout(invalidateRect, 1500);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(blinkTimer);
      window.clearTimeout(settleTimer);
      artRo.disconnect();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", invalidateRect);
      window.removeEventListener("resize", invalidateRect);
    };
  }, []);

  return (
    <div className="hero__visual" ref={rootRef} aria-hidden="true">
      <canvas className="hero__particles" ref={canvasRef} />
      <div className="hero__halo" />
      {/* Video, not GIF: browsers advance GIF frames unevenly next to other
          animations, which made the waves flicker while the page was idle. */}
      <video
        ref={videoRef}
        className="hero__subtle"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
      >
        <source src={subtleWaveWebm} type="video/webm" />
        <source src={subtleWaveMp4} type="video/mp4" />
      </video>

      <div className="hero__wordmark">
        {LETTERS.map((l, i) => (
          <img
            key={i}
            className="hero__letter"
            src={solidusWordmark}
            alt=""
            style={
              {
                "--k": l.k.toFixed(3),
                "--ak": Math.abs(l.k).toFixed(3),
                "--i": i,
                clipPath: `inset(-20% ${100 - l.right}% -20% ${l.left}%)`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div className="hero__robot">
        <div className="hero__robot-art" ref={artRef}>
          {/* Inside the robot so the glow always sits under its feet. */}
          <div className="hero__floor" />
          {/* robot.png with the eyes painted out; the live eyes are drawn on top. */}
          <img className="hero__robot-img" src={robotNoEyes} alt="" />
          <div className="hero__eyes" ref={eyesRef}>
            <Eye side="l" />
            <Eye side="r" />
          </div>
        </div>
      </div>
    </div>
  );
}
