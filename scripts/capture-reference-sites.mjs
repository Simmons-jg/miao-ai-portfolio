import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "docs", "design-references", "portfolio-references");
const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sites = [
  ["jiejoe-home", "https://www.jiejoe.com/home"],
  ["rainmorime-home", "https://www.rainmorime.com/"],
];

await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ executablePath: chromePath, headless: true });
for (const [name, url] of sites) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 });
  const messages = [];
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) messages.push(`${msg.type()}: ${msg.text()}`);
  });
  await page.goto(url, { waitUntil: "commit", timeout: 60000 }).catch((error) => {
    messages.push(`navigation: ${error.message}`);
  });
  await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, `${name}-desktop.png`), fullPage: false });
  const info = await page.evaluate(() => ({
    title: document.title,
    url: location.href,
    bodyText: document.body.innerText.replace(/\s+/g, " ").slice(0, 1200),
    links: [...document.querySelectorAll("a")].slice(0, 20).map((a) => ({ text: a.textContent?.trim(), href: a.href })),
    canvases: document.querySelectorAll("canvas").length,
    videos: document.querySelectorAll("video").length,
    images: document.querySelectorAll("img").length,
  }));
  await fs.writeFile(path.join(outDir, `${name}.json`), JSON.stringify({ info, messages }, null, 2), "utf8");
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ outDir, sites: sites.map(([name]) => name) }, null, 2));
