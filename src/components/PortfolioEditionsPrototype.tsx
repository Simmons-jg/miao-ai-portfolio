"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type Locale = "en" | "zh";

type Chapter = {
  id: string;
  code: string;
  nav: Record<Locale, string>;
  title: Record<Locale, string>;
  line: Record<Locale, string>;
  body: Record<Locale, string>;
  signal: string;
};

const copy = {
  en: {
    brand: "Guo Jiawen / Miao",
    role: "AI product / AIGC direction / visual storytelling",
    nav: ["Work", "Product", "Method", "Contact"],
    lang: "中文",
    heroTitle: "Hi, I am Miao. I direct AI into things you can see, click, and feel.",
    heroBody:
      "A personal site for public works, product prototypes, visual experiments, and the way I think with AI.",
    primary: "Enter works",
    secondary: "About Miao",
    index: "Chapters",
    stage: "Interactive personal site",
    productTitle: "AI product lab",
    productSubtitle: "Prototype in progress",
    productHint: "Private product identifiers stay private. This layer only shows the public idea, interaction route, and demo surface.",
    worksTitle: "Works channel",
    worksLead:
      "Click or scroll through public works as a moving channel: visual worlds, demos, experiments, and image systems.",
    methodTitle: "Operating rhythm",
    contactTitle: "About Miao",
    contactBody:
      "I am interested in AI products that still have authorship: clearer interfaces, stronger images, better stories, and workflows that creators can actually use.",
  },
  zh: {
    brand: "郭嘉雯 / Miao喵渺淼妙",
    role: "AI 产品 / AIGC 编导 / 视觉叙事",
    nav: ["作品", "产品", "方法", "联系"],
    lang: "EN",
    heroTitle: "我是 Miao，把 AI 变成可以被看见、点击和感受到的作品。",
    heroBody:
      "这是一个个人网站，放公开作品、产品原型、视觉实验，以及我如何用 AI 思考和创作。",
    primary: "进入作品",
    secondary: "关于 Miao",
    index: "章节",
    stage: "互动个人网站",
    productTitle: "AI 产品实验室",
    productSubtitle: "原型开发中",
    productHint: "内部产品标识不在网页展示。这里保留公开的产品想法、交互路线和 Demo 表面。",
    worksTitle: "作品频道",
    worksLead: "点击或滚动进入公开作品：视觉世界、产品 Demo、交互实验和生成图像系统会像频道一样移动。",
    methodTitle: "工作节奏",
    contactTitle: "关于 Miao",
    contactBody:
      "我关心的是有作者感的 AI 产品：更清晰的界面、更强的图像、更好的故事，以及创作者真的能使用的工作流。",
  },
} as const;

const chapters: Chapter[] = [
  {
    id: "direction",
    code: "I",
    nav: { en: "About", zh: "关于" },
    title: { en: "I make AI feel directed, not accidental.", zh: "我让 AI 作品看起来像被导演过，而不是偶然生成。" },
    line: { en: "Images, interfaces, and stories all need rhythm.", zh: "图像、界面和故事都需要节奏。" },
    body: {
      en: "My work sits between creative direction, AI product thinking, and visual systems. I care about what the model makes, but also why it should exist.",
      zh: "我的工作在创意编导、AI 产品思维和视觉系统之间。我关心模型生成了什么，也关心它为什么值得存在。",
    },
    signal: "IMAGE / PRODUCT / STORY",
  },
  {
    id: "product",
    code: "II",
    nav: { en: "Lab", zh: "实验室" },
    title: { en: "AI products should feel usable before they feel clever.", zh: "AI 产品先要好用，再谈聪明。" },
    line: { en: "The product layer is a lab for creator-facing AI tools.", zh: "产品层是面向创作者的 AI 工具实验室。" },
    body: {
      en: "The current prototype is kept private while it is being shaped. The public site shows the interaction idea and how the experience should feel.",
      zh: "当前原型在开发阶段保持私密。网站只展示公开的交互想法，以及这个体验应该呈现出的感觉。",
    },
    signal: "IDEA / DEMO / FLOW",
  },
  {
    id: "judgment",
    code: "III",
    nav: { en: "Taste Protocol", zh: "审美协议" },
    title: { en: "Taste becomes a visible system.", zh: "审美变成可见系统。" },
    line: { en: "AI output still needs taste, rhythm, and restraint.", zh: "AI 输出仍然需要审美、节奏和克制。" },
    body: {
      en: "Composition, continuity, mood, interaction clarity, and finish become a review system for AI-native work.",
      zh: "构图、连续性、情绪、交互清晰度和完成度，构成 AI 原生作品的审核系统。",
    },
    signal: "TASTE / RHYTHM / CONTROL",
  },
  {
    id: "works",
    code: "IV",
    nav: { en: "Works", zh: "作品" },
    title: { en: "A moving channel of public works.", zh: "一个会移动的公开作品频道。" },
    line: { en: "The archive should invite touch, not ask people to read a wall.", zh: "作品集应该引导人点击，而不是逼人读一堵墙。" },
    body: {
      en: "This is where the site becomes closer to a gallery toy: hover, click, enter, and inspect the pieces directly.",
      zh: "这里更接近一个可以玩的作品入口：悬停、点击、进入，然后直接查看作品。",
    },
    signal: "CLICK / ENTER / VIEW",
  },
  {
    id: "method",
    code: "V",
    nav: { en: "Method", zh: "方法" },
    title: { en: "Observe, script, generate, review, ship.", zh: "观察、编剧、生成、审核、交付。" },
    line: { en: "A process should move, not read like a list.", zh: "方法不应该像清单，而应该像流程一样移动。" },
    body: {
      en: "The page shows how a messy creative or product question becomes a visual route, a prototype, and a shipped artifact.",
      zh: "页面会展示一个混乱的创意或产品问题如何变成视觉路线、可运行原型和可交付作品。",
    },
    signal: "OBSERVE / FRAME / SHIP",
  },
  {
    id: "contact",
    code: "VI",
    nav: { en: "Contact", zh: "联系" },
    title: { en: "A personal site first. A resume second.", zh: "先是个人网站，然后才是简历入口。" },
    line: { en: "Taste, product sense, and AI-native practice live in the same person.", zh: "审美、产品感和 AI 原生实践，应该在同一个人身上合起来。" },
    body: {
      en: "If the page gives you a clear feeling of how I think, the resume can fill in the facts afterward.",
      zh: "如果这个网页先让你感受到我是怎么思考的，简历再负责补充事实就够了。",
    },
    signal: "MIAO / WORK / CONTACT",
  },
];

