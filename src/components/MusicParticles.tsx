"use client";

import type { MutableRefObject, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type Locale = "en" | "zh";
type AudioState = "locked" | "loading" | "ready" | "error";
type Particle = {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  tinted: boolean;
};
type Hit = { time: number; strength: number };

const PARTICLE_TEXT = "MUSIC";
const PHRASE_SECONDS = 3.2;
const PHRASE_GAP_SECONDS = 3.05;
const MAX_ACTIVE_PHRASES = 1;

function shouldConserveParticleEffects() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;

  const reducedData = window.matchMedia?.("(prefers-reduced-data: reduce)").matches ?? false;
  const platform = navigator.platform ?? "";
  const userAgent = navigator.userAgent ?? "";
  const appleLike = /Mac|iPhone|iPad|iPod/i.test(platform) || /Macintosh|Mac OS X/i.test(userAgent);
  const cores = navigator.hardwareConcurrency || 8;

  return reducedData || appleLike || cores <= 8;
}

function hasUserActivatedAudio() {
  if (typeof navigator === "undefined") return false;

  const activation = (navigator as Navigator & { userActivation?: { hasBeenActive?: boolean } }).userActivation;
  return activation?.hasBeenActive === true;
}

const copy = {
  en: {
    audioLocked: "Move across the title",
    audioLoading: "Loading tone",
    audioReady: "Move across the title",
    audioError: "Audio unavailable",
    cta: "Enter music space",
    status: ["sample ready", "particle score", "soft mode", "diversity map"],
  },
  zh: {
    audioLocked: "划过标题弹奏",
    audioLoading: "正在载入音色",
    audioReady: "划过标题弹奏",
    audioError: "音色暂不可用",
    cta: "进入音乐空间",
    status: ["sample ready", "particle score", "soft mode", "diversity map"],
  },
} as const;

