# Product Room Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio Product Room as a Jiejoe-inspired AI production cockpit that presents Miao's private AI video product as a separate experimental lab, not as part of the Works image archive.

**Architecture:** Keep the existing scroll-driven portfolio shell in `PortfolioEditionsPrototype.tsx`, but extract Product Room into a focused client component with its own data model and interaction state contract. Product Room will render layered type, a seven-node production chain, live preview copy, and CTA links while `globals.css` supplies the dense typography, responsive layout, and reduced-motion behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, GSAP/ScrollTrigger already in the shell, Lenis already in the shell, Three.js background already in the shell, global CSS in `src/app/globals.css`, Playwright for browser verification.

## Global Constraints

- Product Room only: do not redesign Images, Videos, Music, Method, Contact, or the existing Works/TimeChannel image archive in this plan.
- Do not make `WORKS` a universal entry for Images / Videos / Music / Product; Product remains its own chapter and visual model.
- Product project ID is `019e8c7e-2bc4-7f40-892d-72a6e03debb0`; show it only as a small debug/prototype chip, not as hero copy.
- Product local prototype entry can be `http://127.0.0.1:8888/app.html`; external links must be optional and clearly framed as prototype/lab entry.
- Product Room copy must describe an AI production cockpit: script in; style, assets, storyboard, cover, video tasks, and production graph out.
- Use local/system fonts only; do not add remote font downloads.
- Do not reference the previously rejected short-drama folder in source/UI code; video-room work later should use `E:\作品\作品\视频\出海短剧`.
- Product Room must remain understandable without animation and respect `prefers-reduced-motion`.
- Keep cards at 8px radius or less. Do not nest cards inside cards.
- Avoid landing-page marketing composition; this is a personal portfolio lab section.

---

## File Structure

- Modify: `src/components/PortfolioEditionsPrototype.tsx`
  - Keep global portfolio state, scroll behavior, chapter rendering, and shell-level Three/GSAP effects.
  - Remove the old four-item `productModules` dataset and the old Product Room JSX from `ScenePanel`.
  - Import and render the new Product Room component for the `product` chapter.

- Create: `src/components/ProductRoom.tsx`
  - Own the seven-node product data model and bilingual Product Room copy.
  - Export `PRODUCT_ROOM_NODE_COUNT`.
  - Export `ProductRoom` with a narrow prop interface so the parent can continue auto-advancing the active node.

- Modify: `src/app/globals.css`
  - Replace old `.product-console`, `.product-module-grid`, `.product-runtime`, and `.product-livebar` styles with the new cockpit scene styles.
  - Add responsive and reduced-motion rules for layered type, node rail, preview panel, and CTA row.

- Verify only, no source change expected: `package.json`
  - Existing commands are `npm run lint`, `npm run typecheck`, `npm run build`, and `npm run check`.

---

### Task 1: Extract Product Room Data And Component Interface

**Files:**
- Create: `src/components/ProductRoom.tsx`
- Modify: `src/components/PortfolioEditionsPrototype.tsx`

**Interfaces:**
- Produces: `export const PRODUCT_ROOM_NODE_COUNT: number`
- Produces: `export function ProductRoom(props: ProductRoomProps): JSX.Element`
- Produces:

```ts
export type ProductRoomLocale = "en" | "zh";

export type ProductRoomProps = {
  locale: ProductRoomLocale;
  activeNodeIndex: number;
  onActiveNodeChange: (index: number) => void;
};
```

- Consumes from parent: current `locale`, current active product index, and `setActiveProductModule`.

- [ ] **Step 1: Create the Product Room component file with the full data model**

Create `src/components/ProductRoom.tsx` with this content:

```tsx
"use client";

export type ProductRoomLocale = "en" | "zh";

type ProductNode = {
  id: string;
  code: string;
  label: Record<ProductRoomLocale, string>;
  title: Record<ProductRoomLocale, string>;
  state: Record<ProductRoomLocale, string>;
  body: Record<ProductRoomLocale, string>;
  proof: Record<ProductRoomLocale, string>;
  metrics: Record<ProductRoomLocale, string[]>;
};

export type ProductRoomProps = {
  locale: ProductRoomLocale;
  activeNodeIndex: number;
  onActiveNodeChange: (index: number) => void;
};

const productNodes: ProductNode[] = [
  {
    id: "script",
    code: "01",
    label: { en: "SCRIPT", zh: "剧本" },
    title: { en: "Script enters first.", zh: "剧本先进入机器。" },
    state: { en: "intent parser", zh: "意图解析" },
    body: {
      en: "The workbench reads a rough story, pulls out scenes, characters, emotions, props, and production tasks.",
      zh: "制作台读取粗剧本，拆出场景、角色、情绪、道具和后续生产任务。",
    },
    proof: {
      en: "Script parsing is the source of the whole production graph.",
      zh: "剧本解析是整条生产图谱的源头。",
    },
    metrics: {
      en: ["scene", "role", "intent"],
      zh: ["场景", "角色", "意图"],
    },
  },
  {
    id: "style",
    code: "02",
    label: { en: "STYLE", zh: "风格" },
    title: { en: "Style becomes reusable.", zh: "风格变成可复用路线。" },
    state: { en: "style system", zh: "风格系统" },
    body: {
      en: "Preset and custom style routes translate references into repeatable visual rules instead of one-off prompts.",
      zh: "预设与自定义风格把参考图整理成可复用视觉规则，而不是一次性提示词。",
    },
    proof: {
      en: "A style route can be applied across shots, covers, and assets.",
      zh: "一条风格路线可以贯穿镜头、封面和资产。",
    },
    metrics: {
      en: ["preset", "custom", "reference"],
      zh: ["预设", "自定义", "参考"],
    },
  },
  {
    id: "assets",
    code: "03",
    label: { en: "ASSETS", zh: "资产" },
    title: { en: "Characters and props get prepared.", zh: "角色与道具进入资产库。" },
    state: { en: "asset prep", zh: "资产准备" },
    body: {
      en: "Character notes, prop logic, locations, and reusable visual material are organized before generation begins.",
      zh: "角色说明、道具逻辑、地点和可复用视觉材料会先被整理出来。",
    },
    proof: {
      en: "The product treats assets as production material, not scattered uploads.",
      zh: "产品把素材当作生产材料管理，而不是零散上传。",
    },
    metrics: {
      en: ["cast", "prop", "location"],
      zh: ["角色", "道具", "地点"],
    },
  },
  {
    id: "storyboard",
    code: "04",
    label: { en: "STORYBOARD", zh: "分镜" },
    title: { en: "Shots become a board.", zh: "镜头变成故事板。" },
    state: { en: "shot sheet", zh: "分镜表" },
    body: {
      en: "The script is turned into a shot sheet with camera language, visual intention, and reviewable production units.",
      zh: "剧本会变成带镜头语言、视觉意图和审核单元的分镜表。",
    },
    proof: {
      en: "A storyboard gives the creator a place to inspect the film before video generation.",
      zh: "分镜让创作者在生成视频前就能检查影片逻辑。",
    },
    metrics: {
      en: ["shot", "camera", "review"],
      zh: ["镜头", "机位", "审核"],
    },
  },
  {
    id: "cover",
    code: "05",
    label: { en: "COVER", zh: "封面" },
    title: { en: "Publishing assets are part of the flow.", zh: "发布素材也在流程里。" },
    state: { en: "publish pack", zh: "发布包装" },
    body: {
      en: "Covers, titles, hooks, and platform-facing materials are generated from the same production logic.",
      zh: "封面、标题、钩子和面向平台的发布素材会从同一套生产逻辑里长出来。",
    },
    proof: {
      en: "The machine thinks beyond the clip and prepares the public-facing package.",
      zh: "这台机器不只生产片段，也准备对外发布的包装。",
    },
    metrics: {
      en: ["cover", "hook", "title"],
      zh: ["封面", "钩子", "标题"],
    },
  },
  {
    id: "video",
    code: "06",
    label: { en: "VIDEO", zh: "视频任务" },
    title: { en: "Video tasks become trackable.", zh: "视频任务变得可追踪。" },
    state: { en: "generation queue", zh: "生成队列" },
    body: {
      en: "Storyboards, reference images, and shot language flow into video generation tasks that can be queued and reviewed.",
      zh: "分镜、参考图和镜头语言一起进入视频生成任务，可以排队、追踪和复核。",
    },
    proof: {
      en: "This is where the production cockpit touches actual AI video work.",
      zh: "这里是生产舱真正接入 AI 视频工作的地方。",
    },
    metrics: {
      en: ["queue", "render", "QC"],
      zh: ["队列", "生成", "质检"],
    },
  },
  {
    id: "canvas",
    code: "07",
    label: { en: "CANVAS", zh: "生产图谱" },
    title: { en: "Everything lands on a production graph.", zh: "所有东西落到生产图谱上。" },
    state: { en: "node canvas", zh: "节点画布" },
    body: {
      en: "The final surface is a graph where scripts, style, assets, shots, covers, and video tasks stay connected.",
      zh: "最终界面是一张图谱：剧本、风格、资产、分镜、封面和视频任务都保持连接。",
    },
    proof: {
      en: "The product is not a wall of works. It is the machine that produces the works.",
      zh: "它不是作品墙。它是生产作品的机器。",
    },
    metrics: {
      en: ["graph", "link", "system"],
      zh: ["图谱", "连接", "系统"],
    },
  },
];

export const PRODUCT_ROOM_NODE_COUNT = productNodes.length;

const productCopy = {
  en: {
    eyebrow: "AI production cockpit",
    status: "prototype in progress",
    title: "I am building a machine for AI video production.",
    lead: "Script goes in. Style, assets, storyboards, covers, video tasks, and a production graph come out.",
    debugLabel: "private product thread",
    debugValue: "019e8c7e-2bc4-7f40-892d-72a6e03debb0",
    primary: "Enter the Lab",
    secondary: "View the Pipeline",
    prototype: "Prototype surface",
    route: "script / style / asset / storyboard / cover / video / canvas",
    note: "The product itself stays private for now. This room shows the public idea, interaction route, and production logic.",
    live: "live node",
  },
  zh: {
    eyebrow: "AI 制片实验舱",
    status: "原型开发中",
    title: "我正在做一个 AI 制片工作台。",
    lead: "剧本进去，风格、角色、分镜、封面、视频任务和生产图谱出来。",
    debugLabel: "私有产品线程",
    debugValue: "019e8c7e-2bc4-7f40-892d-72a6e03debb0",
    primary: "进入实验舱",
    secondary: "查看生产链路",
    prototype: "原型入口",
    route: "剧本 / 风格 / 资产 / 分镜 / 封面 / 视频 / 图谱",
    note: "产品本体目前保持私有。这里展示公开的产品想法、交互路线和生产逻辑。",
    live: "当前节点",
  },
} as const;

export function ProductRoom({ locale, activeNodeIndex, onActiveNodeChange }: ProductRoomProps) {
  const c = productCopy[locale];
  const activeIndex = activeNodeIndex % PRODUCT_ROOM_NODE_COUNT;
  const activeNode = productNodes[activeIndex] ?? productNodes[0];
  const progress = `${((activeIndex + 1) / PRODUCT_ROOM_NODE_COUNT) * 100}%`;

  return (
    <div className="scene-panel product-lab-room" data-reveal>
      <div className="product-type-field" aria-hidden="true">
        <span className="product-type-solid">PRODUCT</span>
        <span className="product-type-outline">LAB</span>
        <span className="product-type-sliced">MACHINE</span>
      </div>

      <div className="product-lab-head">
        <span>{c.eyebrow}</span>
        <b>{c.status}</b>
      </div>

      <div className="product-lab-grid">
        <section className="product-lab-copy" aria-labelledby="product-lab-title">
          <p>{c.prototype}</p>
          <h3 id="product-lab-title">{c.title}</h3>
          <strong>{c.lead}</strong>
          <div className="product-debug-chip" aria-label={`${c.debugLabel}: ${c.debugValue}`}>
            <span>{c.debugLabel}</span>
            <code>{c.debugValue}</code>
          </div>
          <div className="product-lab-actions">
            <a href="http://127.0.0.1:8888/app.html" target="_blank" rel="noreferrer">
              {c.primary}
            </a>
            <a href="#product-pipeline">{c.secondary}</a>
          </div>
        </section>

        <section className="product-cockpit" aria-label={c.route}>
          <div className="product-cockpit-screen">
            <span>{c.live}</span>
            <b>{activeNode.label[locale]}</b>
            <h4>{activeNode.title[locale]}</h4>
            <p>{activeNode.body[locale]}</p>
            <small>{activeNode.proof[locale]}</small>
            <div className="product-node-metrics">
              {activeNode.metrics[locale].map((metric) => (
                <i key={metric}>{metric}</i>
              ))}
            </div>
          </div>

          <div className="product-node-rail" id="product-pipeline" role="tablist" aria-label={c.route}>
            {productNodes.map((node, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  type="button"
                  key={node.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="product-lab-title"
                  className={isActive ? "active" : ""}
                  onClick={() => onActiveNodeChange(index)}
                  onMouseEnter={() => onActiveNodeChange(index)}
                >
                  <span>{node.code}</span>
                  <strong>{node.label[locale]}</strong>
                  <small>{node.state[locale]}</small>
                </button>
              );
            })}
          </div>

          <div className="product-lab-progress" aria-hidden="true">
            <i style={{ width: progress }} />
          </div>
        </section>
      </div>

      <div className="product-signal-rail" aria-hidden="true">
        <span>{c.route}</span>
        <span>{c.route}</span>
      </div>

      <p className="product-lab-note">{c.note}</p>
    </div>
  );
}
```