const works = [
  {
    id: "01",
    en: "Cinematic Composition Study",
    zh: "影像构图实验",
    roleEn: "visual direction / composition review",
    roleZh: "视觉导演 / 构图审核",
    detailEn: "Lighting, atmosphere, scene logic, and frame-level visual judgment.",
    detailZh: "光线、氛围、场景逻辑和单帧级视觉判断。",
    image: "/portfolio-assets/miao-work-01-nine-tail-fox.webp",
    tagsEn: ["image", "scene logic", "taste"],
    tagsZh: ["影像", "场景逻辑", "审美"],
  },
  {
    id: "02",
    en: "Large-screen Motion Study",
    zh: "大屏动态视觉实验",
    roleEn: "motion mood / visual QC",
    roleZh: "动态情绪 / 视觉质检",
    detailEn: "Scale, rhythm, contrast, texture, and screen-ready visual tension.",
    detailZh: "尺度、节奏、对比、质感和适配大屏的视觉张力。",
    image: "/portfolio-assets/miao-work-02-crystal-crown.webp",
    tagsEn: ["scale", "motion", "QC"],
    tagsZh: ["尺度", "动态", "质检"],
  },
  {
    id: "03",
    en: "AI Product Demo Lab",
    zh: "AI 产品 Demo 实验室",
    roleEn: "product storytelling / demo design",
    roleZh: "产品叙事 / Demo 设计",
    detailEn: "Product hooks, creator scripts, prototype surfaces, and audience-readable demos.",
    detailZh: "产品钩子、创意脚本、原型界面和受众能看懂的 Demo。",
    image: "/portfolio-assets/miao-work-03-blue-city.webp",
    tagsEn: ["product", "demo", "content"],
    tagsZh: ["产品", "Demo", "内容"],
  },
  {
    id: "04",
    en: "Character System Tests",
    zh: "人物系统测试",
    roleEn: "style continuity / character review",
    roleZh: "风格延续 / 人物审片",
    detailEn: "Character consistency, costume logic, mood, and image-system control.",
    detailZh: "人物一致性、服装逻辑、情绪和图像系统控制。",
    image: "/portfolio-assets/miao-work-04-desert-mirrors.webp",
    tagsEn: ["character", "style", "control"],
    tagsZh: ["人物", "风格", "控制"],
  },
  {
    id: "05",
    en: "Original AI Worlds",
    zh: "原创 AI 世界观",
    roleEn: "worldbuilding / visual direction",
    roleZh: "世界观 / 视觉导演",
    detailEn: "Character systems, surreal scenes, horror texture, and cinematic mood boards.",
    detailZh: "人物系统、超现实场景、恐怖质感和电影化 moodboard。",
    image: "/portfolio-assets/miao-work-05-fairy-study.webp",
    tagsEn: ["world", "mood", "cinema"],
    tagsZh: ["世界", "情绪", "电影感"],
  },
  {
    id: "06",
    en: "Horror Texture Studies",
    zh: "恐怖质感实验",
    roleEn: "genre control / texture review",
    roleZh: "类型控制 / 质感审核",
    detailEn: "Atmosphere, material texture, tension, and generated-image boundary testing.",
    detailZh: "氛围、材质、张力和生成图像边界测试。",
    image: "/portfolio-assets/miao-work-06-flower-portrait.webp",
    tagsEn: ["genre", "texture", "boundary"],
    tagsZh: ["类型", "质感", "边界"],
  },
];

const productModules = [
  {
    id: "input",
    code: "01",
    en: "Brief to Mood",
    zh: "Brief 到情绪",
    stateEn: "creator intent",
    stateZh: "创作者意图",
    detailEn: "A product surface for turning rough ideas into visual mood, audience, and story direction.",
    detailZh: "把粗糙想法转成视觉情绪、受众和叙事方向的产品界面。",
    metricsEn: ["intent", "mood", "audience"],
    metricsZh: ["意图", "情绪", "受众"],
  },
  {
    id: "route",
    code: "02",
    en: "Reference Mixer",
    zh: "参考混合器",
    stateEn: "style route",
    stateZh: "风格路线",
    detailEn: "A way to compare references, extract taste signals, and make a repeatable style route.",
    detailZh: "比较参考、提取审美信号，并形成可复用风格路线。",
    metricsEn: ["reference", "taste", "route"],
    metricsZh: ["参考", "审美", "路线"],
  },
  {
    id: "review",
    code: "03",
    en: "Shot Review",
    zh: "镜头审片",
    stateEn: "visual judgment",
    stateZh: "视觉判断",
    detailEn: "A review layer for composition, continuity, mood, and whether the output still feels intentional.",
    detailZh: "用来判断构图、连续性、情绪，以及生成结果是否仍然有作者感。",
    metricsEn: ["frame", "mood", "intent"],
    metricsZh: ["构图", "情绪", "作者感"],
  },
  {
    id: "ship",
    code: "04",
    en: "Demo Room",
    zh: "Demo 房间",
    stateEn: "public preview",
    stateZh: "公开预览",
    detailEn: "A future page for playable demos, case notes, and product experiments when they are ready to show.",
    detailZh: "后续用于放可玩的 Demo、案例笔记和成熟产品实验的页面。",
    metricsEn: ["demo", "case", "preview"],
    metricsZh: ["Demo", "案例", "预览"],
  },
];

