"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Pixel = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
};

const BASE_PALETTE = ["#111111", "#b7ff25", "#4f5bff", "#f3efdf"];
const MUSIC_PALETTE = ["#b7ff25", "#f3efdf", "#e0b45f", "#8fdc2c"];
const VIDEO_PALETTE = ["#b7ff25", "#111111", "#f3efdf", "#8fdc2c"];
const LIGHT_HERO_PALETTE = ["#111111", "#4f5bff", "#b7ff25", "#555555"];

// 与首页 WebGL 背景同一套章节强调色(绿 → 橙 → 红)
const HOME_ACCENTS = [
  [183, 255, 37],
  [206, 236, 126],
  [114, 192, 178],
  [245, 222, 188],
  [255, 118, 54],
  [255, 74, 36],
];

function homeAccentAt(sceneIndex: number) {
  const clamped = Math.max(0, Math.min(HOME_ACCENTS.length - 1, sceneIndex));
  const baseIndex = Math.floor(clamped);
  const nextIndex = Math.min(HOME_ACCENTS.length - 1, baseIndex + 1);
  const mix = clamped - baseIndex;
  const base = HOME_ACCENTS[baseIndex];
  const next = HOME_ACCENTS[nextIndex];
  return base.map((value, index) => Math.round(value + (next[index] - value) * mix));
}

function paletteFor(pathname: string) {
  if (pathname.startsWith("/music")) return MUSIC_PALETTE;
  if (pathname.startsWith("/video") || pathname.startsWith("/vedio")) return VIDEO_PALETTE;
  return BASE_PALETTE;
}

export default function PixelCursor() {
  const pathname = usePathname() ?? "/";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disabled = pathname.startsWith("/photos");

  useEffect(() => {
    if (disabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const palette = paletteFor(pathname);
    const isHome = pathname === "/" || pathname.startsWith("/home");
    let shell: HTMLElement | null = null;

    const pickColor = () => {
      if (!isHome) {
        return palette[Math.floor(Math.random() * palette.length)];
      }

      if (!shell || !shell.isConnected) {
        shell = document.querySelector<HTMLElement>(".portfolio-shell");
      }

      // 浅色 Hero(猫咪区):黑 / 蓝 / 酸绿
      if (shell?.classList.contains("hero-theme-light")) {
        return LIGHT_HERO_PALETTE[Math.floor(Math.random() * LIGHT_HERO_PALETTE.length)];
      }

      // 深色章节:跟随背景当前的章节强调色(绿 → 橙 → 红)
      const raw = shell?.style.getPropertyValue("--scene-index");
      const sceneIndex = raw ? Number.parseFloat(raw) : 0;
      const [r, g, b] = homeAccentAt(Number.isFinite(sceneIndex) ? sceneIndex : 0);
      const roll = Math.random();
      if (roll < 0.5) return `rgb(${r} ${g} ${b})`;
      if (roll < 0.74) return "#f3efdf";
      if (roll < 0.9) {
        return `rgb(${Math.round(r * 0.55)} ${Math.round(g * 0.55)} ${Math.round(b * 0.55)})`;
      }
      return "#111111";
    };

    const pixels: Pixel[] = [];
    const MAX_PIXELS = 140;
    let raf = 0;
    let running = false;
    let lastX = -1;
    let lastY = -1;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const spawn = (x: number, y: number, count: number, spread: number, speed: number) => {
      for (let i = 0; i < count; i += 1) {
        if (pixels.length >= MAX_PIXELS) pixels.shift();
        const angle = Math.random() * Math.PI * 2;
        const velocity = (0.2 + Math.random() * 0.8) * speed;
        pixels.push({
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 0.2,
          size: 3 + Math.random() * 6,
          life: 0,
          maxLife: 34 + Math.random() * 46,
          color: pickColor(),
        });
      }
      wake();
    };

    const step = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = pixels.length - 1; i >= 0; i -= 1) {
        const pixel = pixels[i];
        pixel.life += 1;
        if (pixel.life >= pixel.maxLife) {
          pixels.splice(i, 1);
          continue;
        }

        pixel.x += pixel.vx;
        pixel.y += pixel.vy;
        pixel.vx *= 0.96;
        pixel.vy *= 0.96;

        const progress = pixel.life / pixel.maxLife;
        const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
        const size = pixel.size * (1 - progress * 0.4) * dpr;

        context.globalAlpha = alpha;
        context.fillStyle = pixel.color;
        context.fillRect(
          Math.round(pixel.x * dpr - size / 2),
          Math.round(pixel.y * dpr - size / 2),
          Math.round(size),
          Math.round(size),
        );
      }

      context.globalAlpha = 1;

      if (pixels.length > 0) {
        raf = window.requestAnimationFrame(step);
      } else {
        running = false;
      }
    };

    const wake = () => {
      if (!running) {
        running = true;
        raf = window.requestAnimationFrame(step);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const travelled = Math.hypot(dx, dy);
      if (lastX >= 0 && travelled < 6) return;
      lastX = event.clientX;
      lastY = event.clientY;
      spawn(event.clientX, event.clientY, travelled > 40 ? 5 : 3, 20, 1.2);
    };

    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target?.closest("a, button, [role='button'], [role='tab']")) return;
      spawn(event.clientX, event.clientY, 8, 30, 2.2);
    };

    const onPointerDown = (event: PointerEvent) => {
      spawn(event.clientX, event.clientY, 14, 20, 3.2);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerover", onPointerOver, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerover", onPointerOver);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [disabled, pathname]);

  if (disabled) return null;

  return <canvas ref={canvasRef} className="pixel-cursor-layer" aria-hidden="true" />;
}
