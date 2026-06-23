"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { videoWorks } from "@/lib/videoCatalog";

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

export function VideoRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialId = searchParams.get("work") ?? videoWorks[0]?.id;
  const initialIndex = Math.max(
    0,
    videoWorks.findIndex((work) => work.id === initialId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [hoverIndex, setHoverIndex] = useState(initialIndex);
  const active = videoWorks[activeIndex] ?? videoWorks[0];
  const hover = videoWorks[hoverIndex] ?? active;

  const playerSrc = useMemo(() => `/api/videos/${active.id}`, [active.id]);

  const chooseVideo = (index: number) => {
    const next = videoWorks[index];
    if (!next) return;
    setActiveIndex(index);
    setHoverIndex(index);
    router.replace(`/videos?work=${next.id}`, { scroll: false });
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
        <video
          key={active.id}
          src={playerSrc}
          poster={active.poster}
          controls
          playsInline
          preload="metadata"
        />
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