const heroModules = [
  {
    id: "product",
    href: "#product",
    code: "02",
    en: "Product",
    zh: "产品",
    lineEn: "Creator-facing AI product experiments.",
    lineZh: "面向创作者的 AI 产品实验。",
    metaEn: "mood / route / demo",
    metaZh: "情绪 / 路线 / Demo",
  },
  {
    id: "works",
    href: "#works",
    code: "04",
    en: "Work",
    zh: "作品",
    lineEn: "Public visuals, interaction experiments, product demos.",
    lineZh: "公开视觉、交互实验、产品 Demo。",
    metaEn: "evidence archive",
    metaZh: "证据档案",
  },
  {
    id: "method",
    href: "#method",
    code: "05",
    en: "Method",
    zh: "方法",
    lineEn: "From brief to visual system to interactive prototype.",
    lineZh: "从 brief 到视觉系统，再到交互原型。",
    metaEn: "observe / generate / ship",
    metaZh: "观察 / 生成 / 交付",
  },
];

const tasteSignals = [
  {
    code: "IMAGE",
    en: "Framing, light, atmosphere, and continuity become the first layer of proof.",
    zh: "构图、光线、氛围和连续性，是第一层证据。",
    metricEn: "visual taste",
    metricZh: "审美判断",
  },
  {
    code: "SYSTEM",
    en: "A reference can become a reusable style route, not a one-off prompt.",
    zh: "参考可以被整理成可复用的风格路线，而不是一次性提示词。",
    metricEn: "repeatable route",
    metricZh: "可复用路线",
  },
  {
    code: "PRODUCT",
    en: "AI tools are translated into demos, decisions, and product-facing surfaces.",
    zh: "AI 工具会被翻译成 Demo、决策和面向产品的界面。",
    metricEn: "demo thinking",
    metricZh: "Demo 思维",
  },
  {
    code: "PROFILE",
    en: "The resume stays available as context, while this page carries the first visual argument.",
    zh: "简历保留为事实背景，网页负责先完成审美论证。",
    metricEn: "resume layer",
    metricZh: "简历层",
  },
];

const tasteChecks = [
  { en: "composition", zh: "构图", value: "frame" },
  { en: "continuity", zh: "连续性", value: "style" },
  { en: "mood", zh: "情绪", value: "tone" },
  { en: "rhythm", zh: "节奏", value: "motion" },
  { en: "clarity", zh: "清晰度", value: "product" },
  { en: "finish", zh: "完成度", value: "ship" },
];

const methodCards = [
  {
    step: "Observe",
    en: "Read the brief, audience, reference, platform, and delivery constraint.",
    zh: "读取 brief、受众、参考、平台和交付限制。",
  },
  {
    step: "Script",
    en: "Turn intent into scripts, shot logic, product hooks, and demo routes.",
    zh: "把意图拆成脚本、镜头逻辑、产品钩子和 Demo 路线。",
  },
  {
    step: "Generate",
    en: "Route prompts through AI video, image, music, and coding workflows.",
    zh: "把提示词接入 AI 视频、图像、音乐和 Vibe Coding 工作流。",
  },
  {
    step: "Review",
    en: "Review output by composition, continuity, mood, interaction clarity, and finish.",
    zh: "按构图、连续性、情绪、交互清晰度和完成度审核输出。",
  },
  {
    step: "Ship",
    en: "Package public assets, product demos, docs, and review loops for delivery.",
    zh: "把公开资产、产品 Demo、文档和复盘闭环打包交付。",
  },
];

const credentials = [
  { en: "AIGC visual direction", zh: "AIGC 视觉编导" },
  { en: "AI product demo thinking", zh: "AI 产品 Demo 思维" },
  { en: "Digital media and IT background", zh: "数字媒体与 IT 背景" },
  { en: "Bilingual creator context", zh: "中英双语创作者语境" },
];

const proofPoints = [
  { en: "Public visual archive", zh: "公开视觉档案" },
  { en: "AI product demo slot", zh: "AI 产品 Demo 接口" },
  { en: "AIGC direction system", zh: "AIGC 编导系统" },
  { en: "Bilingual portfolio", zh: "中英双语作品集" },
];

const kineticTracks = [
  { en: "VISUAL FIRST", zh: "视觉先行" },
  { en: "PRODUCT CLEAR", zh: "产品清晰" },
  { en: "AI NATIVE", zh: "AI 原生" },
  { en: "SHIP READY", zh: "可交付" },
];

const socialLinks = [
  {
    label: "RED",
    title: "小红书",
    href: "https://www.xiaohongshu.com/user/profile/5c763b1400000000110025a5?xsec_token=ABV74KWZqsFzFWnwl0F9hOc-rK09lpSpW6rfsrhtlXlVs=&xsec_source=pc_note&xsec_source=pc_creatormng&exSource=https://www.xiaohongshu.com/explore/69f311e2000000003601bad0?xsec_token=YBeuuhV_Yh9SV4WZCPh6pXrwPgr05JBWXMnRGyQcnr0Ww=",
    meta: "558914663",
  },
  {
    label: "DY",
    title: "抖音",
    href: "https://www.douyin.com/user/MS4wLjABAAAArFcWQmjcRE_QhkwA1-d0N-QP0q7g4-Z34VP81GiN6bA?from_tab_name=main&vid=7611408300873239844",
    meta: "1192419007",
  },
  {
    label: "BILI",
    title: "B站",
    href: "https://space.bilibili.com/31520441?spm_id_from=333.1007.0.0",
    meta: "UID 31520441",
  },
  {
    label: "X",
    title: "X",
    href: "https://x.com/GuoGarvena",
    meta: "@GuoGarvena",
  },
];