- [ ] **Step 2: Import the component in the portfolio shell**

In `src/components/PortfolioEditionsPrototype.tsx`, add this import below the React imports:

```tsx
import { PRODUCT_ROOM_NODE_COUNT, ProductRoom } from "./ProductRoom";
```

- [ ] **Step 3: Remove the old four-item product dataset**

Delete the entire `const productModules = [...]` block from `src/components/PortfolioEditionsPrototype.tsx`.

- [ ] **Step 4: Update the parent auto-cycle to use the new exported node count**

Replace this code:

```tsx
setActiveProductModule((current) => (current + 1) % productModules.length);
```

With this code:

```tsx
setActiveProductModule((current) => (current + 1) % PRODUCT_ROOM_NODE_COUNT);
```

- [ ] **Step 5: Replace the product branch inside `ScenePanel`**

Replace the whole `if (chapter.id === "product") { ... }` branch in `ScenePanel` with this:

```tsx
if (chapter.id === "product") {
  return (
    <ProductRoom
      locale={locale}
      activeNodeIndex={activeProductModule}
      onActiveNodeChange={onProductModuleChange}
    />
  );
}
```

- [ ] **Step 6: Run TypeScript for the interface checkpoint**

Run:

```bash
npm run typecheck
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 7: Commit the component extraction**

Run:

```bash
git add src/components/PortfolioEditionsPrototype.tsx src/components/ProductRoom.tsx
git commit -m "feat: extract product room cockpit"
```

Expected: commit succeeds on branch `product-room-redesign`.

---

### Task 2: Redesign Product Room Visual System In CSS

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: class names emitted by `ProductRoom`: `.product-lab-room`, `.product-type-field`, `.product-lab-head`, `.product-lab-grid`, `.product-lab-copy`, `.product-debug-chip`, `.product-lab-actions`, `.product-cockpit`, `.product-cockpit-screen`, `.product-node-rail`, `.product-node-metrics`, `.product-lab-progress`, `.product-signal-rail`, `.product-lab-note`.
- Produces: responsive desktop and mobile layout for the new Product Room.

- [ ] **Step 1: Remove old Product Room CSS block**

In `src/app/globals.css`, delete the old rules for:

```css
.product-console
.product-console-head
.product-console-head span
.product-console-head b
.product-console-head b::before
.product-console > strong
.product-panel code
.product-panel > p
.product-module-grid
.product-module-grid button
.product-module-grid button::after
.product-module-grid button:hover
.product-module-grid button:focus-visible
.product-module-grid button.active
.product-module-grid button.active::after
.product-module-grid span
.product-module-grid small
.product-module-grid strong
[data-locale="zh"] .product-module-grid strong
.product-runtime
.product-runtime span
.product-runtime p
.product-runtime div
.product-runtime b
.product-livebar
.product-livebar i
@keyframes productScan
```

Keep the shared selector that also styles `.works-panel p` and `.contact-panel p`; after deleting `.product-panel > p`, the remaining selector should be:

```css
.works-panel p,
.contact-panel p {
  margin: 22px 0 0;
  color: rgb(243 239 223 / 66%);
  font-size: 15px;
  line-height: 1.62;
}
```

- [ ] **Step 2: Add the new Product Room base styles in the same location**

Insert this CSS where the old Product Room block was:

```css
.product-lab-room {
  position: relative;
  width: min(100%, 980px);
  overflow: hidden;
  border-color: rgb(183 255 37 / 22%);
  background:
    linear-gradient(145deg, rgb(7 8 7 / 88%), rgb(18 19 17 / 72%)),
    radial-gradient(circle at 78% 12%, rgb(183 255 37 / 16%), transparent 30%);
  isolation: isolate;
}

