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
      zh: "剧本会变成带镜头语言、视觉意图和可审核单元的分镜表。",
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
    lead: "剧本进去，风格、资产、分镜、封面、视频任务和生产图谱出来。",
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

          <div className="product-node-rail" id="product-pipeline" role="group" aria-label={c.route}>
            {productNodes.map((node, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  type="button"
                  key={node.id}
                  aria-pressed={isActive}
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
