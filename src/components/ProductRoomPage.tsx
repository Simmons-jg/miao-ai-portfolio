"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PRODUCT_LIVE_URL } from "@/lib/productLinks";

const machineStages = [
  {
    code: "01",
    title: "Script in",
    zh: "剧本进入",
    state: "source material / 原始材料",
    detail:
      "Break a rough idea into story beats, characters, scenes, and visual intent.",
    detailZh: "粗糙的想法被拆成故事节拍、人物、场景和视觉意图。",
    metrics: ["script", "intent", "route"],
  },
  {
    code: "02",
    title: "Style lock",
    zh: "风格锁定",
    state: "style route / 风格路线",
    detail:
      "Keep character, world, lens language, and cover direction from drifting apart.",
    detailZh: "让人物、世界观、镜头语言和封面方向不在生成中散掉。",
    metrics: ["style", "world", "character"],
  },
  {
    code: "03",
    title: "Shot engine",
    zh: "分镜引擎",
    state: "moving image / 动态影像",
    detail:
      "Turn the story into shot prompts, cover tasks, review points, and production notes.",
    detailZh: "把故事变成分镜提示、封面任务、审核点和制作笔记。",
    metrics: ["shots", "covers", "tasks"],
  },
  {
    code: "04",
    title: "Tasks out",
    zh: "任务输出",
    state: "machine output / 机器输出",
    detail:
      "Send a clear making route into the next creative tool or human review step.",
    detailZh: "输出清楚的制作路线：做什么、检查什么、发给谁。",
    metrics: ["make", "check", "send"],
  },
];

const labItems = [
  { code: "L1", title: "Prompt cleaner", zh: "提示词清洗" },
  { code: "L2", title: "Character memory", zh: "人物记忆" },
  { code: "L3", title: "Cover judge", zh: "封面审美" },
  { code: "L4", title: "Shot checklist", zh: "分镜清单" },
  { code: "L5", title: "Music mood note", zh: "音乐情绪笔记" },
  { code: "L6", title: "Image review board", zh: "图像评审板" },
];

const tickerItems = [
  "SCRIPT IN",
  "STYLE LOCK",
  "SHOT ENGINE",
  "TASKS OUT",
  "AI VIDEO MACHINE",
  "剧本进去",
  "任务出来",
];

export function ProductRoomPage() {
  const [activeStage, setActiveStage] = useState(0);
  const [paused, setPaused] = useState(false);
  const machineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveStage((current) => (current + 1) % machineStages.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [paused]);

  const stage = machineStages[activeStage] ?? machineStages[0];

  return (
    <main className="product-room-page">
      <header className="product-room-nav">
        <Link href="/" className="product-room-mark">
          <img src="/miao-paw-brand.svg" alt="" decoding="async" />
          <span>MIAO PRODUCT</span>
        </Link>
        <div className="product-room-actions">
          <a href={PRODUCT_LIVE_URL} className="product-room-live" target="_blank" rel="noreferrer">
            OPEN LIVE
          </a>
          <Link href="/#contact" className="product-room-contact">CONTACT</Link>
        </div>
      </header>

      <section className="product-room-hero">
        <p>AI video machine / 机器房间</p>
        <h1>
          Video
          <em> machine</em>
        </h1>
        <b>剧本进去，人物、风格、分镜、封面和视频任务出来。它不是作品墙，是作品墙背后的机器。</b>
        <a href={PRODUCT_LIVE_URL} className="product-room-open" target="_blank" rel="noreferrer">
          <span>OPEN LIVE PRODUCT</span>
          <small>deployed &amp; running / 已部署运行</small>
        </a>
      </section>

      <div className="product-room-ticker" aria-hidden="true">
        <div className="product-room-ticker-lane">
          {[0, 1].map((copy) => (
            <div className="product-room-ticker-group" key={copy}>
              {tickerItems.map((item) => (
                <span key={item}>
                  {item}
                  <i>✦</i>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <section
        className="product-room-machine-shell"
        aria-label="Machine pipeline"
        ref={machineRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="product-room-machine" role="tablist" aria-label="Pipeline stages">
          {machineStages.map((item, index) => (
            <button
              type="button"
              role="tab"
              aria-selected={index === activeStage}
              className={index === activeStage ? "active" : ""}
              key={item.code}
              onClick={() => setActiveStage(index)}
              onFocus={() => setActiveStage(index)}
            >
              <span>{item.code}</span>
              <h2>{item.title}</h2>
              <b>{item.zh}</b>
              <small>{item.state}</small>
              <i aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="product-room-readout" role="tabpanel" aria-live="polite">
          <div className="product-room-readout-flow" aria-hidden="true">
            <i style={{ transform: `scaleX(${(activeStage + 1) / machineStages.length})` }} />
          </div>
          <p>
            {stage.detail}
            <span>{stage.detailZh}</span>
          </p>
          <div>
            {stage.metrics.map((metric) => (
              <b key={metric}>{metric}</b>
            ))}
          </div>
        </div>
      </section>

      <section className="product-room-lab" id="lab">
        <div>
          <span>SMALL WORKS / 小工具</span>
          <h2>A room of small tools around the machine.</h2>
          <p>
            主工具做 AI 影视生产，周围是一圈小工具：图像评审、人物记忆、
            封面审美、提示词清洗和音乐情绪笔记。
          </p>
        </div>
        <ul>
          {labItems.map((item) => (
            <li key={item.code}>
              <span>{item.code}</span>
              <strong>{item.title}</strong>
              <small>{item.zh}</small>
            </li>
          ))}
        </ul>
      </section>

      <footer className="product-room-foot">
        <Link href="/">← BACK TO HOME / 回首页</Link>
        <a href={PRODUCT_LIVE_URL} target="_blank" rel="noreferrer">
          OPEN LIVE PRODUCT →
        </a>
      </footer>
    </main>
  );
}