.product-lab-room::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(rgb(243 239 223 / 6%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(243 239 223 / 5%) 1px, transparent 1px);
  background-size: 44px 44px;
  mask-image: linear-gradient(135deg, transparent 0%, #000 28%, #000 72%, transparent 100%);
  opacity: 0.38;
}

.product-type-field {
  pointer-events: none;
  position: absolute;
  inset: -34px -24px auto;
  height: 190px;
  overflow: hidden;
  color: rgb(243 239 223 / 10%);
  font-family: var(--font-geist-mono), monospace;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 0.78;
  text-transform: uppercase;
  z-index: -1;
}

.product-type-field span {
  position: absolute;
  display: block;
  white-space: nowrap;
}

.product-type-solid {
  top: 4px;
  left: clamp(16px, 4vw, 48px);
  font-size: clamp(64px, 11vw, 154px);
}

.product-type-outline {
  top: 48px;
  right: clamp(12px, 3vw, 40px);
  color: transparent;
  -webkit-text-stroke: 1px rgb(183 255 37 / 28%);
  font-size: clamp(72px, 12vw, 168px);
}

.product-type-sliced {
  top: 108px;
  left: 22%;
  color: rgb(243 239 223 / 8%);
  font-size: clamp(44px, 7vw, 96px);
  text-decoration: line-through;
  text-decoration-thickness: 8px;
  text-decoration-color: rgb(183 255 37 / 24%);
}

.product-lab-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgb(243 239 223 / 12%);
  padding: 18px clamp(18px, 2.8vw, 30px);
  background: rgb(0 0 0 / 22%);
  font-family: var(--font-geist-mono), monospace;
  text-transform: uppercase;
}