export function PortfolioEditionsPrototype() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeProductModule, setActiveProductModule] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const activeChapter = chapters[activeIndex] ?? chapters[0];
  const c = copy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";
  }, [locale]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = reduceMotion
      ? null
      : new Lenis({
          lerp: 0.08,
          smoothWheel: true,
          wheelMultiplier: 0.92,
        });

    const lenisRaf = (time: number) => {
      lenis?.raf(time * 1000);
    };

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);
    }

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 900);

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");

      sections.forEach((section, index) => {
        const sceneIndex = Number.parseInt(section.dataset.sceneIndex ?? String(index), 10);
        const nextIndex = Number.isFinite(sceneIndex) ? Math.min(chapters.length - 1, Math.max(0, sceneIndex)) : 0;
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => setActiveIndex(nextIndex),
          onEnterBack: () => setActiveIndex(nextIndex),
        });

        gsap.fromTo(
          section.querySelectorAll("[data-reveal]"),
          { autoAlpha: 0, y: 46, filter: "blur(16px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 68%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.to(".artifact-core", {
        rotateY: 18,
        rotateX: -8,
        y: -28,
        ease: "none",
        scrollTrigger: {
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.8,
        },
      });

      if (!reduceMotion) {
        const channels = gsap.utils.toArray<HTMLElement>("[data-evidence-channel]");

        channels.forEach((channel) => {
          if (window.matchMedia("(max-width: 820px)").matches) return;

          const track = channel.querySelector<HTMLElement>("[data-evidence-track]");
          if (!track) return;

          const getDistance = () => Math.max(0, track.scrollWidth - channel.clientWidth);

          gsap.to(track, {
            x: () => -getDistance(),
            ease: "none",
            scrollTrigger: {
              trigger: channel,
              start: "top top",
              end: () => `+=${getDistance() + window.innerHeight * 0.42}`,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          gsap.utils.toArray<HTMLElement>("[data-evidence-card]", channel).forEach((card, cardIndex) => {
            gsap.fromTo(
              card,
              { y: cardIndex % 2 === 0 ? 34 : 82, rotateY: cardIndex % 2 === 0 ? -7 : 7, autoAlpha: 0.54 },
              {
                y: 0,
                rotateY: 0,
                autoAlpha: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: channel,
                  start: "top top",
                  end: () => `+=${getDistance() + window.innerHeight * 0.42}`,
                  scrub: 1,
                },
              },
            );
          });
        });
      }
    }, rootRef);

    return () => {
      window.clearTimeout(refreshTimer);
      ctx.revert();
      if (lenis) {
        gsap.ticker.remove(lenisRaf);
        lenis.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const pointer = new THREE.Vector2(0.5, 0.5);
    const targetScene = { value: 0 };

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: pointer },
        uScene: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;

        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec2 uPointer;
        uniform float uScene;
        varying vec2 vUv;

        float random(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float noise(vec2 st) {
          vec2 i = floor(st);
          vec2 f = fract(st);
          float a = random(i);
          float b = random(i + vec2(1.0, 0.0));
          float c = random(i + vec2(0.0, 1.0));
          float d = random(i + vec2(1.0, 1.0));
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
        }

        float lineField(vec2 p, float angle, float offset) {
          vec2 q = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p;
          return smoothstep(0.018, 0.0, abs(sin(q.x * 11.0 + offset)) * 0.04);
        }

        void main() {
          vec2 uv = vUv;
          vec2 p = (uv - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
          vec2 mouse = (uPointer - 0.5) * vec2(uResolution.x / uResolution.y, 1.0);
          float t = uTime * 0.12;
          float sceneMix = uScene / 5.0;

          float radial = 1.0 - smoothstep(0.05, 1.05, length(p - mouse * 0.28));
          float fog = noise(p * 3.2 + vec2(t, -t * 0.8));
          float grain = random(uv * uResolution + uTime);
          float lines = lineField(p, -0.55 + sceneMix * 0.45, t * 2.0);

          vec3 graphite = vec3(0.015, 0.016, 0.015);
          vec3 chrome = vec3(0.72, 0.78, 0.75);
          vec3 ivory = vec3(0.93, 0.89, 0.78);
          vec3 acid = vec3(0.70, 1.0, 0.13);
          vec3 ember = vec3(0.95, 0.23, 0.12);
          vec3 teal = vec3(0.08, 0.42, 0.44);

          vec3 accent = mix(acid, ember, smoothstep(0.25, 0.85, sceneMix));
          accent = mix(accent, teal, smoothstep(0.55, 1.0, sceneMix) * 0.35);

          vec3 color = graphite;
          color += chrome * pow(max(0.0, 1.0 - length(p * vec2(1.2, 0.72))), 3.0) * 0.18;
          color += ivory * fog * 0.045;
          color += accent * radial * (0.22 + sceneMix * 0.1);
          color += accent * lines * 0.13;
          color += vec3(grain) * 0.035;

          float vignette = smoothstep(1.25, 0.15, length(p));
          color *= 0.66 + vignette * 0.5;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height, false);
      material.uniforms.uResolution.value.set(width, height);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
    };

    const onSceneChange = () => {
      const raw = rootRef.current?.style.getPropertyValue("--scene-index");
      const next = raw ? Number.parseFloat(raw) : 0;
      if (Number.isFinite(next)) targetScene.value = next;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    let raf = 0;
    const startTime = performance.now();
    const render = () => {
      material.uniforms.uTime.value = (performance.now() - startTime) / 1000;
      material.uniforms.uScene.value = THREE.MathUtils.lerp(
        material.uniforms.uScene.value,
        targetScene.value,
        reduceMotion ? 0.2 : 0.055,
      );
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(render);
    };
    render();

    const observer = new MutationObserver(onSceneChange);
    if (rootRef.current) observer.observe(rootRef.current, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    rootRef.current?.style.setProperty("--scene-index", String(activeIndex));
  }, [activeIndex]);

  useEffect(() => {
    if (activeChapter.id !== "product") return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const timer = window.setInterval(() => {
      setActiveProductModule((current) => (current + 1) % productModules.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [activeChapter.id]);

  const progress = useMemo(() => `${((activeIndex + 1) / chapters.length) * 100}%`, [activeIndex]);

  return (
    <main ref={rootRef} className="portfolio-shell" data-locale={locale} data-active={activeChapter.id}>
      <canvas ref={canvasRef} className="webgl-stage" aria-hidden="true" />
      <div className="stage-fade" aria-hidden="true" />

      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label={c.brand}>
          <span className="brand-mark">AI</span>
          <span>
            <strong>{c.brand}</strong>
            <small>{c.role}</small>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#works">{c.nav[0]}</a>
          <a href="#product">{c.nav[1]}</a>
          <a href="#method">{c.nav[2]}</a>
          <a href="#contact">{c.nav[3]}</a>
        </nav>
        <button
          className="language-switch"
          type="button"
          aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
          onClick={() => setLocale((current) => (current === "zh" ? "en" : "zh"))}
        >
          {c.lang}
        </button>
      </header>

      <aside className="chapter-rail" aria-label={c.index}>
        <b>{c.index}</b>
        {chapters.map((chapter, index) => (
          <a href={`#${chapter.id}`} className={index === activeIndex ? "active" : ""} key={chapter.id}>
            <span>{chapter.code}</span>
            <strong>{chapter.nav[locale]}</strong>
          </a>
        ))}
        <i style={{ height: progress }} aria-hidden="true" />
      </aside>

      <SocialDock />

      <section id="top" className="hero-scene" data-chapter data-scene-index="0">
        <div className="hero-copy">
          <p data-reveal>{c.role}</p>
          <h1 data-reveal>{c.heroTitle}</h1>
          <div className="hero-bottom" data-reveal>
            <p>{c.heroBody}</p>
            <div className="hero-actions">
              <a href="#works">{c.primary}</a>
              <a href="#direction">{c.secondary}</a>
            </div>
          </div>
          <div className="proof-strip" data-reveal>
            {proofPoints.map((point) => (
              <span key={point.en}>{point[locale]}</span>
            ))}
          </div>
        </div>

        <div className="artifact-wrap" aria-label={c.stage}>
          <div className="artifact-core">
            <div className="artifact-ring" />
            <div className="artifact-glass">
              <span>{c.stage}</span>
              <strong>{activeChapter.signal}</strong>
              <small>{activeChapter.nav[locale]}</small>
            </div>
            <div className="artifact-orbit orbit-a" />
            <div className="artifact-orbit orbit-b" />
          </div>
        </div>

        <div className="hero-system-deck" data-reveal>
          {heroModules.map((module) => (
            <a className={`hero-module-card hero-module-${module.id}`} href={module.href} key={module.id}>
              <span>{module.code}</span>
              <strong>{locale === "zh" ? module.zh : module.en}</strong>
              <p>{locale === "zh" ? module.lineZh : module.lineEn}</p>
              <small>{locale === "zh" ? module.metaZh : module.metaEn}</small>
              <i aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>

      <section className="kinetic-manifesto" aria-label={locale === "zh" ? "作品集视觉宣言" : "Portfolio manifesto"}>
        <div className="manifesto-core">
          {kineticTracks.map((track, index) => (
            <div className="manifesto-track" data-direction={index % 2 === 0 ? "left" : "right"} key={track.en}>
              <span>{locale === "zh" ? track.zh : track.en}</span>
              <span>{locale === "zh" ? track.zh : track.en}</span>
              <span>{locale === "zh" ? track.zh : track.en}</span>
            </div>
          ))}
        </div>
      </section>

      {chapters.map((chapter, index) =>
        chapter.id === "works" ? (
          <section
            id={chapter.id}
            className="chapter-scene works-scene works-portal-scene"
            data-chapter
            data-scene-index={index}
            key={chapter.id}
          >
            <WorkTimeChannel locale={locale} />
          </section>
        ) : (
          <section
            id={chapter.id}
            className={`chapter-scene ${chapter.id === "product" ? "product-scene" : ""}`}
            data-chapter
            data-scene-index={index}
            key={chapter.id}
          >
            <div className="chapter-kicker" data-reveal>
              <span>{chapter.code}</span>
              <b>{chapter.nav[locale]}</b>
            </div>
            <article data-reveal>
              <h2>{chapter.title[locale]}</h2>
              <p className="chapter-line">{chapter.line[locale]}</p>
              <p>{chapter.body[locale]}</p>
            </article>
            <ScenePanel
              locale={locale}
              chapter={chapter}
              index={index}
              activeProductModule={activeProductModule}
              onProductModuleChange={setActiveProductModule}
            />
          </section>
        ),
      )}
    </main>
  );
}

function ScenePanel({
  locale,
  chapter,
  index,
  activeProductModule,
  onProductModuleChange,
}: {
  locale: Locale;
  chapter: Chapter;
  index: number;
  activeProductModule: number;
  onProductModuleChange: (index: number) => void;
}) {
  if (chapter.id === "direction") {
    return (
      <div className="scene-panel evidence-ledger" data-reveal>
        <span>{locale === "zh" ? "审美证据引擎" : "Visual evidence engine"}</span>
        <strong>{locale === "zh" ? "先让网页证明审美，再让简历补充事实。" : "The page proves taste first. The resume adds context."}</strong>
        <div className="ledger-rows">
          {tasteSignals.map((item) => (
            <div className="ledger-row" key={item.code}>
              <i>{item.code}</i>
              <p>{locale === "zh" ? item.zh : item.en}</p>
              <b>{locale === "zh" ? item.metricZh : item.metricEn}</b>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (chapter.id === "product") {
    const activeModule = productModules[activeProductModule] ?? productModules[0];
    const activeMetrics = locale === "zh" ? activeModule.metricsZh : activeModule.metricsEn;

    return (
      <div className="scene-panel product-panel product-console" data-reveal>
        <div className="product-console-head">
          <span>{copy[locale].productSubtitle}</span>
          <b>{locale === "zh" ? "正在运行" : "running"}</b>
        </div>
        <strong>{copy[locale].productTitle}</strong>
        <code>{locale === "zh" ? "私密原型 / 后续公开 Demo" : "private prototype / public demo later"}</code>

        <div className="product-module-grid" role="tablist" aria-label={copy[locale].productTitle}>
          {productModules.map((module, moduleIndex) => (
            <button
              type="button"
              className={moduleIndex === activeProductModule ? "active" : ""}
              key={module.id}
              role="tab"
              aria-selected={moduleIndex === activeProductModule}
              onClick={() => onProductModuleChange(moduleIndex)}
              onMouseEnter={() => onProductModuleChange(moduleIndex)}
            >
              <span>{module.code}</span>
              <strong>{locale === "zh" ? module.zh : module.en}</strong>
              <small>{locale === "zh" ? module.stateZh : module.stateEn}</small>
            </button>
          ))}
        </div>

        <div className="product-runtime" role="tabpanel">
          <span>{locale === "zh" ? activeModule.zh : activeModule.en}</span>
          <p>{locale === "zh" ? activeModule.detailZh : activeModule.detailEn}</p>
          <div>
            {activeMetrics.map((metric) => (
              <b key={metric}>{metric}</b>
            ))}
          </div>
        </div>

        <div className="product-livebar" aria-hidden="true">
          <i style={{ width: `${((activeProductModule + 1) / productModules.length) * 100}%` }} />
        </div>
        <p>{copy[locale].productHint}</p>
      </div>
    );
  }

  if (chapter.id === "judgment") {
    return (
      <div className="scene-panel evaluation-panel" data-reveal>
        <span>{locale === "zh" ? "审美协议" : "Taste protocol"}</span>
        <strong>{chapter.signal}</strong>
        <div className="evaluation-grid">
          {tasteChecks.map((check) => (
            <div className="evaluation-cell" key={check.value}>
              <b>{check.value}</b>
              <span>{locale === "zh" ? check.zh : check.en}</span>
            </div>
          ))}
        </div>
        <p>
          {locale === "zh"
            ? "把抽象的好看，拆成可以讨论、可以调整、可以交付的视觉标准。"
            : "Turns abstract taste into visual criteria that can be discussed, adjusted, and shipped."}
        </p>
      </div>
    );
  }

  if (chapter.id === "works") {
    return <WorkTimeChannel locale={locale} />;
  }

  if (chapter.id === "method") {
    return (
      <div className="scene-panel method-panel method-runway" data-reveal>
        <span>{copy[locale].methodTitle}</span>
        <div className="method-track">
          {methodCards.map((item, stepIndex) => (
            <b key={item.step}>
              <i>{String(stepIndex + 1).padStart(2, "0")}</i>
              <strong>{locale === "zh" ? translateMethod(item.step) : item.step}</strong>
              <small>{locale === "zh" ? item.zh : item.en}</small>
            </b>
          ))}
        </div>
      </div>
    );
  }

  if (chapter.id === "contact") {
    return (
      <div className="scene-panel contact-panel" data-reveal>
        <span>{copy[locale].contactTitle}</span>
        <strong>{chapter.signal}</strong>
        <p>{copy[locale].contactBody}</p>
        <div className="credential-grid">
          {credentials.map((item) => (
            <b key={item.en}>{locale === "zh" ? item.zh : item.en}</b>
          ))}
        </div>
        <a href="mailto:Guokabunn@gmail.com">Guokabunn@gmail.com</a>
      </div>
    );
  }

  return (
    <div className="scene-panel signal-panel" data-reveal>
      <span>{String(index + 1).padStart(2, "0")}</span>
      <strong>{chapter.signal}</strong>
      <div>
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}

function WorkTimeChannel({ locale }: { locale: Locale }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const channelControlRef = useRef<null | ((index: number) => void)>(null);
  const portalTimerRef = useRef<number | null>(null);
  const [activeWorkIndex, setActiveWorkIndex] = useState(0);
  const [portalArmed, setPortalArmed] = useState(false);
  const activeWork = works[activeWorkIndex] ?? works[0];
  const tags = locale === "zh" ? activeWork.tagsZh : activeWork.tagsEn;
  const eyeParticles = useMemo(() => Array.from({ length: 18 }, (_, index) => index), []);
  const eyePortalStyle = {
    "--eye-dx": "0px",
    "--eye-dy": "0px",
  } as CSSProperties;

  useEffect(() => {
    return () => {
      if (portalTimerRef.current) window.clearTimeout(portalTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    if (root.closest(".works-portal-scene")) return;

    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050604, 0.075);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0.15, 8.2);

    const tunnel = new THREE.Group();
    scene.add(tunnel);

    const textureLoader = new THREE.TextureLoader();
    const plateGeometry = new THREE.PlaneGeometry(3.05, 4.12, 12, 12);
    const frameGeometry = new THREE.PlaneGeometry(3.32, 4.42, 1, 1);
    const railGeometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-3.8, -2.5, -1.2),
      new THREE.Vector3(-2.2, -1.7, -4.2),
      new THREE.Vector3(-0.2, -0.7, -7.3),
      new THREE.Vector3(2.6, 0.3, -10.8),
      new THREE.Vector3(4.1, 1.1, -13.5),
    ]);
    const railMaterial = new THREE.LineBasicMaterial({
      color: 0xb7ff25,
      transparent: true,
      opacity: 0.24,
    });
    const rail = new THREE.Line(railGeometry, railMaterial);
    scene.add(rail);

    const nodes = works.map((work, index) => {
      const group = new THREE.Group();
      group.userData.phase = index * 1.21;

      const frameMaterial = new THREE.MeshBasicMaterial({
        color: index % 2 === 0 ? 0xb7ff25 : 0xf1dfbb,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const frame = new THREE.Mesh(frameGeometry, frameMaterial);
      frame.position.z = -0.04;
      group.add(frame);

      const material = new THREE.MeshBasicMaterial({
        color: 0x2a2c23,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide,
      });
      const plate = new THREE.Mesh(plateGeometry, material);
      group.add(plate);

      textureLoader.load(
        work.image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          material.color.set(0xffffff);
          material.map = texture;
          material.needsUpdate = true;
          root.classList.add("channel-ready");
        },
        undefined,
        () => {
          material.color.set(0x222418);
          material.needsUpdate = true;
        },
      );

      tunnel.add(group);
      return { frameMaterial, group, material };
    });

    const motion = {
      progress: 0,
      target: 0,
      pointerX: 0,
      pointerY: 0,
      smoothX: 0,
      smoothY: 0,
    };
    let activeRef = 0;
    let animationFrame = 0;

    const setActive = (index: number) => {
      if (activeRef === index) return;
      activeRef = index;
      setActiveWorkIndex(index);
    };

    channelControlRef.current = (index: number) => {
      const next = THREE.MathUtils.clamp(index, 0, works.length - 1);
      motion.target = works.length > 1 ? next / (works.length - 1) : 0;
      setActive(next);
    };

    const resize = () => {
      const box = root.querySelector<HTMLElement>(".time-channel-stage");
      const width = Math.max(320, box?.clientWidth ?? root.clientWidth);
      const height = Math.max(420, box?.clientHeight ?? 560);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      motion.pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      motion.pointerY = -(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };

    const scrollTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top 72%",
      end: "bottom 28%",
      scrub: reduceMotion ? false : 0.7,
      onUpdate: (self) => {
        motion.target = self.progress;
        setActive(Math.round(self.progress * (works.length - 1)));
      },
    });

    const clock = new THREE.Clock();
    const render = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.elapsedTime;
      const targetEase = reduceMotion ? 0.22 : 0.08;
      motion.progress = THREE.MathUtils.lerp(motion.progress, motion.target, targetEase);
      motion.smoothX = THREE.MathUtils.lerp(motion.smoothX, motion.pointerX, delta * 2.2);
      motion.smoothY = THREE.MathUtils.lerp(motion.smoothY, motion.pointerY, delta * 2.2);

      const travel = motion.progress * (works.length - 1);
      const cameraZ = 8.2 + Math.sin(elapsed * 0.32) * 0.1;
      camera.position.set(motion.smoothX * 0.42, 0.18 + motion.smoothY * 0.18, cameraZ);
      camera.lookAt(motion.smoothX * 0.18, motion.smoothY * 0.08, -4.2);

      nodes.forEach((node, index) => {
        const rel = index - travel;
        const depth = Math.abs(rel);
        const focus = THREE.MathUtils.clamp(1 - depth * 0.52, 0, 1);
        const phase = node.group.userData.phase as number;

        node.group.position.set(
          rel * 1.65 + Math.sin(index * 1.4) * 0.24,
          Math.sin(index * 0.82 + elapsed * 0.16) * 0.34 - depth * 0.05,
          -0.82 - depth * 2.45 - Math.max(0, rel) * 0.35,
        );
        node.group.rotation.set(
          motion.smoothY * 0.055 + Math.sin(elapsed * 0.42 + phase) * 0.018,
          -rel * 0.16 + motion.smoothX * 0.075,
          Math.sin(elapsed * 0.25 + phase) * 0.016,
        );
        const scale = 0.7 + focus * 0.34;
        node.group.scale.setScalar(scale);
        node.material.opacity = 0.26 + focus * 0.74;
        node.frameMaterial.opacity = 0.08 + focus * 0.48;
      });

      rail.rotation.y = -0.08 + motion.smoothX * 0.04;
      rail.rotation.x = motion.smoothY * 0.02;
      railMaterial.opacity = 0.15 + Math.sin(elapsed * 0.7) * 0.035;

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    root.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);
    render();

    return () => {
      channelControlRef.current = null;
      scrollTrigger.kill();
      window.cancelAnimationFrame(animationFrame);
      root.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
      plateGeometry.dispose();
      frameGeometry.dispose();
      railGeometry.dispose();
      railMaterial.dispose();
      nodes.forEach((node) => {
        node.material.map?.dispose();
        node.material.dispose();
        node.frameMaterial.dispose();
      });
      renderer.dispose();
    };
  }, []);

  const focusWork = (index: number) => {
    channelControlRef.current?.(index);
    setActiveWorkIndex(index);
  };

  const enterWork = (index: number) => {
    focusWork(index);
    window.location.assign("/photos");
  };

  const moveEyePortal = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty("--eye-dx", `${Math.max(-1, Math.min(1, x)) * 10}px`);
    event.currentTarget.style.setProperty("--eye-dy", `${Math.max(-1, Math.min(1, y)) * 7}px`);
  };

  const resetEyePortal = (event: ReactPointerEvent<HTMLButtonElement>) => {
    event.currentTarget.style.setProperty("--eye-dx", "0px");
    event.currentTarget.style.setProperty("--eye-dy", "0px");
    setPortalArmed(false);
  };

  const triggerEyePortal = () => {
    setPortalArmed(true);
    if (portalTimerRef.current) window.clearTimeout(portalTimerRef.current);
    portalTimerRef.current = window.setTimeout(() => {
      enterWork(activeWorkIndex);
    }, 320);
  };

  return (
    <div className="works-panel time-channel-panel" ref={rootRef} data-reveal>
      <div className="work-portal-entry">
        <strong aria-hidden="true">WORKS</strong>
        <div className="work-card-line" aria-label={locale === "zh" ? "精选作品入口" : "Selected work entry"}>
          {works.slice(0, 5).map((work, index) => (
            <button
              type="button"
              className={`work-entry-card ${index === activeWorkIndex ? "active" : ""}`}
              style={{ backgroundImage: `url(${work.image})` }}
              key={work.id}
              onClick={() => enterWork(index)}
              onMouseEnter={() => focusWork(index)}
            >
              <span>{work.id}</span>
              <b>{locale === "zh" ? work.zh : work.en}</b>
            </button>
          ))}
          <button
            type="button"
            className={`work-eye-portal ${portalArmed ? "is-entering" : ""}`}
            style={eyePortalStyle}
            onPointerMove={moveEyePortal}
            onPointerLeave={resetEyePortal}
            onPointerDown={() => setPortalArmed(true)}
            onClick={triggerEyePortal}
            aria-label={locale === "zh" ? "进入 AI 之眼作品频道" : "Enter AI Eye work channel"}
          >
            <span className="eye-label">{locale === "zh" ? "AI 之眼" : "AI EYE"}</span>
            <span className="eye-visual" aria-hidden="true">
              <span className="eye-matrix" />
              <span className="eye-shell" />
              <span className="eye-iris" />
              <span className="eye-pupil" />
              <span className="eye-particles">
                {eyeParticles.map((index) => (
                  <i
                    key={index}
                    style={{
                      "--particle-angle": `${index * 20}deg`,
                      "--particle-radius": `${18 + (index % 4) * 5}px`,
                      "--particle-delay": `${index * -0.16}s`,
                    } as CSSProperties}
                  />
                ))}
              </span>
            </span>
            <b>ENTER</b>
            <small>OPEN CHANNEL</small>
          </button>
        </div>
        <div className="work-portal-copy">
          <p>{locale === "zh" ? "进入 Miao 的公开作品频道" : "Enter Miao's public work channel"}</p>
          <small>{locale === "zh" ? "视觉世界 / 产品 Demo / 交互实验" : "visual worlds / product demos / interaction experiments"}</small>
          <button type="button" onClick={() => enterWork(activeWorkIndex)}>
            {locale === "zh" ? "打开频道" : "Open channel"}
          </button>
        </div>
      </div>

      <div className="time-channel-body">
        <div className="time-channel-copy" aria-live="polite">
          <i>{activeWork.id}</i>
          <strong>{locale === "zh" ? activeWork.zh : activeWork.en}</strong>
          <small>{locale === "zh" ? activeWork.roleZh : activeWork.roleEn}</small>
          <p>{locale === "zh" ? activeWork.detailZh : activeWork.detailEn}</p>
          <span>
            {tags.map((tag) => (
              <b key={tag}>{tag}</b>
            ))}
          </span>
          <a href={activeWork.image} target="_blank" rel="noreferrer">
            {locale === "zh" ? "打开原图" : "Open source image"}
          </a>
        </div>

        <div className="time-channel-stage" aria-label={locale === "zh" ? "3D 作品时间通道" : "3D work time channel"}>
          <canvas ref={canvasRef} className="time-channel-canvas" />
          <div className="time-channel-hud" aria-hidden="true">
            <span>THREE.JS / SCROLL DEPTH</span>
            <b>{String(activeWorkIndex + 1).padStart(2, "0")} / {String(works.length).padStart(2, "0")}</b>
          </div>
          <div className="time-channel-depth" aria-hidden="true">
            {works.map((work, index) => (
              <i key={work.id} className={index === activeWorkIndex ? "active" : ""} />
            ))}
          </div>
        </div>

        <div className="time-channel-index" aria-label={locale === "zh" ? "选择作品" : "Select work"}>
          {works.map((work, index) => (
            <button
              type="button"
              className={index === activeWorkIndex ? "active" : ""}
              key={work.id}
              onClick={() => focusWork(index)}
              onMouseEnter={() => focusWork(index)}
            >
              <span>{work.id}</span>
              <strong>{locale === "zh" ? work.zh : work.en}</strong>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SocialDock() {
  return (
    <aside className="social-dock" aria-label="Social profiles">
      {socialLinks.map((link) => (
        <a href={link.href} target="_blank" rel="noreferrer" key={link.label} title={`${link.title} ${link.meta}`}>
          <b>{link.label}</b>
          <span>{link.title}</span>
        </a>
      ))}
    </aside>
  );
}

function translateMethod(value: string) {
  const map: Record<string, string> = {
    Observe: "观察",
    Script: "编剧",
    Generate: "生成",
    Evaluate: "评估",
    Review: "审核",
    Ship: "交付",
  };
  return map[value] ?? value;
}
