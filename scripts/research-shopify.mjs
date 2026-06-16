import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const targetUrl = "https://www.shopify.com/editions/winter2026";
const root = process.cwd();
const researchDir = path.join(root, "docs", "research", "shopify-winter2026");
const refsDir = path.join(root, "docs", "design-references", "shopify-winter2026");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function ensureDirs() {
  await fs.mkdir(researchDir, { recursive: true });
  await fs.mkdir(refsDir, { recursive: true });
}

async function dismissCookieUi(page) {
  const labels = ["Accept all", "Accept", "Agree", "I agree", "OK"];
  for (const label of labels) {
    const candidate = page.getByRole("button", { name: label, exact: false });
    if ((await candidate.count().catch(() => 0)) > 0) {
      await candidate.first().click({ timeout: 1200 }).catch(() => {});
      await page.waitForTimeout(400);
      return;
    }
  }
}

async function collectSnapshot(page) {
  return page.evaluate(() => {
    const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
    const styleOf = (element) => {
      const cs = getComputedStyle(element);
      return {
        display: cs.display,
        position: cs.position,
        top: cs.top,
        zIndex: cs.zIndex,
        opacity: cs.opacity,
        transform: cs.transform,
        background: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        lineHeight: cs.lineHeight,
        letterSpacing: cs.letterSpacing,
        transition: cs.transition,
        animationName: cs.animationName,
        animationTimeline: cs.animationTimeline || ""
      };
    };

    const headings = [...document.querySelectorAll("h1,h2,h3")]
      .slice(0, 80)
      .map((node) => ({
        tag: node.tagName.toLowerCase(),
        text: clean(node.textContent).slice(0, 180),
        rect: node.getBoundingClientRect().toJSON?.() || {
          x: node.getBoundingClientRect().x,
          y: node.getBoundingClientRect().y,
          width: node.getBoundingClientRect().width,
          height: node.getBoundingClientRect().height
        },
        style: styleOf(node)
      }))
      .filter((item) => item.text);

    const sections = [...document.querySelectorAll("section, main > div, [data-section], [id]")]
      .map((node, index) => {
        const rect = node.getBoundingClientRect();
        return {
          index,
          tag: node.tagName.toLowerCase(),
          id: node.id || "",
          classes: typeof node.className === "string" ? node.className.split(/\s+/).slice(0, 8).join(" ") : "",
          text: clean(node.textContent).slice(0, 220),
          rect: { x: rect.x, y: rect.y + scrollY, width: rect.width, height: rect.height },
          style: styleOf(node)
        };
      })
      .filter((item) => item.rect.height > 80 && item.text)
      .slice(0, 120);

    const assets = {
      images: [...document.querySelectorAll("img")].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        loading: img.loading
      })),
      videos: [...document.querySelectorAll("video")].map((video) => ({
        src: video.currentSrc || video.src || video.querySelector("source")?.src || "",
        poster: video.poster,
        autoplay: video.autoplay,
        loop: video.loop,
        muted: video.muted,
        playsInline: video.playsInline
      })),
      canvases: [...document.querySelectorAll("canvas")].map((canvas) => {
        const rect = canvas.getBoundingClientRect();
        return { width: canvas.width, height: canvas.height, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
      }),
      backgroundImages: [...document.querySelectorAll("*")]
        .map((node) => ({ node, bg: getComputedStyle(node).backgroundImage }))
        .filter((item) => item.bg && item.bg !== "none" && item.bg.includes("url("))
        .slice(0, 80)
        .map((item) => ({
          element: item.node.tagName.toLowerCase(),
          id: item.node.id || "",
          classes: typeof item.node.className === "string" ? item.node.className.split(/\s+/).slice(0, 5).join(" ") : "",
          backgroundImage: item.bg
        }))
    };

    const fontFamilies = [...new Set([...document.querySelectorAll("body *")]
      .slice(0, 500)
      .map((node) => getComputedStyle(node).fontFamily)
      .filter(Boolean))].slice(0, 30);

    const fixedOrSticky = [...document.querySelectorAll("*")]
      .map((node) => ({ node, cs: getComputedStyle(node), rect: node.getBoundingClientRect() }))
      .filter((item) => ["fixed", "sticky"].includes(item.cs.position) && item.rect.width > 20 && item.rect.height > 20)
      .slice(0, 80)
      .map((item) => ({
        tag: item.node.tagName.toLowerCase(),
        id: item.node.id || "",
        classes: typeof item.node.className === "string" ? item.node.className.split(/\s+/).slice(0, 8).join(" ") : "",
        text: clean(item.node.textContent).slice(0, 120),
        rect: { x: item.rect.x, y: item.rect.y, width: item.rect.width, height: item.rect.height },
        style: styleOf(item.node)
      }));

    const libraries = {
      gsap: Boolean(window.gsap),
      scrollTrigger: Boolean(window.ScrollTrigger || window.gsap?.ScrollTrigger),
      lenis: Boolean(window.Lenis || document.documentElement.classList.contains("lenis") || document.body.classList.contains("lenis")),
      three: Boolean(window.THREE),
      webglCanvasCount: document.querySelectorAll("canvas").length,
      videoCount: document.querySelectorAll("video").length,
      cssAnimationTimelineCount: [...document.querySelectorAll("*")].filter((node) => getComputedStyle(node).animationTimeline && getComputedStyle(node).animationTimeline !== "auto").length
    };

    return {
      url: location.href,
      title: document.title,
      viewport: { width: innerWidth, height: innerHeight, scrollY, scrollHeight: document.documentElement.scrollHeight },
      bodyClasses: document.body.className,
      htmlClasses: document.documentElement.className,
      fonts: fontFamilies,
      headings,
      sections,
      assets,
      fixedOrSticky,
      libraries
    };
  });
}