.product-lab-head span,
.product-cockpit-screen > span {
  color: var(--acid);
  font-size: 11px;
  font-weight: 760;
}

.product-lab-head b {
  color: rgb(243 239 223 / 66%);
  font-size: 10px;
  font-weight: 720;
}

.product-lab-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.86fr) minmax(320px, 1.14fr);
  gap: clamp(18px, 3vw, 30px);
  padding: clamp(24px, 3.4vw, 36px);
}

.product-lab-copy {
  min-width: 0;
}

.product-lab-copy > p {
  margin: 0 0 12px;
  color: var(--acid);
  font-family: var(--font-geist-mono), monospace;
  font-size: 11px;
  font-weight: 760;
  text-transform: uppercase;
}

.product-lab-copy h3 {
  max-width: 11ch;
  margin: 0;
  color: var(--ivory);
  font-size: clamp(42px, 5.5vw, 78px);
  font-weight: 890;
  line-height: 0.88;
}

[data-locale="zh"] .product-lab-copy h3 {
  max-width: 9ch;
  line-height: 0.98;
}

.product-lab-copy > strong {
  display: block;
  max-width: 34ch;
  margin-top: 18px;
  color: rgb(243 239 223 / 76%);
  font-size: clamp(16px, 1.5vw, 20px);
  font-weight: 640;
  line-height: 1.35;
}

.product-debug-chip {
  display: grid;
  gap: 6px;
  max-width: 100%;
  margin-top: 22px;
  border: 1px solid rgb(243 239 223 / 13%);
  border-radius: 6px;
  padding: 10px 12px;
  background: rgb(0 0 0 / 28%);
}

.product-debug-chip span,
.product-debug-chip code {
  font-family: var(--font-geist-mono), monospace;
  font-size: 10px;
  line-height: 1.35;
  text-transform: uppercase;
}

.product-debug-chip span {
  color: rgb(243 239 223 / 48%);
}

.product-debug-chip code {
  color: rgb(243 239 223 / 68%);
  word-break: break-all;
}

.product-lab-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.product-lab-actions a {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgb(243 239 223 / 16%);
  border-radius: 6px;
  padding: 0 14px;
  color: var(--ivory);
  font-family: var(--font-geist-mono), monospace;
  font-size: 11px;
  font-weight: 760;
  text-decoration: none;
  text-transform: uppercase;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.product-lab-actions a:first-child {
  border-color: rgb(183 255 37 / 46%);
  background: var(--acid);
  color: rgb(7 8 7);
}

.product-lab-actions a:hover,
.product-lab-actions a:focus-visible {
  border-color: rgb(183 255 37 / 62%);
  background: rgb(183 255 37 / 12%);
  color: var(--acid);
  outline: none;
  transform: translateY(-2px);
}

.product-cockpit {
  min-width: 0;
}

.product-cockpit-screen {
  min-height: 268px;
  border: 1px solid rgb(183 255 37 / 22%);
  border-radius: 8px;
  padding: clamp(18px, 2.4vw, 26px);
  background:
    radial-gradient(circle at 18% 4%, rgb(183 255 37 / 15%), transparent 32%),
    linear-gradient(150deg, rgb(0 0 0 / 52%), rgb(7 8 7 / 76%));
  box-shadow: inset 0 0 0 1px rgb(243 239 223 / 5%);
}

.product-cockpit-screen b {
  display: block;
  margin-top: 18px;
  color: rgb(243 239 223 / 38%);
  font-family: var(--font-geist-mono), monospace;
  font-size: clamp(44px, 6vw, 82px);
  font-weight: 900;
  line-height: 0.82;
  text-transform: uppercase;
}

.product-cockpit-screen h4 {
  max-width: 24ch;
  margin: 18px 0 0;
  color: var(--ivory);
  font-size: clamp(20px, 2.1vw, 30px);
  font-weight: 820;
  line-height: 1.02;
}

.product-cockpit-screen p,
.product-cockpit-screen small,
.product-lab-note {
  color: rgb(243 239 223 / 66%);
  font-size: 14px;
  line-height: 1.58;
}

.product-cockpit-screen p {
  max-width: 52ch;
  margin: 12px 0 0;
}

.product-cockpit-screen small {
  display: block;
  max-width: 48ch;
  margin-top: 10px;
}

.product-node-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 18px;
}