function useSampler(
  sampleUrl: string,
  hitSink: MutableRefObject<((hit: Hit) => void) | null>,
  shouldPreload: boolean,
) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const audioOutputRef = useRef<GainNode | null>(null);
  const sampleBytesRef = useRef<ArrayBuffer | null>(null);
  const decodePromiseRef = useRef<Promise<AudioBuffer | null> | null>(null);
  const voiceCountRef = useRef(0);
  const lastNoteRef = useRef(-PHRASE_GAP_SECONDS);
  const samplePlayheadRef = useRef(0);
  const lastFxRef = useRef(0);
  const audioStateRef = useRef<AudioState>("locked");
  const [audioState, setAudioState] = useState<AudioState>("locked");

  const setAudioStatus = useCallback((state: AudioState) => {
    audioStateRef.current = state;
    setAudioState(state);
  }, []);

  const createAudioContext = useCallback(() => {
    const AudioContextClass =
      window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) {
      setAudioStatus("error");
      return null;
    }

    const context = audioContextRef.current ?? new AudioContextClass();
    audioContextRef.current = context;
    return context;
  }, [setAudioStatus]);

  const ensureOutput = useCallback((context: AudioContext) => {
    if (audioOutputRef.current) return;

    const master = context.createGain();
    const delay = context.createDelay();
    const feedback = context.createGain();
    const wet = context.createGain();

    master.gain.value = 0.82;
    delay.delayTime.value = 0.24;
    feedback.gain.value = 0.22;
    wet.gain.value = 0.18;

    master.connect(context.destination);
    master.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(context.destination);
    audioOutputRef.current = master;
  }, []);

  const decodeSample = useCallback(async (context: AudioContext) => {
    if (audioBufferRef.current) return audioBufferRef.current;

    setAudioStatus("loading");

    let bytes = sampleBytesRef.current;
    if (!bytes) {
      const response = await fetch(sampleUrl);
      if (!response.ok) throw new Error("Audio sample missing");
      bytes = await response.arrayBuffer();
      sampleBytesRef.current = bytes;
    }

    decodePromiseRef.current ??= context
      .decodeAudioData(bytes.slice(0))
      .then((buffer) => {
        audioBufferRef.current = buffer;
        return buffer;
      })
      .catch(() => null);

    const decoded = await decodePromiseRef.current;
    if (!decoded) {
      setAudioStatus("error");
      return null;
    }

    setAudioStatus("ready");
    return decoded;
  }, [sampleUrl, setAudioStatus]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    if (!shouldPreload || audioBufferRef.current || decodePromiseRef.current) return;

    let cancelled = false;
    const idle = window.requestIdleCallback?.bind(window);
    const cancelIdle = window.cancelIdleCallback?.bind(window);

    const preload = () => {
      if (cancelled) return;
      const context = createAudioContext();
      if (!context) return;
      ensureOutput(context);
      void decodeSample(context).catch(() => {
        if (!cancelled) setAudioStatus("error");
      });
    };

    if (idle && cancelIdle) {
      const idleId = idle(preload, { timeout: 900 });
      return () => {
        cancelled = true;
        cancelIdle(idleId);
      };
    }

    const timer = window.setTimeout(preload, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [createAudioContext, decodeSample, ensureOutput, setAudioStatus, shouldPreload]);

  const warm = useCallback(async () => {
    try {
      const context = createAudioContext();
      if (!context) return false;
      ensureOutput(context);
      return Boolean(await decodeSample(context));
    } catch {
      setAudioStatus("error");
      return false;
    }
  }, [createAudioContext, decodeSample, ensureOutput, setAudioStatus]);

  const ensure = useCallback(async () => {
    try {
      const context = createAudioContext();
      if (!context) return null;
      await context.resume();

      ensureOutput(context);
      const decoded = await decodeSample(context);
      if (!decoded) return null;

      setAudioStatus("ready");
      return context;
    } catch {
      setAudioStatus("error");
      return null;
    }
  }, [createAudioContext, decodeSample, ensureOutput, setAudioStatus]);

  const play = useCallback(
    (strength = 1, xRatio = 0.5, yRatio = 0.5) => {
      const nowMs = performance.now();
      if (nowMs - lastFxRef.current > 54) {
        lastFxRef.current = nowMs;
        hitSink.current?.({ time: nowMs, strength });
      }

      const context = audioContextRef.current;
      const buffer = audioBufferRef.current;
      const output = audioOutputRef.current;
      if (!context || !buffer || !output || audioStateRef.current !== "ready") return;

      if (context.state === "suspended") context.resume().catch(() => undefined);

      const now = context.currentTime;
      if (now - lastNoteRef.current < PHRASE_GAP_SECONDS || voiceCountRef.current >= MAX_ACTIVE_PHRASES) return;
      lastNoteRef.current = now;
      voiceCountRef.current += 1;

      const sliceLength = Math.min(PHRASE_SECONDS, Math.max(1.2, buffer.duration - 0.2));
      const span = Math.max(0.12, buffer.duration - sliceLength - 0.08);
      const playhead = samplePlayheadRef.current % span;
      const offsetDrift = (xRatio - 0.5) * 0.18 + (0.5 - yRatio) * 0.08;
      const offset = Math.max(0, Math.min(span, playhead + offsetDrift));
      samplePlayheadRef.current = (playhead + sliceLength * 0.92) % span;
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      const pan = typeof window.StereoPannerNode === "undefined" ? null : context.createStereoPanner();

      source.buffer = buffer;
      source.playbackRate.setValueAtTime(1, now);
      filter.type = "highpass";
      filter.frequency.setValueAtTime(240, now);
      filter.Q.setValueAtTime(0.48, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.42 + strength * 0.12, now + 0.09);
      gain.gain.setValueAtTime(0.3 + strength * 0.06, now + Math.max(0.3, sliceLength - 0.48));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + sliceLength);

      source.connect(filter);
      filter.connect(gain);
      if (pan) {
        pan.pan.setValueAtTime((xRatio - 0.5) * 0.52, now);
        gain.connect(pan);
        pan.connect(output);
      } else {
        gain.connect(output);
      }

      source.onended = () => {
        voiceCountRef.current = Math.max(0, voiceCountRef.current - 1);
        source.disconnect();
        filter.disconnect();
        gain.disconnect();
        pan?.disconnect();
      };

      source.start(now + 0.01, offset, sliceLength + 0.04);
      source.stop(now + sliceLength + 0.12);
    },
    [hitSink],
  );

  return { audioState, ensure, play, warm };
}

