"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Kind = "pixel";

type Particle = {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  seed: number;
  life: number;
  maxLife: number;
  color: string;
};

const BASE_PALETTE = ["#111111", "#b7ff25", "#4f5bff", "#f3efdf"];
const LIGHT_PALETTE = ["#111111", "#4f5bff", "#b7ff25", "#555555"];

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

export default function PixelCursor() {
  const pathname = usePathname() ?? "/";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // photos / music 房间有自己的沉浸交互,不叠加光标粒子
  const disabled = pathname.startsWith("/photos") || pathname.startsWith("/music");

  useEffect(() => {
    if (disabled) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const isVideos = pathname.startsWith("/video") || pathname.startsWith("/vedio");
    const isHome = pathname === "/" || pathname.startsWith("/home");
    let shell: HTMLElement | null = null;

    const heroIsLight = () => {
      if (!shell || !shell.isConnected) {
        shell = document.querySelector<HTMLElement>(".portfolio-shell");
      }
      return shell?.classList.contains("hero-theme-light") ?? false;
    };

    const pickColor = (kind: Kind) => {
      void kind;
      if (!isHome) {
        return BASE_PALETTE[Math.floor(Math.random() * BASE_PALETTE.length)];
      }
      if (heroIsLight()) {
        return LIGHT_PALETTE[Math.floor(Math.random() * LIGHT_PALETTE.length)];
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

    const particles: Particle[] = [];
    const MAX_PARTICLES = 260;
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
      const kind: Kind = "pixel";

      for (let i = 0; i < count; i += 1) {
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = Math.random() * Math.PI * 2;
        const velocity = (0.2 + Math.random() * 0.8) * speed;
        const particle: Particle = {
          kind,
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 0.2,
          size: 3 + Math.random() * 6,
          seed: Math.random() * Math.PI * 2,
          life: 0,
          maxLife: 34 + Math.random() * 46,
          color: pickColor(kind),
        };

        particles.push(particle);
      }
      wake();
    };

    const draw = (particle: Particle, alpha: number) => {
      const progress = particle.life / particle.maxLife;

      const size = particle.size * (1 - progress * 0.4) * dpr;
      context.globalAlpha = alpha;
      context.fillStyle = particle.color;
      context.fillRect(
        Math.round(particle.x * dpr - size / 2),
        Math.round(particle.y * dpr - size / 2),
        Math.round(size),
        Math.round(size),
      );
    };

    const step = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const particle = particles[i];
        particle.life += 1;
        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.96;
        particle.vy *= 0.96;

        const progress = particle.life / particle.maxLife;
        const alpha = progress < 0.7 ? 1 : 1 - (progress - 0.7) / 0.3;
        draw(particle, alpha);
      }

      context.globalAlpha = 1;

      if (particles.length > 0) {
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
      if (isVideos) return;

      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const travelled = Math.hypot(dx, dy);
      if (lastX >= 0 && travelled < 6) return;
      lastX = event.clientX;
      lastY = event.clientY;

      // 首页 MUSIC 章节有自己的粒子/声音互动,这里让位
      if (isHome && (event.target as HTMLElement | null)?.closest?.(".mp-root")) return;

      spawn(event.clientX, event.clientY, travelled > 40 ? 5 : 3, 20, 1.2);
    };

    const onPointerOver = (event: PointerEvent) => {
      if (isVideos) return;
      const target = event.target as HTMLElement | null;
      if (!target?.closest("a, button, [role='button'], [role='tab']")) return;
      if (isHome && target?.closest(".mp-root")) return;
      spawn(event.clientX, event.clientY, 8, 30, 2.2);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (isVideos) return;
      if (isHome && (event.target as HTMLElement | null)?.closest?.(".mp-root")) return;
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