.product-node-metrics i {
  display: inline-grid;
  min-height: 24px;
  place-items: center;
  border: 1px solid rgb(243 239 223 / 13%);
  border-radius: 999px;
  padding: 0 9px;
  color: rgb(243 239 223 / 70%);
  font-family: var(--font-geist-mono), monospace;
  font-size: 9px;
  font-style: normal;
  font-weight: 720;
  text-transform: uppercase;
}

.product-node-rail {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 6px;
  margin-top: 10px;
}

.product-node-rail button {
  position: relative;
  display: grid;
  min-height: 112px;
  align-content: space-between;
  overflow: hidden;
  border: 1px solid rgb(243 239 223 / 13%);
  border-radius: 6px;
  padding: 10px;
  background: rgb(0 0 0 / 22%);
  color: rgb(243 239 223 / 72%);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.product-node-rail button::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 2px;
  transform: scaleY(0);
  transform-origin: bottom;
  background: var(--acid);
  opacity: 0;
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.product-node-rail button:hover,
.product-node-rail button:focus-visible,
.product-node-rail button.active {
  border-color: rgb(183 255 37 / 45%);
  background: rgb(183 255 37 / 9%);
  outline: none;
  transform: translateY(-2px);
}

.product-node-rail button.active::before {
  opacity: 1;
  transform: scaleY(1);
}

.product-node-rail span,
.product-node-rail strong,
.product-node-rail small {
  font-family: var(--font-geist-mono), monospace;
  text-transform: uppercase;
}

.product-node-rail span {
  color: var(--acid);
  font-size: 10px;
  font-weight: 760;
}

.product-node-rail strong {
  color: var(--ivory);
  font-size: 12px;
  font-weight: 820;
  line-height: 1;
}

.product-node-rail small {
  color: rgb(243 239 223 / 48%);
  font-size: 9px;
  font-weight: 720;
  line-height: 1.25;
}

.product-lab-progress {
  height: 2px;
  margin-top: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: rgb(243 239 223 / 10%);
}

.product-lab-progress i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--acid), rgb(243 239 223 / 74%));
  transition: width 420ms cubic-bezier(0.16, 1, 0.3, 1);
}

.product-signal-rail {
  display: flex;
  gap: 18px;
  overflow: hidden;
  border-top: 1px solid rgb(243 239 223 / 11%);
  border-bottom: 1px solid rgb(243 239 223 / 11%);
  padding: 10px 0;
  color: rgb(243 239 223 / 38%);
  font-family: var(--font-geist-mono), monospace;
  font-size: 10px;
  font-weight: 720;
  text-transform: uppercase;
  white-space: nowrap;
}

.product-signal-rail span {
  min-width: max-content;
  padding-left: 18px;
}

.product-lab-note {
  max-width: 68ch;
  margin: 18px clamp(18px, 2.8vw, 30px) clamp(20px, 3vw, 30px);
}
```

- [ ] **Step 3: Add Product Room motion styles**

Add this block after the base styles:

```css
@media (prefers-reduced-motion: no-preference) {
  .product-type-outline {
    animation: productTypeDrift 9s ease-in-out infinite alternate;
  }

  .product-type-sliced {
    animation: productTypeScan 3.6s steps(2, end) infinite;
  }

  .product-node-rail button.active::before {
    animation: productNodePulse 1300ms ease-in-out infinite;
  }

  .product-signal-rail span {
    animation: productSignalRail 18s linear infinite;
  }
}

@keyframes productTypeDrift {
  from {
    transform: translateX(-2%);
  }

  to {
    transform: translateX(3%);
  }
}

@keyframes productTypeScan {
  0%,
  100% {
    opacity: 0.34;
    clip-path: inset(0 0 42% 0);
  }

  50% {
    opacity: 0.72;
    clip-path: inset(36% 0 0 0);
  }
}

@keyframes productNodePulse {
  0%,
  100% {
    opacity: 0.42;
  }

  50% {
    opacity: 1;
  }
}

@keyframes productSignalRail {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-100%);
  }
}
```

- [ ] **Step 4: Update reduced-motion selectors**

In the existing `@media (prefers-reduced-motion: reduce)` block, replace the old Product Room selectors:

```css
.product-module-grid button,
.product-module-grid button::after,
.product-livebar i,
```

With:

```css
.product-lab-actions a,
.product-node-rail button,
.product-node-rail button::before,
.product-lab-progress i,
.product-type-outline,
.product-type-sliced,
.product-signal-rail span,
```

Expected: Product Room hover and progress transitions are disabled for users who request reduced motion.

- [ ] **Step 5: Update responsive rules**

In the existing `@media (max-width: 720px)` block, remove old rules for:

```css
.product-module-grid
.product-module-grid button
.product-runtime
```

Add these mobile rules in that same block:

```css
.product-lab-grid {
  grid-template-columns: 1fr;
  padding: 22px 16px;
}

