import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs", "design-references", "miao-ai-portfolio-prototype");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const url = process.argv[2] || "http://127.0.0.1:4180/";

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const messages = [];
page.on("console", (msg) => {
  if (["error", "warning"].includes(msg.type())) messages.push(`${msg.type()}: ${msg.text()}`);
});
page.on("pageerror", (error) => messages.push(`pageerror: ${error.message}`));

await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.screenshot({ path: path.join(outDir, "desktop-hero.png"), fullPage: false });
await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.2));
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(outDir, "desktop-mid-scroll.png"), fullPage: false });

const desktop = await page.evaluate(() => ({
  title: document.title,
  activeIndexText: document.querySelector(".edition-index a.active")?.textContent?.replace(/\s+/g, " ").trim(),
  sections: [...document.querySelectorAll("section[id]")].map((node) => node.id),
  hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
}));

await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
await page.screenshot({ path: path.join(outDir, "mobile-hero.png"), fullPage: false });
const mobile = await page.evaluate(() => ({
  width: document.documentElement.scrollWidth,
  viewport: window.innerWidth,
  hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 2,
}));

await browser.close();

console.log(JSON.stringify({ url, desktop, mobile, messages }, null, 2));
