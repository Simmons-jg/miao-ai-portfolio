"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Maximize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCanonicalVideoWorkId, videoWorks } from "@/lib/videoCatalog";

const videoSignalItems = [
  "SCREENING ROOM",
  "PROJECTOR",
  "VIDEO ROOM",
  "MV",
  "AI MOTION",
  "STORY CUT",
  "MOOD TEST",
  "MIAO CINEMA",
];

const videoCodeRain = [
  "0101101001011010",
  "1010010110100101",
  "0011010010110110",
  "1100101001010011",
  "0110100101101001",
  "1001011010010110",
];

const qualityOptions = [
  { id: "1080p", label: "1080P" },
  { id: "720p", label: "720P" },
] as const;

const mobileVideoFullscreenAttributes = {
  "x5-video-orientation": "landscape",
  "x5-video-player-fullscreen": "true",
  "x5-video-player-type": "h5",
};

type VideoQuality = (typeof qualityOptions)[number]["id"];

type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

type NativeFullscreenVideo = HTMLVideoElement & {
  webkitEnterFullscreen?: () => void;
  webkitEnterFullScreen?: () => void;
};

type LockableScreenOrientation = ScreenOrientation & {
  lock?: (orientation: "landscape") => Promise<void>;
};

export function VideoRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoStageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeTimeRef = useRef(0);
  const resumePlaybackRef = useRef(false);
  const landscapeHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoOverlayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestedId = searchParams.get("work") ?? videoWorks[0]?.id ?? "";
  const initialId = getCanonicalVideoWorkId(requestedId);
  const initialIndex = Math.max(
    0,
    videoWorks.findIndex((work) => work.id === initialId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [hoverIndex, setHoverIndex] = useState(initialIndex);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>("1080p");
  const [landscapeHint, setLandscapeHint] = useState("");
  const [videoOverlayVisible, setVideoOverlayVisible] = useState(true);
  const active = videoWorks[activeIndex] ?? videoWorks[0];
  const hover = videoWorks[hoverIndex] ?? active;

  useEffect(() => {
    return () => {
      if (landscapeHintTimerRef.current) {
        clearTimeout(landscapeHintTimerRef.current);
      }
      if (videoOverlayTimerRef.current) {
        clearTimeout(videoOverlayTimerRef.current);
      }
    };
  }, []);

  const playerSrc = useMemo(() => {
    if (videoQuality === "1080p") {
      return `/api/videos/${active.id}`;
    }

    return `/api/videos/${active.id}?quality=${videoQuality}`;
  }, [active.id, videoQuality]);

  const chooseVideo = (index: number) => {
    const next = videoWorks[index];
    if (!next) return;
    resumeTimeRef.current = 0;
    resumePlaybackRef.current = false;
    clearVideoOverlayTimer();
    setVideoOverlayVisible(true);
    setActiveIndex(index);
    setHoverIndex(index);
    router.replace(`/videos?work=${next.id}`, { scroll: false });
  };

  const clearVideoOverlayTimer = () => {
    if (videoOverlayTimerRef.current) {
      clearTimeout(videoOverlayTimerRef.current);
      videoOverlayTimerRef.current = null;
    }
  };

  const scheduleVideoOverlayHide = () => {
    clearVideoOverlayTimer();

    const video = videoRef.current;
    if (!video || video.paused || video.ended) return;

    videoOverlayTimerRef.current = setTimeout(() => {
      setVideoOverlayVisible(false);
      videoOverlayTimerRef.current = null;
    }, 2400);
  };

  const revealVideoOverlay = () => {
    setVideoOverlayVisible(true);
    scheduleVideoOverlayHide();
  };

  const keepVideoOverlayVisible = () => {
    clearVideoOverlayTimer();
    setVideoOverlayVisible(true);
  };

  const chooseQuality = (quality: VideoQuality) => {
    if (quality === videoQuality) return;

    const video = videoRef.current;
    if (video) {
      resumeTimeRef.current = video.currentTime;
      resumePlaybackRef.current = !video.paused && !video.ended;
    }

    keepVideoOverlayVisible();
    setVideoQuality(quality);
  };

  const showLandscapeHint = (message: string) => {
    if (landscapeHintTimerRef.current) {
      clearTimeout(landscapeHintTimerRef.current);
    }

    setLandscapeHint(message);
    landscapeHintTimerRef.current = setTimeout(() => {
      setLandscapeHint("");
      landscapeHintTimerRef.current = null;
    }, 3200);
  };

  const enterLandscapePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    const stage = videoStageRef.current;
    let requestedFullscreen = false;
    let lockedLandscape = false;

    void video.play().catch(() => undefined);

    const fullscreenTarget = (stage ?? video) as FullscreenElement;
    const requestFullscreen =
      fullscreenTarget.requestFullscreen ??
      fullscreenTarget.webkitRequestFullscreen ??
      fullscreenTarget.msRequestFullscreen;

    if (requestFullscreen) {
      try {
        await requestFullscreen.call(fullscreenTarget);
        requestedFullscreen = true;
      } catch {
        requestedFullscreen = false;
      }
    }

    const orientation = screen.orientation as LockableScreenOrientation | undefined;
    if (orientation?.lock) {
      try {
        await orientation.lock("landscape");
        lockedLandscape = true;
      } catch {
        lockedLandscape = false;
      }
    }

    if (!requestedFullscreen) {
      const nativeVideo = video as NativeFullscreenVideo;
      const enterNativeFullscreen =
        nativeVideo.webkitEnterFullscreen ?? nativeVideo.webkitEnterFullScreen;

      if (enterNativeFullscreen) {
        try {
          enterNativeFullscreen.call(nativeVideo);
          requestedFullscreen = true;
        } catch {
          requestedFullscreen = false;
        }
      }
    }

    if (!lockedLandscape) {
      showLandscapeHint("Rotate phone");
    }
  };

  const handleVideoMetadata = () => {
    const video = videoRef.current;
    if (!video) return;

    const resumeAt = resumeTimeRef.current;
    if (resumeAt > 0 && Number.isFinite(video.duration) && resumeAt < video.duration - 0.5) {
      video.currentTime = resumeAt;
    }

    if (resumePlaybackRef.current) {
      void video.play().catch(() => {
        resumePlaybackRef.current = false;
      });
    }

    resumeTimeRef.current = 0;
    resumePlaybackRef.current = false;
  };

  return (
    <main className="videos-page">
      <div className="videos-bg" aria-hidden="true">
        <span />
        <span />
        <span />
        <div className="videos-code-rain">
          {Array.from({ length: 24 }, (_, index) => (
            <i key={index}>{videoCodeRain[index % videoCodeRain.length]}</i>
          ))}
        </div>
      </div>

      <header className="videos-nav">
        <Link href="/" aria-label="Back to home" className="videos-mark">
          <img src="/miao-paw-brand.svg" alt="" />
          <span>MIAO</span>
        </Link>
        <Link href="/#contact" className="videos-contact">
          CONTACT
        </Link>
      </header>

      <section className="videos-hero" aria-labelledby="videos-title">
        <div className="videos-marquee" aria-hidden="true">
          <span>VIDEOS</span>
          <span>VIDEOS</span>
          <span>VIDEOS</span>
        </div>
        <div className="videos-hero-copy">
          <p>MV / experimental shorts / little moods</p>
          <h1 id="videos-title" data-text="VIDEOS">
            VIDEOS
          </h1>
          <b>我喜欢做一些有趣的动态画面。</b>
        </div>
        <div className="videos-hero-strip" aria-label="Featured video covers">
          {videoWorks.slice(0, 5).map((work, index) => (
            <button
              type="button"
              key={work.id}
              className={index === activeIndex ? "active" : ""}
              onClick={() => chooseVideo(index)}
              onMouseEnter={() => setHoverIndex(index)}
              onFocus={() => setHoverIndex(index)}
            >
              <img src={work.poster} alt="" />
              <span>{work.code}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="videos-signal-rail" aria-hidden="true">
        <div>
          {Array.from({ length: 8 }, (_, groupIndex) =>
            videoSignalItems.map((item) => (
              <span key={`${groupIndex}-${item}`}>{item}</span>
            )),
          )}
        </div>
      </div>

      <section className="videos-player-shell" aria-label="Selected video player">
        <div className="videos-active-meta">
          <span>{active.code}</span>
          <h2>{active.titleEn}</h2>
          <p>{active.titleZh} / {active.metaZh}</p>
        </div>
        <div
          className="videos-video-stage"
          ref={videoStageRef}
          data-overlay-visible={videoOverlayVisible ? "true" : "false"}
          onFocusCapture={revealVideoOverlay}
          onMouseLeave={scheduleVideoOverlayHide}
          onMouseMove={revealVideoOverlay}
          onPointerDown={revealVideoOverlay}
          onPointerMove={revealVideoOverlay}
          onTouchStart={revealVideoOverlay}
        >
          <video
            ref={videoRef}
            key={active.id}
            src={playerSrc}
            poster={active.poster}
            {...mobileVideoFullscreenAttributes}
            controls
            playsInline
            preload="auto"
            onLoadedMetadata={handleVideoMetadata}
            onEnded={keepVideoOverlayVisible}
            onMouseMove={revealVideoOverlay}
            onPause={keepVideoOverlayVisible}
            onPlay={revealVideoOverlay}
            onPlaying={scheduleVideoOverlayHide}
            onPointerDown={revealVideoOverlay}
            onPointerMove={revealVideoOverlay}
            onTouchStart={revealVideoOverlay}
          />
          <button
            type="button"
            className="videos-landscape-button"
            onClick={enterLandscapePlayback}
            aria-label="Landscape fullscreen"
          >
            <Maximize2 aria-hidden="true" />
            <span>Landscape</span>
          </button>
          {landscapeHint ? (
            <span className="videos-landscape-hint" role="status">
              {landscapeHint}
            </span>
          ) : null}
          <div className="videos-quality-switch" aria-label="Video quality">
            {qualityOptions.map((option) => (
              <button
                type="button"
                key={option.id}
                className={videoQuality === option.id ? "active" : ""}
                aria-pressed={videoQuality === option.id}
                onClick={() => chooseQuality(option.id)}
              >
                {option.label}
              </button>
            ))}
            <span>卡顿时切 720P</span>
          </div>
        </div>
      </section>

      <section className="videos-index-section" aria-label="Video index">
        <div className="videos-index-heading">
          <span>PORTFOLIO</span>
          <p>Some are MV, some are experimental shorts, and some are just a mood I wanted to try.</p>
        </div>

        <div className="videos-book">
          <div className="videos-book-spine" aria-hidden="true">
            <span>VIDEO LOG</span>
            <b>{hover.code}</b>
          </div>

          <div className="videos-index-list">
            {videoWorks.map((work, index) => (
              <button
                type="button"
                key={work.id}
                className={index === activeIndex ? "active" : ""}
                onClick={() => chooseVideo(index)}
                onMouseEnter={() => setHoverIndex(index)}
                onFocus={() => setHoverIndex(index)}
              >
                <span>{work.code}</span>
                <strong>{work.titleEn}</strong>
                <small>{work.titleZh} / {work.metaZh}</small>
                <b>{work.date}</b>
                <span className="videos-row-card" aria-hidden="true">
                  <img src={work.poster} alt="" />
                  <span>{work.code}</span>
                  <strong>{work.titleEn}</strong>
                  <small>{work.titleZh} / {work.metaZh}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