.product-lab-copy h3 {
  max-width: 10ch;
  font-size: clamp(38px, 13vw, 56px);
}

.product-cockpit-screen {
  min-height: 240px;
  padding: 16px;
}

.product-cockpit-screen b {
  font-size: clamp(40px, 15vw, 64px);
}

.product-node-rail {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.product-node-rail button {
  min-height: 96px;
}

.product-signal-rail {
  font-size: 9px;
}
```

- [ ] **Step 6: Run lint and typecheck for CSS/class integration**

Run:

```bash
npm run lint
npm run typecheck
```

Expected:
- `npm run lint` may keep the existing warnings in `src/timechannel/native/**`, but no new errors are introduced.
- `npm run typecheck` passes.

- [ ] **Step 7: Commit the visual system**

Run:

```bash
git add src/app/globals.css
git commit -m "style: redesign product room lab"
```

Expected: commit succeeds.

---

### Task 3: Align Chapter Copy And Product Navigation Context

**Files:**
- Modify: `src/components/PortfolioEditionsPrototype.tsx`

**Interfaces:**
- Consumes: existing `copy` and `chapters` objects.
- Produces: Product chapter text that matches the new cockpit narrative and preserves the separate Product entry in navigation.

- [ ] **Step 1: Update English and Chinese Product copy**

In `src/components/PortfolioEditionsPrototype.tsx`, update only these fields in `copy.en`:

```ts
productTitle: "AI production cockpit",
productSubtitle: "Prototype in progress",
productHint: "The public layer shows the interaction route. The private product keeps its internal build details out of the portfolio.",
```

And update only these fields in `copy.zh`:

```ts
productTitle: "AI 制片实验舱",
productSubtitle: "原型开发中",
productHint: "公开层展示交互路线；产品内部构建细节暂时不放进作品集。",
```

- [ ] **Step 2: Update Product chapter copy**

In the `chapters` item where `id: "product"`, replace the title, line, body, and signal with:

```ts
title: { en: "A product room for the machine behind the works.", zh: "这里不是作品墙，而是生产作品的机器。" },
line: { en: "Script, style, assets, storyboard, cover, video tasks, and production graph live in one cockpit.", zh: "剧本、风格、资产、分镜、封面、视频任务和生产图谱，在同一个实验舱里连接起来。" },
body: {
  en: "The private prototype is an AI video production workbench. This public room shows how the tool thinks, moves, and organizes creative work.",
  zh: "这个私有原型是一套 AI 视频制作工作台。公开页面展示它如何思考、流动，以及如何组织创作生产。",
},
signal: "SCRIPT / STYLE / VIDEO / GRAPH",
```

- [ ] **Step 3: Confirm Product remains a separate nav chapter**

Leave the `copy.en.nav`, `copy.zh.nav`, and `heroModules` Product link as separate Product entries. Do not add Images / Videos / Music / Product into the Works entry.

Expected checks:

```bash
rg -n "Images / Videos / Music / Product|image / video / music / product|Product Room lives" src/components/PortfolioEditionsPrototype.tsx
```

Expected: no matches in source copy that imply Works is a universal entry.

- [ ] **Step 4: Run typecheck**

Run:

```bash
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit copy alignment**

Run:

```bash
git add src/components/PortfolioEditionsPrototype.tsx
git commit -m "copy: align product room narrative"
```

Expected: commit succeeds.

---

### Task 4: Full Build And Browser Verification

**Files:**
- Verify: `src/components/ProductRoom.tsx`
- Verify: `src/components/PortfolioEditionsPrototype.tsx`
- Verify: `src/app/globals.css`

**Interfaces:**
- Consumes: complete Product Room implementation from Tasks 1-3.
- Produces: proof that the page builds, renders, and responds correctly at desktop and mobile.

- [ ] **Step 1: Run full repo check**

Run:

```bash
npm run check
```

Expected:
- `npm run lint` completes with only pre-existing `src/timechannel/native/**` warnings.
- `npm run typecheck` passes.
- `npm run build` passes.

- [ ] **Step 2: Start the dev server**

Run:

```bash
npm run dev -- --hostname 127.0.0.1 --port 4182
```

Expected:
- Next.js starts on `http://127.0.0.1:4182`.
- If port `4182` is occupied, use the next available port and record it in the final handoff.

- [ ] **Step 3: Verify desktop Product Room with Browser or Playwright**

Open:

```text
http://127.0.0.1:4182/#product
```

Desktop viewport: `1440x1000`.

Expected visible checks:
- Large background words `PRODUCT`, `LAB`, and `MACHINE` are visible behind the cockpit and do not cover readable text.
- Headline reads `我正在做一个 AI 制片工作台。` when the site is in Chinese.
- The seven nodes are visible: `剧本`, `风格`, `资产`, `分镜`, `封面`, `视频任务`, `生产图谱`.
- Hovering or clicking a node updates the cockpit screen text and progress line.
- The product ID appears only in the small debug chip.
- The CTA row is visible above the lower edge of the Product Room section.

- [ ] **Step 4: Verify mobile Product Room with Browser or Playwright**

Open the same URL with mobile viewport: `390x844`.

Expected visible checks:
- No text overlaps.
- Node rail wraps into two columns.
- The CTA buttons fit on screen.
- The debug product ID wraps inside its chip.
- Product Room remains separate from Works/TimeChannel styling.

- [ ] **Step 5: Capture implementation screenshots**

Save screenshots to:

```text
docs/superpowers/screenshots/product-room-desktop.png
docs/superpowers/screenshots/product-room-mobile.png
```

Expected: both files exist and show Product Room, not the hero or Works section.

- [ ] **Step 6: Commit verification artifacts only if screenshots were created**

If screenshots are created, run:

```bash
git add docs/superpowers/screenshots/product-room-desktop.png docs/superpowers/screenshots/product-room-mobile.png
git commit -m "test: capture product room verification"
```

Expected: commit succeeds. If screenshots are not committed by project convention, record the screenshot paths in the final handoff instead.

---

### Task 5: Final Review And Handoff

**Files:**
- Review: `src/components/ProductRoom.tsx`
- Review: `src/components/PortfolioEditionsPrototype.tsx`
- Review: `src/app/globals.css`
- Review: `docs/superpowers/plans/2026-06-19-product-room-redesign.md`

**Interfaces:**
- Consumes: implementation commits and verification output.
- Produces: final status for the user and a clean worktree ready for review or merge.

- [ ] **Step 1: Review diff summary**

Run:

```bash
git log --oneline --decorate -5
git status --short
git diff --stat main...HEAD
```

Expected:
- Branch is `product-room-redesign`.
- Worktree is clean or only contains intentionally uncommitted local artifacts.
- Diff is limited to Product Room files, plan docs, and optional screenshots.

- [ ] **Step 2: Run placeholder scan on the plan and implementation**

Run:

```powershell
$pattern = @("T"+"BD", "TO"+"DO", "implement"+" later", "fill in"+" details", "Similar"+" to Task", "appropriate"+" error handling", "add"+" validation", "handle"+" edge cases") -join "|"
rg -n $pattern docs/superpowers/plans/2026-06-19-product-room-redesign.md src/components/ProductRoom.tsx src/components/PortfolioEditionsPrototype.tsx src/app/globals.css
```

Expected: no matches.

- [ ] **Step 3: Confirm forbidden video folder is not referenced**

Run:

```powershell
$rejectedFolderPattern = "局中局" + "短剧"
rg -n $rejectedFolderPattern src docs public
```

Expected: no matches.

- [ ] **Step 4: Confirm Product Room does not merge into Works**

Run:

```bash
rg -n "Images / Videos / Music / Product|Videos / Music / Product|universal entry|总入口" src/components/PortfolioEditionsPrototype.tsx src/components/ProductRoom.tsx src/app/globals.css
```

Expected: no matches in source/UI code.

- [ ] **Step 5: Final response**

Tell the user:

```text
Product Room 已经在 worktree `E:\CodexProjects\miao-ai-portfolio\.worktrees\product-room-redesign` 完成。
分支：`product-room-redesign`
验证：`npm run check` 通过；桌面和移动端 Product Room 已检查。
本地预览：`http://127.0.0.1:4182/#product`
```

If any verification command could not be run, state the exact command and reason.

---

## Self-Review

**Spec coverage:** The plan covers Product Room as its own chapter, a seven-node AI production cockpit, Jiejoe-style mixed typography, small product ID chip, prototype CTA, interaction on hover/click, progress line, reduced-motion behavior, desktop/mobile verification, and the constraint not to merge Product into Works. The plan intentionally does not implement Video Room or Music Room because the spec says Product Room only.

**Placeholder scan:** The plan avoids the disallowed placeholder tokens from the planning skill and vague test instructions. Every code-changing step includes exact code or exact selectors.

**Type consistency:** `PRODUCT_ROOM_NODE_COUNT`, `ProductRoom`, `ProductRoomProps`, and `ProductRoomLocale` are defined in Task 1 and consumed consistently by later tasks. CSS class names in Task 2 match the JSX emitted by `ProductRoom`.