async function collectScrollSweep(page) {
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const viewport = page.viewportSize();
  const maxY = Math.max(0, scrollHeight - viewport.height);
  const stops = [0, 0.08, 0.16, 0.28, 0.4, 0.55, 0.72, 0.88, 1].map((ratio) => Math.round(maxY * ratio));
  const states = [];

  for (let index = 0; index < stops.length; index++) {
    const y = stops[index];
    await page.evaluate((value) => scrollTo(0, value), y);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(refsDir, `scroll-${String(index).padStart(2, "0")}-${y}.png`), fullPage: false });
    states.push(await page.evaluate(() => {
      const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
      const visibleText = [...document.querySelectorAll("h1,h2,h3,p,a,button")]
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < innerHeight && rect.width > 12 && rect.height > 8;
        })
        .slice(0, 35)
        .map((node) => ({ tag: node.tagName.toLowerCase(), text: clean(node.textContent).slice(0, 140) }))
        .filter((item) => item.text);
      const transforms = [...document.querySelectorAll("canvas, video, [style*='transform'], section, main > div")]
        .map((node) => {
          const rect = node.getBoundingClientRect();
          const cs = getComputedStyle(node);
          return {
            tag: node.tagName.toLowerCase(),
            id: node.id || "",
            classes: typeof node.className === "string" ? node.className.split(/\s+/).slice(0, 5).join(" ") : "",
            rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
            opacity: cs.opacity,
            position: cs.position,
            transform: cs.transform
          };
        })
        .filter((item) => item.rect.width > 40 && item.rect.height > 40 && item.rect.bottom > -innerHeight && item.rect.y < innerHeight * 2)
        .slice(0, 50);
      return { scrollY, visibleText, transforms };
    }));
  }
  return states;
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"]
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await dismissCookieUi(page);
  await page.screenshot({ path: path.join(refsDir, "desktop-full.png"), fullPage: true });
  await page.screenshot({ path: path.join(refsDir, "desktop-viewport-00.png"), fullPage: false });
  const desktop = await collectSnapshot(page);
  const sweep = await collectScrollSweep(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(refsDir, "mobile-full.png"), fullPage: true });
  await page.screenshot({ path: path.join(refsDir, "mobile-viewport-00.png"), fullPage: false });
  const mobile = await collectSnapshot(page);

  await browser.close();

  const output = { targetUrl, capturedAt: new Date().toISOString(), desktop, mobile, sweep };
  await fs.writeFile(path.join(researchDir, "raw-inspection.json"), JSON.stringify(output, null, 2), "utf8");

  const lines = [
    "# Shopify Winter 2026 Interaction Research",
    "",
    `Target: ${targetUrl}`,
    `Captured: ${output.capturedAt}`,
    "",
    "## Detected Libraries / Primitives",
    "",
    ...Object.entries(desktop.libraries).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Top-Level Motion Notes",
    "",
    "- This file is for interaction study only. Do not reuse Shopify copy, assets, marks, or product claims in the portfolio.",
    `- Desktop scroll height: ${desktop.viewport.scrollHeight}px.`,
    `- Images observed: ${desktop.assets.images.length}. Videos observed: ${desktop.assets.videos.length}. Canvas count: ${desktop.assets.canvases.length}.`,
    `- Fixed/sticky elements observed: ${desktop.fixedOrSticky.length}.`,
    "",
    "## Headings Observed",
    "",
    ...desktop.headings.slice(0, 28).map((item) => `- ${item.tag}: ${item.text}`),
    "",
    "## Page Topology Candidates",
    "",
    ...desktop.sections.slice(0, 40).map((item) => `- ${item.tag}${item.id ? `#${item.id}` : ""} ${item.classes ? `.${item.classes}` : ""} | y=${Math.round(item.rect.y)} h=${Math.round(item.rect.height)} | ${item.text.slice(0, 130)}`),
    "",
    "## Scroll Sweep",
    "",
    ...sweep.map((state, index) => [
      `### Stop ${index}: y=${Math.round(state.scrollY)}`,
      ...state.visibleText.slice(0, 10).map((item) => `- ${item.tag}: ${item.text}`)
    ].join("\n")),
    ""
  ];

  await fs.writeFile(path.join(researchDir, "BEHAVIORS.md"), lines.join("\n"), "utf8");
  console.log(JSON.stringify({
    researchDir,
    refsDir,
    scrollStops: sweep.length,
    desktopSections: desktop.sections.length,
    desktopImages: desktop.assets.images.length,
    desktopVideos: desktop.assets.videos.length,
    desktopCanvases: desktop.assets.canvases.length
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
