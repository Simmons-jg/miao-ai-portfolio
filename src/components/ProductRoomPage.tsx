import Link from "next/link";
import { PRODUCT_LIVE_URL } from "@/lib/productLinks";

const productSteps = [
  {
    code: "01",
    title: "Script in",
    zh: "剧本进入",
    detail: "Break a rough idea into story beats, characters, scenes, and visual intent.",
  },
  {
    code: "02",
    title: "Style lock",
    zh: "风格锁定",
    detail: "Keep character, world, lens language, and cover direction from drifting apart.",
  },
  {
    code: "03",
    title: "Shot engine",
    zh: "分镜引擎",
    detail: "Turn the story into shot prompts, cover tasks, review points, and production notes.",
  },
  {
    code: "04",
    title: "Video tasks out",
    zh: "任务输出",
    detail: "Send a clear making route into the next creative tool or human review step.",
  },
];

const labItems = [
  "Prompt cleaner",
  "Character memory",
  "Cover judge",
  "Shot checklist",
  "Music mood note",
  "Image review board",
];

export function ProductRoomPage() {
  return (
    <main className="product-room-page">
      <header className="product-room-nav">
        <Link href="/" className="product-room-mark">
          <img src="/miao-paw-brand.svg" alt="" />
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
        <p>AI video machine</p>
        <h1>I am building an AI video machine.</h1>
        <b>剧本进去，人物、风格、分镜、封面和视频任务出来。</b>
        <a href={PRODUCT_LIVE_URL} className="product-room-open" target="_blank" rel="noreferrer">
          <span>OPEN LIVE PRODUCT</span>
          <small>Vercel deployed build</small>
        </a>
      </section>

      <section className="product-room-machine" aria-label="Product workflow">
        {productSteps.map((step) => (
          <article key={step.code}>
            <span>{step.code}</span>
            <h2>{step.title}</h2>
            <b>{step.zh}</b>
            <p>{step.detail}</p>
          </article>
        ))}
      </section>

      <section className="product-room-lab" id="lab">
        <div>
          <span>SMALL WORKS</span>
          <h2>A room of small tools around the machine.</h2>
          <p>
            The main tool is for AI video production. Around it are smaller
            utilities for image review, character memory, cover taste, prompt
            cleanup, and music mood notes.
          </p>
        </div>
        <ul>
          {labItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
