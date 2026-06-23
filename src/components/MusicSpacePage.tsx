"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, Pause, Play } from "lucide-react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { musicAlbums } from "@/lib/musicCatalog";
import styles from "./MusicSpacePage.module.css";

type AudioStatus = "idle" | "loading" | "playing" | "fallback";

const LISTEN_VOLUME = 0.86;
const FADE_MS = 520;

function coverStyle(cover: string) {
  return { "--cover": `url("${cover}")` } as CSSProperties;
}

function buttonLabel(status: AudioStatus) {
  if (status === "loading") return "LOADING";
  if (status === "playing") return "PLAYING";
  if (status === "fallback") return "FALLBACK";
  return "PLAY TRACK";
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

const DEFAULT_ALBUM_INDEX = Math.max(0, musicAlbums.findIndex((album) => album.id === "ant"));

function useArcMotion(topRef: React.RefObject<HTMLDivElement | null>, bottomRef: React.RefObject<HTMLDivElement | null>) {
  const hoverSlowRef = useRef(false);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    let topOffset = 0;
    let bottomOffset = 0;

    const layoutStrip = (strip: HTMLDivElement | null, offset: number, flipped: boolean) => {
      if (!strip) return;

      const cards = Array.from(strip.querySelectorAll<HTMLElement>("[data-arc-card]"));
      if (!cards.length) return;

      const width = Math.max(1, strip.clientWidth);
      const cardSize = Number.parseFloat(getComputedStyle(strip).getPropertyValue("--card-size")) || 168;
      const spacing = cardSize * 0.82;
      const loop = cards.length * spacing;
      const center = width / 2;
      const arcDepth = Math.min(96, Math.max(42, width * 0.055));

      cards.forEach((card, index) => {
        const raw = ((index * spacing + offset) % loop + loop) % loop;
        const x = raw - cardSize;
        const normalized = (x + cardSize / 2 - center) / Math.max(center, 1);
        const curve = normalized * normalized * arcDepth;
        const y = flipped ? -curve : curve;
        const rotate = normalized * (flipped ? -9 : 9);
        const scale = 1 - Math.min(0.18, Math.abs(normalized) * 0.08);
        const z = Math.round(1000 - Math.abs(normalized) * 100);

        card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
        card.style.zIndex = String(z);
        card.style.opacity = Math.abs(normalized) > 1.38 ? "0" : "1";
      });
    };

    const tick = (now: number) => {
      const delta = Math.min(now - last, 40);
      last = now;
      const speed = hoverSlowRef.current ? 0.014 : 0.052;
      topOffset += delta * speed;
      bottomOffset -= delta * speed * 0.92;
      layoutStrip(topRef.current, topOffset, false);
      layoutStrip(bottomRef.current, bottomOffset, true);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [bottomRef, topRef]);

  return hoverSlowRef;
}

export function MusicSpacePage() {
  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_ALBUM_INDEX);
  const [audioStatus, setAudioStatus] = useState<AudioStatus>("idle");
  const [currentAudioIndex, setCurrentAudioIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const topArcRef = useRef<HTMLDivElement | null>(null);
  const bottomArcRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const caseRef = useRef<HTMLDivElement | null>(null);
  const fadeFrameRef = useRef<number | null>(null);
  const fakeTimerRef = useRef<number | null>(null);
  const transitionIdRef = useRef(0);
  const currentAudioIndexRef = useRef<number | null>(null);
  const hoverSlowRef = useArcMotion(topArcRef, bottomArcRef);
  const selectedAlbum = musicAlbums[selectedIndex] ?? musicAlbums[0];
  const bottomAlbums = useMemo(() => [...musicAlbums].reverse(), []);
  const isBusy = audioStatus === "loading";
  const isAudible = audioStatus === "playing" || audioStatus === "fallback";
  const trackDuration = duration || selectedAlbum.durationSeconds;
  const progress = trackDuration > 0 ? Math.min(1, currentTime / trackDuration) : 0;

  const clearFakeTimer = useCallback(() => {
    if (fakeTimerRef.current) {
      window.clearTimeout(fakeTimerRef.current);
      fakeTimerRef.current = null;
    }
  }, []);

  const slowArcs = useCallback(() => {
    hoverSlowRef.current = true;
  }, [hoverSlowRef]);

  const resumeArcs = useCallback(() => {
    hoverSlowRef.current = false;
  }, [hoverSlowRef]);

  const fadeVolumeTo = useCallback((target: number, duration = FADE_MS) => {
    const audio = audioRef.current;
    if (!audio) return Promise.resolve();

    if (fadeFrameRef.current) window.cancelAnimationFrame(fadeFrameRef.current);

    const start = audio.volume;
    const startedAt = performance.now();

    return new Promise<void>((resolve) => {
      const step = (now: number) => {
        const progress = Math.max(0, Math.min(1, (now - startedAt) / duration));
        const eased = 1 - (1 - progress) ** 3;
        audio.volume = Math.max(0, Math.min(1, start + (target - start) * eased));

        if (progress < 1) {
          fadeFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        fadeFrameRef.current = null;
        resolve();
      };

      fadeFrameRef.current = window.requestAnimationFrame(step);
    });
  }, []);

  const startFallbackPreview = useCallback((index: number) => {
    const album = musicAlbums[index] ?? selectedAlbum;
    clearFakeTimer();
    currentAudioIndexRef.current = index;
    setCurrentAudioIndex(index);
    setAudioStatus("fallback");
    fakeTimerRef.current = window.setTimeout(() => {
      currentAudioIndexRef.current = null;
      setCurrentAudioIndex(null);
      setCurrentTime(0);
      setAudioStatus("idle");
      fakeTimerRef.current = null;
    }, album.durationSeconds * 1000);
  }, [clearFakeTimer, selectedAlbum]);

  const playAlbum = useCallback(
    async (index: number, fadeIn = true) => {
      const audio = audioRef.current;
      const album = musicAlbums[index];
      if (!audio || !album?.source) {
        startFallbackPreview(index);
        return;
      }

      const transitionId = transitionIdRef.current;
      clearFakeTimer();
      setAudioStatus("loading");

      try {
        audio.pause();
        audio.src = album.source;
        audio.currentTime = 0;
        audio.muted = false;
        audio.volume = fadeIn ? 0 : LISTEN_VOLUME;
        setCurrentTime(0);
        setDuration(0);
        audio.load();
        await audio.play();

        if (transitionId !== transitionIdRef.current) return;

        currentAudioIndexRef.current = index;
        setCurrentAudioIndex(index);
        setAudioStatus("playing");
        if (fadeIn) await fadeVolumeTo(LISTEN_VOLUME, FADE_MS);
      } catch {
        if (transitionId === transitionIdRef.current) startFallbackPreview(index);
      }
    },
    [clearFakeTimer, fadeVolumeTo, startFallbackPreview],
  );

  const stopPreview = useCallback(async () => {
    transitionIdRef.current += 1;
    clearFakeTimer();

    const audio = audioRef.current;
    if (audio && !audio.paused) {
      await fadeVolumeTo(0, 260);
      audio.pause();
      audio.volume = LISTEN_VOLUME;
    }

    currentAudioIndexRef.current = null;
    setCurrentAudioIndex(null);
    setCurrentTime(0);
    setAudioStatus("idle");
  }, [clearFakeTimer, fadeVolumeTo]);

  const transitionToAlbum = useCallback(
    async (index: number) => {
      transitionIdRef.current += 1;
      const transitionId = transitionIdRef.current;
      clearFakeTimer();

      const audio = audioRef.current;
      if (audio && !audio.paused) {
        await fadeVolumeTo(0, 360);
        if (transitionId !== transitionIdRef.current) return;
      }

      await playAlbum(index, true);
    },
    [clearFakeTimer, fadeVolumeTo, playAlbum],
  );

  const selectAlbum = useCallback(
    (index: number) => {
      if (index === selectedIndex) return;
      setSelectedIndex(index);

      if (isAudible) {
        void transitionToAlbum(index);
      } else {
        setCurrentTime(0);
        setDuration(0);
      }
    },
    [isAudible, selectedIndex, transitionToAlbum],
  );

  const togglePreview = useCallback(() => {
    if (isBusy) return;

    if (isAudible && currentAudioIndexRef.current === selectedIndex) {
      void stopPreview();
      return;
    }

    transitionIdRef.current += 1;
    void playAlbum(selectedIndex, true);
  }, [isAudible, isBusy, playAlbum, selectedIndex, stopPreview]);

  useEffect(() => {
    return () => {
      if (fadeFrameRef.current) window.cancelAnimationFrame(fadeFrameRef.current);
      clearFakeTimer();
    };
  }, [clearFakeTimer]);

  useEffect(() => {
    const canvas = particleCanvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles = Array.from({ length: 164 }, (_, index) => ({
      phase: index * 0.37,
      speed: 0.18 + (index % 9) * 0.018,
      lane: (index % 16) / 15,
      amp: 0.18 + (index % 7) * 0.035,
      size: 1 + (index % 5) * 0.55,
      warm: index % 4 === 0,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (now: number) => {
      const seconds = now / 1000;
      const energy = isAudible ? 1 : 0.38;
      context.clearRect(0, 0, width, height);

      context.save();
      context.globalCompositeOperation = "lighter";
      for (const particle of particles) {
        const drift = (seconds * particle.speed * energy + particle.phase) % 1;
        const x = drift * width;
        const centerY = height * (0.36 + particle.lane * 0.34);
        const y = centerY + Math.sin(seconds * 1.7 + particle.phase * 2.1) * height * particle.amp * 0.18;
        const alpha = (particle.warm ? 0.3 : 0.42) * energy;
        context.fillStyle = particle.warm ? `rgba(255, 106, 61, ${alpha})` : `rgba(183, 255, 37, ${alpha})`;
        context.shadowColor = particle.warm ? "rgba(255, 106, 61, 0.64)" : "rgba(183, 255, 37, 0.72)";
        context.shadowBlur = isAudible ? 12 : 7;
        context.beginPath();
        context.arc(x, y, particle.size * (isAudible ? 1.2 : 0.8), 0, Math.PI * 2);
        context.fill();
      }

      for (let wave = 0; wave < 2; wave += 1) {
        context.beginPath();
        const yBase = height * (wave === 0 ? 0.43 : 0.61);
        for (let index = 0; index <= 120; index += 1) {
          const x = (index / 120) * width;
          const y = yBase + Math.sin(index * 0.24 + seconds * (isAudible ? 3.2 : 1.4) + wave) * (isAudible ? 34 : 18);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.strokeStyle = wave === 0 ? "rgba(183, 255, 37, 0.34)" : "rgba(255, 106, 61, 0.26)";
        context.lineWidth = wave === 0 ? 1.4 : 1;
        context.shadowBlur = 18;
        context.stroke();
      }
      context.restore();

      if (!reduceMotion) frame = window.requestAnimationFrame(draw);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    frame = window.requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [isAudible, selectedIndex]);

  const moveCase = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = caseRef.current;
    if (!node) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    node.style.setProperty("--tilt-y", `${x * 9}deg`);
    node.style.setProperty("--tilt-x", `${-y * 9}deg`);
    node.style.setProperty("--lift-x", `${x * 10}px`);
    node.style.setProperty("--lift-y", `${y * 10}px`);
    node.dataset.active = "true";
  };

  const resetCase = () => {
    const node = caseRef.current;
    if (!node) return;
    node.style.setProperty("--tilt-y", "0deg");
    node.style.setProperty("--tilt-x", "0deg");
    node.style.setProperty("--lift-x", "0px");
    node.style.setProperty("--lift-y", "0px");
    delete node.dataset.active;
  };

  const onPreviewTick = () => {
    const audio = audioRef.current;
    if (!audio || audioStatus !== "playing") return;

    setCurrentTime(audio.currentTime);
    setDuration(audio.duration || 0);
  };

  const onPreviewEnded = () => {
    currentAudioIndexRef.current = null;
    setCurrentAudioIndex(null);
    setCurrentTime(0);
    setAudioStatus("idle");
  };

  const renderArcCard = (album: typeof musicAlbums[number], index: number, originalIndex = index) => {
    const selected = originalIndex === selectedIndex;
    const playing = isAudible && currentAudioIndex === originalIndex;

    return (
      <button
        type="button"
        key={`${album.id}-${index}`}
        className={`${styles.arcCard} ${selected ? styles.selected : ""} ${playing ? styles.playing : ""}`}
        style={coverStyle(album.cover)}
        data-arc-card
        onClick={() => selectAlbum(originalIndex)}
        onPointerEnter={slowArcs}
        onPointerLeave={resumeArcs}
        onFocus={slowArcs}
        onBlur={resumeArcs}
        aria-label={`Select ${album.title}`}
      >
        <span aria-hidden="true" />
      </button>
    );
  };

  return (
    <main className={styles.root}>
      <canvas ref={particleCanvasRef} className={styles.particleCanvas} aria-hidden="true" />
      <div className={styles.scanGrid} aria-hidden="true" />
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={onPreviewTick}
        onEnded={onPreviewEnded}
      />

      <div className={`${styles.arcStrip} ${styles.topArc}`} ref={topArcRef} aria-label="Top album stream">
        {musicAlbums.map((album, index) => renderArcCard(album, index))}
      </div>

      <section className={styles.selectedStage} aria-label="Selected album">
        <div className={styles.caseHotZone} onPointerMove={moveCase} onPointerLeave={resetCase}>
          <div
            className={styles.case3d}
            ref={caseRef}
            key={selectedAlbum.id}
            style={coverStyle(selectedAlbum.cover)}
            aria-label={`${selectedAlbum.title} cover`}
          >
            <div className={styles.caseBack} aria-hidden="true" />
            <div className={styles.caseSpine} aria-hidden="true" />
            <div className={styles.caseTopEdge} aria-hidden="true" />
            <div className={styles.caseFront} aria-hidden="true" />
            <div className={styles.caseSheen} aria-hidden="true" />
          </div>
        </div>

        <div className={styles.albumInfo}>
          <span>NOW SELECTED</span>
          <h1>{selectedAlbum.title}</h1>
          <p className={styles.artist}>{selectedAlbum.artist}</p>
          <p className={styles.preview}>Track: {selectedAlbum.previewTitle}</p>
          <button
            type="button"
            className={`${styles.playCapsule} ${isAudible ? styles.playingButton : ""}`}
            onClick={togglePreview}
            disabled={isBusy}
          >
            {audioStatus === "loading" ? (
              <Loader2 aria-hidden="true" />
            ) : isAudible && currentAudioIndex === selectedIndex ? (
              <Pause aria-hidden="true" />
            ) : (
              <Play aria-hidden="true" />
            )}
            <strong>{buttonLabel(audioStatus)}</strong>
          </button>
          <div className={styles.progressHud} style={{ "--progress": String(progress) } as CSSProperties}>
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={trackDuration || selectedAlbum.durationSeconds}
              step="0.01"
              value={Math.min(currentTime, trackDuration || currentTime)}
              onChange={(event) => {
                const next = Number(event.currentTarget.value);
                const audio = audioRef.current;
                if (audio) audio.currentTime = next;
                setCurrentTime(next);
              }}
              aria-label="Track progress"
            />
            <span>{formatTime(trackDuration || selectedAlbum.durationSeconds)}</span>
          </div>
          <small>{selectedAlbum.mood}</small>
        </div>
      </section>

      <div className={`${styles.arcStrip} ${styles.bottomArc}`} ref={bottomArcRef} aria-label="Bottom album stream">
        {bottomAlbums.map((album, index) => renderArcCard(album, index, musicAlbums.findIndex((item) => item.id === album.id)))}
      </div>

      <Link className={styles.homeLink} href="/#method" aria-label="Back to home music section">
        <ArrowLeft aria-hidden="true" />
        <span>返回主页</span>
      </Link>
    </main>
  );
}
