"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

type Kind = "pixel" | "note" | "glitch";

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
const MUSIC_PALETTE = ["#b7ff25", "#f3efdf", "#e0b45f", "#8fdc2c"];
const VIDEO_PALETTE = ["#b7ff25", "#f3efdf", "#8fdc2c"];
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

function modeFor(pathname: string): Kind {
  if (pathname.startsWith("/music")) return "note";
  if (pathname.startsWith("/video") || pathname.startsWith("/vedio")) return "glitch";
  return "pixel";
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

    const mode = modeFor(pathname);
    const isHome = pathname === "/" || pathname.startsWith("/home");
    let shell: HTMLElement | null = null;

    const pickColor = () => {
      if (mode === "note") {
        return MUSIC_PALETTE[Math.floor(Math.random() * MUSIC_PALETTE.length)];
      }
      if (mode === "glitch") {
        return VIDEO_PALETTE[Math.floor(Math.random() * VIDEO_PALETTE.length)];
      }
      if (!isHome) {
        return BASE_PALETTE[Math.floor(Math.random() * BASE_PALETTE.length)];
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

    const particles: Particle[] = [];
    const MAX_PARTICLES = 150;
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
        if (particles.length >= MAX_PARTICLES) particles.shift();
        const angle = Math.random() * Math.PI * 2;
        const velocity = (0.2 + Math.random() * 0.8) * speed;
        const particle: Particle = {
          kind: mode,
          x: x + (Math.random() - 0.5) * spread,
          y: y + (Math.random() - 0.5) * spread,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - 0.2,
          size: 3 + Math.random() * 6,
          seed: Math.random() * Math.PI * 2,
          life: 0,
          maxLife: 34 + Math.random() * 46,
          color: pickColor(),
        };

        if (mode === "note") {
          // 音符:向上漂,左右摇摆,竖条形
          particle.vx = (Math.random() - 0.5) * 0.5;
          particle.vy = -(0.5 + Math.random() * 1.1) * speed * 0.7;
          particle.size = 5 + Math.random() * 10;
          particle.maxLife = 46 + Math.random() * 50;
        } else if (mode === "glitch") {
          // 故障切片:横向抖动,扁平矩形
          particle.vx = (Math.random() < 0.5 ? -1 : 1) * (0.8 + Math.random() * 1.6) * speed * 0.6;
          particle.vy = (Math.random() - 0.5) * 0.3;
          particle.size = 8 + Math.random() * 18;
          particle.maxLife = 22 + Math.random() * 30;
        }

        particles.push(particle);
      }
      wake();
    };

    const draw = (particle: Particle, alpha: number) => {
      const progress = particle.life / particle.maxLife;

      if (particle.kind === "note") {
        // 均衡器竖条:高度随生命周期呼吸
        const sway = Math.sin(particle.life * 0.18 + particle.seed) * 0.9;
        particle.x += sway * 0.6;
        const barWidth = 3 * dpr;
        const barHeight =
          particle.size * (0.8 + 0.4 * Math.sin(particle.life * 0.3 + particle.seed)) * dpr;
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.fillRect(
          Math.round(particle.x * dpr - barWidth / 2),
          Math.round(particle.y * dpr - barHeight),
          Math.round(barWidth),
          Math.round(barHeight),
        );
        return;
      }

      if (particle.kind === "glitch") {
        // 胶片故障切片:红/青色散 + 随机闪烁
        const flicker = 0.55 + Math.random() * 0.45;
        const sliceWidth = particle.size * dpr;
        const sliceHeight = Math.max(2, particle.size * 0.16) * dpr;
        const px = Math.round(particle.x * dpr - sliceWidth / 2);
        const py = Math.round(particle.y * dpr - sliceHeight / 2);
        const offset = Math.max(1, Math.round(2 * dpr));

        context.globalAlpha = alpha * flicker * 0.55;
        context.fillStyle = "#ff4a24";
        context.fillRect(px - offset, py, Math.round(sliceWidth), Math.round(sliceHeight));
        context.fillStyle = "#3ee6ff";
        context.fillRect(px + offset, py, Math.round(sliceWidth), Math.round(sliceHeight));

        context.globalAlpha = alpha * flicker;
        context.fillStyle = particle.color;
        context.fillRect(px, py, Math.round(sliceWidth), Math.round(sliceHeight));
        return;
      }

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
        particle.vx *= particle.kind === "glitch" ? 0.9 : 0.96;
        particle.vy *= particle.kind === "note" ? 0.995 : 0.96;

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