export default function MusicParticles({
  locale = "en",
  ctaHref = "/music",
  sampleUrl,
}: {
  locale?: Locale;
  ctaHref?: string;
  sampleUrl: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const pointerRef = useRef({ x: -9999, y: -9999, active: false, lastMove: 0 });
  const wrapRectRef = useRef<DOMRect | null>(null);
  const animationRef = useRef<number | null>(null);
  const hitSink = useRef<((hit: Hit) => void) | null>(null);
  const armingRef = useRef<Promise<AudioContext | null> | null>(null);
  const lastNearScanRef = useRef(0);
  const [soundOn, setSoundOn] = useState(true);
  const [armed, setArmed] = useState(false);
  const [nearViewport, setNearViewport] = useState(false);
  const soundOnRef = useRef(true);
  const armedRef = useRef(false);
  const { audioState, ensure, play, warm } = useSampler(sampleUrl, hitSink, true);
  const c = copy[locale];

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "360px 0px", threshold: [0, 0.08] },
    );

    observer.observe(panel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    soundOnRef.current = soundOn;
  }, [soundOn]);

  useEffect(() => {
    armedRef.current = armed;
  }, [armed]);

  useEffect(() => {
    if (!nearViewport) return;
    void warm();
  }, [nearViewport, warm]);

  useEffect(() => {
    let done = false;

    const gestureRatio = (event: PointerEvent | MouseEvent | KeyboardEvent | TouchEvent) => {
      const wrap = wrapRef.current;
      if (!wrap || !(event.target instanceof Node) || !wrap.contains(event.target)) return null;

      const point =
        "touches" in event
          ? event.touches[0]
          : "clientX" in event
            ? event
            : null;
      if (!point) return { xRatio: 0.52, yRatio: 0.48 };

      const rect = wrapRectRef.current ?? wrap.getBoundingClientRect();
      wrapRectRef.current = rect;
      return {
        xRatio: Math.max(0, Math.min(1, (point.clientX - rect.left) / rect.width)),
        yRatio: Math.max(0, Math.min(1, (point.clientY - rect.top) / rect.height)),
      };
    };

    const unlock = (event: PointerEvent | MouseEvent | KeyboardEvent | TouchEvent) => {
      if (done) return;
      done = true;
      const ratio = gestureRatio(event);
      void ensure().then((context) => {
        if (context) {
          armedRef.current = true;
          setArmed(true);
          if (ratio && soundOnRef.current) window.setTimeout(() => play(1.08, ratio.xRatio, ratio.yRatio), 40);
        }
      });
    };

    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("pointerup", unlock, { once: true });
    window.addEventListener("mousedown", unlock, { once: true });
    window.addEventListener("mouseup", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true, passive: true });
    window.addEventListener("touchend", unlock, { once: true, passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("pointerup", unlock);
      window.removeEventListener("mousedown", unlock);
      window.removeEventListener("mouseup", unlock);
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("touchend", unlock);
    };
  }, [ensure, play]);

  useEffect(() => {
    if (!nearViewport) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !wrap || !context) return;

    let width = 0;
    let height = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conserveEffects = shouldConserveParticleEffects();
    let dpr = Math.min(window.devicePixelRatio || 1, conserveEffects ? 1 : 1.5);
    let documentVisible = document.visibilityState === "visible";

    const sampleText = () => {
      const ghost = document.createElement("canvas");
      const ghostContext = ghost.getContext("2d", { willReadFrequently: true });
      if (!ghostContext) return;

      ghost.width = width;
      ghost.height = height;
      ghostContext.clearRect(0, 0, width, height);
      ghostContext.fillStyle = "#ffffff";
      ghostContext.textAlign = "left";
      ghostContext.textBaseline = "middle";

      const setFont = (size: number) => {
        ghostContext.font = `900 ${size}px "Arial Black", Impact, system-ui, sans-serif`;
        if ("letterSpacing" in ghostContext) {
          (ghostContext as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${-size * 0.03}px`;
        }
      };

      setFont(100);
      const probeWidth = ghostContext.measureText(PARTICLE_TEXT).width || 1;
      const targetWidth = width * (width < 640 ? 0.96 : 0.94);
      const fontSize = Math.min((100 * targetWidth) / probeWidth, height * (width < 640 ? 0.72 : 0.86));
      setFont(fontSize);

      const textWidth = ghostContext.measureText(PARTICLE_TEXT).width;
      ghostContext.fillText(PARTICLE_TEXT, (width - textWidth) / 2, height * 0.5);

      const pixels = ghostContext.getImageData(0, 0, width, height).data;
      const gap = Math.max(
        width < 640 ? (conserveEffects ? 6 : 4) : (conserveEffects ? 9 : 7),
        Math.round(width / (conserveEffects ? 210 : 280)),
      );
      const particles: Particle[] = [];

      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          if (pixels[(y * width + x) * 4 + 3] > 128) {
            particles.push({
              hx: x,
              hy: y,
              x: x + Math.sin((x + y) * 0.09) * 5,
              y: y + Math.cos((x - y) * 0.08) * 5,
              vx: 0,
              vy: 0,
              size: gap * 0.72,
              baseAlpha: 0.68 + Math.random() * 0.32,
              tinted: Math.random() < 0.24,
            });
          }
        }
      }

      const maxParticles = conserveEffects ? (width < 640 ? 1800 : 2800) : (width < 640 ? 3000 : 4200);
      if (particles.length > maxParticles) {
        const step = particles.length / maxParticles;
        const sampled: Particle[] = [];
        for (let index = 0; index < maxParticles; index += 1) {
          const particle = particles[Math.floor(index * step)];
          if (particle) sampled.push(particle);
        }
        particlesRef.current = sampled;
      } else {
        particlesRef.current = particles;
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      wrapRectRef.current = rect;
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, conserveEffects ? 1 : 1.25);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      sampleText();
    };

    let lastTick = 0;
    const tick = (now = performance.now()) => {
      if (!documentVisible || wrap.closest(".portfolio-shell")?.classList.contains("is-scrolling")) {
        animationRef.current = window.requestAnimationFrame(tick);
        return;
      }

      const pointer = pointerRef.current;
      const pointerActive = pointer.active && now - pointer.lastMove < 1200;
      const frameInterval = reduceMotion ? 90 : conserveEffects ? 56 : 42;
      if (now - lastTick < frameInterval) {
        animationRef.current = window.requestAnimationFrame(tick);
        return;
      }
      lastTick = now;

      context.clearRect(0, 0, width, height);
      const repelRadius = Math.min(width < 640 ? 86 : 118, width * 0.13);
      const repelRadiusSquared = repelRadius * repelRadius;

      context.save();
      context.globalCompositeOperation = conserveEffects ? "source-over" : "lighter";

      for (const particle of particlesRef.current) {
        particle.vx += (particle.hx - particle.x) * (reduceMotion ? 0.075 : 0.046);
        particle.vy += (particle.hy - particle.y) * (reduceMotion ? 0.075 : 0.046);

        if (!reduceMotion && pointerActive) {
          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distanceSquared = dx * dx + dy * dy;

          if (distanceSquared < repelRadiusSquared && distanceSquared > 0.01) {
            const distance = Math.sqrt(distanceSquared);
            const force = (1 - distance / repelRadius) * 6.4;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
            particle.vx += (-dy / distance) * force * 0.66;
            particle.vy += (dx / distance) * force * 0.66;
          }
        }

        particle.vx *= reduceMotion ? 0.72 : 0.84;
        particle.vy *= reduceMotion ? 0.72 : 0.84;
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.tinted) {
          context.fillStyle = `rgba(183, 255, 37, ${particle.baseAlpha})`;
        } else {
          context.fillStyle = `rgba(241, 246, 232, ${particle.baseAlpha * 0.95})`;
        }

        context.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
      }

      context.restore();
      animationRef.current = window.requestAnimationFrame(tick);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const onVisibilityChange = () => {
      documentVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    tick();

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    };
  }, [nearViewport]);

  const armAudio = async (preview = false, xRatio = 0.52, yRatio = 0.48, fromUserGesture = false) => {
    if (armedRef.current) {
      if (preview && soundOnRef.current) play(1.02, xRatio, yRatio);
      return;
    }

    if (!fromUserGesture && !hasUserActivatedAudio()) return;

    armingRef.current ??= ensure().finally(() => {
      armingRef.current = null;
    });

    const context = await armingRef.current;
    if (!context) return;
    armedRef.current = true;
    setArmed(true);
    if (preview && soundOnRef.current) window.setTimeout(() => play(1.05, xRatio, yRatio), 40);
  };

  const handleMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const rect = wrapRectRef.current ?? wrap.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerRef.current = { x, y, active: true, lastMove: performance.now() };

    if (!soundOnRef.current) return;

    const xRatio = Math.max(0, Math.min(1, x / rect.width));
    const yRatio = Math.max(0, Math.min(1, y / rect.height));

    if (!armedRef.current) {
      void armAudio(true, xRatio, yRatio);
      return;
    }

    const now = performance.now();
    if (now - lastNearScanRef.current < 56) return;
    lastNearScanRef.current = now;

    const particles = particlesRef.current;
    let nearParticle = false;
    for (let index = 0; index < particles.length; index += 4) {
      const dx = particles[index].x - x;
      const dy = particles[index].y - y;
      if (dx * dx + dy * dy < 1680) {
        nearParticle = true;
        break;
      }
    }

    if (nearParticle) play(1, xRatio, yRatio);
  };

  const handleEnter = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    wrapRectRef.current = rect;
    const xRatio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const yRatio = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));

    if (audioState !== "ready") void warm();
    if (soundOnRef.current && !armedRef.current) void armAudio(false, xRatio, yRatio);
  };

  const handleDown = async (event: ReactPointerEvent<HTMLDivElement>) => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const rect = wrap.getBoundingClientRect();
    wrapRectRef.current = rect;
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    pointerRef.current = { x, y, active: true, lastMove: performance.now() };

    await armAudio(true, Math.max(0, Math.min(1, x / rect.width)), Math.max(0, Math.min(1, y / rect.height)), true);
  };

  const handleLeave = () => {
    pointerRef.current = { x: -9999, y: -9999, active: false, lastMove: 0 };
  };

  const audioLabel =
    audioState === "ready"
      ? c.audioReady
      : audioState === "loading"
        ? c.audioLoading
        : audioState === "error"
          ? c.audioError
          : c.audioLocked;
  const toneLabel = armed ? (soundOn ? "tone on" : "tone off") : "unlock tone";
  const toneDetail = armed
    ? soundOn
      ? audioLabel
      : locale === "zh"
        ? "暂停触发"
        : "Paused"
    : locale === "zh"
      ? "点一下开启声场"
      : "Click to arm sound";

  return (
    <div ref={panelRef} className="music-particle-panel mp-root" data-reveal>
      <div
        ref={wrapRef}
        className="mp-canvas-wrap"
        onPointerEnter={handleEnter}
        onPointerMove={handleMove}
        onPointerDown={handleDown}
        onPointerLeave={handleLeave}
        aria-label={locale === "zh" ? "由粒子组成的互动音乐标题" : "Interactive music title made of particles"}
      >
        <canvas ref={canvasRef} className="mp-canvas" aria-hidden="true" />
        <span className="mp-sr">{PARTICLE_TEXT}</span>
      </div>

      <div className="mp-actions" data-armed={armed ? "true" : "false"} data-audio-state={audioState}>
        <button
          type="button"
          className="mp-mute"
          aria-pressed={soundOn}
          onClick={() => {
            if (!armed) {
              void armAudio(true, 0.52, 0.48, true);
              return;
            }

            setSoundOn((current) => !current);
          }}
          disabled={audioState === "loading"}
        >
          <span>{toneLabel}</span>
          <strong>{toneDetail}</strong>
        </button>

        <a className="mp-cta" href={ctaHref === "#method" ? "/music" : ctaHref}>
          <span>open space</span>
          <strong>{c.cta}</strong>
        </a>
      </div>
    </div>
  );
}
