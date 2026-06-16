"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import Image from "next/image";
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

const productId = "019e8c7e-2bc4-7f40-892d-72a6e03debb0";

const copy = {
  en: {
    brand: "Guo Jiawen / Miao",
    role: "AI product / AIGC direction / visual systems",
    nav: ["Work", "Product", "Method", "Contact"],
    lang: "中文",
    heroTitle: "Building systems that think, create, and evolve.",
    heroBody:
      "A bilingual portfolio for AI product and AIGC roles, built to show visual taste, product judgment, and dynamic systems thinking.",
    primary: "Enter work",
    secondary: "Product slot",
    index: "Chapters",
    stage: "Real-time portfolio system",
    productTitle: "Active product interface",
    productSubtitle: "Reserved runtime slot",
    productHint: "Future modules can mount here without flattening the portfolio into a gallery.",
    worksTitle: "Evidence channel",
    worksLead:
      "Public works move as a proof system: visual worlds, product-facing demos, interaction experiments, and generated image systems are sequenced by role fit.",
    methodTitle: "Operating rhythm",
    contactTitle: "Role argument",
    contactBody:
      "The site makes the role fit visible before the resume is opened: visual direction, product sense, AI-native workflow, and enough technical literacy to collaborate well.",
  },
  zh: {
    brand: "郭嘉雯 / Miao喵渺淼妙",
    role: "AI 产品 / AIGC 编导 / 视觉系统",
    nav: ["作品", "产品", "方法", "联系"],
    lang: "EN",
    heroTitle: "构建会思考、创作与进化的系统。",
    heroBody:
      "一个面向 AI 产品与 AIGC 岗位的双语作品集，用动态视觉展示审美、产品判断和系统思维。",
    primary: "进入作品",
    secondary: "产品接口",
    index: "章节",
    stage: "实时作品集系统",
    productTitle: "正在开发的产品接口",
    productSubtitle: "预留运行时槽位",
    productHint: "后续产品可以接入这里，而不是把作品集压成普通图片墙。",
    worksTitle: "作品证据通道",
    worksLead: "公开作品会作为证据系统移动：视觉世界、产品 Demo、交互实验和生成图像系统会按岗位能力被重新编排。",
    methodTitle: "工作节奏",
    contactTitle: "岗位论证",
    contactBody:
      "网站先让岗位匹配变得可见，再让简历补充事实：视觉导演、产品 sense、AI 原生工作流，以及能与技术团队协作的理解力。",
  },
} as const;

const chapters: Chapter[] = [
  {
    id: "direction",
    code: "I",
    nav: { en: "Direction OS", zh: "编导系统" },
    title: { en: "From creator instinct to production logic.", zh: "从创作者直觉到生产逻辑。" },
    line: { en: "AIGC direction is a system, not a prompt.", zh: "AIGC 编导不是写提示词，而是搭系统。" },
    body: {
      en: "I turn briefs, references, shot logic, prompt routes, review criteria, and delivery constraints into repeatable creative operations.",
      zh: "我把 brief、参考、镜头逻辑、提示词路线、审片标准和交付约束整理成可复用的创作流程。",
    },
    signal: "BRIEF / SCENE / ROUTE",
  },
  {
    id: "product",
    code: "II",
    nav: { en: "Product Slot", zh: "产品接口" },
    title: { en: "A product surface for creative AI decisions.", zh: "承载创意 AI 决策的产品界面。" },
    line: { en: "The current build keeps a live module open.", zh: "当前开发中的产品会在这里保留模块入口。" },
    body: {
      en: `Product ${productId} is reserved for runtime logs, routing states, review queues, and future AI modules.`,
      zh: `产品 ${productId} 会承载运行日志、路线状态、审核队列和后续 AI 模块。`,
    },
    signal: "STATE / ENDPOINT / QUEUE",
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
    title: { en: "Works become a cinematic evidence wall.", zh: "作品成为电影化证据墙。" },
    line: { en: "The archive should feel alive because the process is alive.", zh: "档案要有生命力，因为过程本身是动态的。" },
    body: {
      en: "The archive focuses on public visual worlds, interaction experiments, image systems, and product-facing demos that can be inspected directly.",
      zh: "档案只聚焦可公开、可检查的视觉世界、交互实验、图像系统和产品 Demo。",
    },
    signal: "CASE / METHOD / OUTCOME",
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
    nav: { en: "Fit", zh: "匹配" },
    title: { en: "A portfolio for the hybrid role.", zh: "为复合岗位而设计的作品集。" },
    line: { en: "Director taste, product sense, AI-native workflow.", zh: "编导审美、产品 sense、AI 原生工作流。" },
    body: {
      en: "Recruiters should understand the role fit before they finish the page. The details can then prove it.",
      zh: "面试官应该在读完页面前就理解岗位匹配，细节再继续证明。",
    },
    signal: "DIRECTION / PRODUCT / SYSTEM",
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
    image: "/portfolio-assets/work-05.png",
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
    image: "/portfolio-assets/work-03.jpg",
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
    image: "/portfolio-assets/work-01.png",
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
    image: "/portfolio-assets/work-02.png",
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
    image: "/portfolio-assets/work-04.png",
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
    image: "/portfolio-assets/work-06.png",
    tagsEn: ["genre", "texture", "boundary"],
    tagsZh: ["类型", "质感", "边界"],
  },
];

const productModules = [
  {
    id: "input",
    code: "01",
    en: "Input Schema",
    zh: "输入结构",
    stateEn: "brief normalized",
    stateZh: "Brief 已清洗",
    detailEn: "Turns briefs, audiences, constraints, and reference logic into a reusable product input.",
    detailZh: "把 brief、目标受众、限制条件和参考逻辑整理成可复用的产品输入。",
    metricsEn: ["schema", "audience", "constraints"],
    metricsZh: ["结构", "受众", "限制"],
  },
  {
    id: "route",
    code: "02",
    en: "Creative Route",
    zh: "创意路由",
    stateEn: "director intent mapped",
    stateZh: "导演意图已映射",
    detailEn: "Splits a creative goal into shot language, style route, prompt layers, and model choice.",
    detailZh: "把创意目标拆成镜头语言、风格路线、提示词层级和模型选择。",
    metricsEn: ["shots", "style", "model"],
    metricsZh: ["镜头", "风格", "模型"],
  },
  {
    id: "review",
    code: "03",
    en: "Output Review",
    zh: "输出审核",
    stateEn: "taste aligned",
    stateZh: "审美已对齐",
    detailEn: "Reviews visual consistency, product clarity, mood, and handoff fit before output ships.",
    detailZh: "在交付前审核视觉一致性、产品清晰度、情绪和交接适配度。",
    metricsEn: ["quality", "clarity", "handoff"],
    metricsZh: ["质量", "清晰", "交接"],
  },
  {
    id: "ship",
    code: "04",
    en: "Delivery Slot",
    zh: "交付接口",
    stateEn: "module ready",
    stateZh: "模块待接入",
    detailEn: "Keeps API slots, queues, runtime logs, and future agent modules ready for the next product layer.",
    detailZh: "为 API 槽位、队列、运行日志和后续 agent 模块保留接入位置。",
    metricsEn: ["API", "queue", "logs"],
    metricsZh: ["API", "队列", "日志"],
  },
];

const heroModules = [
  {
    id: "product",
    href: "#product",
    code: "02",
    en: "Product",
    zh: "产品",
    lineEn: "AI-native product interface and runtime slot.",
    lineZh: "AI 原生产品构想与运行时接口。",
    metaEn: "API / queue / review",
    metaZh: "接口 / 队列 / 审核",
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
              <a href="#product">{c.secondary}</a>
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

      {chapters.map((chapter, index) => (
        <section
          id={chapter.id}
          className={`chapter-scene ${chapter.id === "product" ? "product-scene" : ""} ${
            chapter.id === "works" ? "works-scene" : ""
          }`}
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
      ))}
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
        <code>{productId}</code>

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
    return (
      <div className="works-panel" data-evidence-channel data-reveal>
        <div className="works-panel-head">
          <span>{copy[locale].worksTitle}</span>
          <p>{copy[locale].worksLead}</p>
        </div>
        <div className="evidence-track" data-evidence-track>
        {works.map((work) => (
          <a
            href={work.image}
            className="evidence-card"
            data-evidence-card
            key={work.id}
            target="_blank"
            rel="noreferrer"
            aria-label={locale === "zh" ? work.zh : work.en}
          >
            <figure className="evidence-media">
              <Image
                src={work.image}
                alt={locale === "zh" ? work.zh : work.en}
                fill
                sizes="(max-width: 820px) 92vw, 42vw"
                priority={work.id === "01"}
              />
              <figcaption>{locale === "zh" ? work.roleZh : work.roleEn}</figcaption>
            </figure>
            <div className="evidence-copy">
              <i>{work.id}</i>
              <strong>{locale === "zh" ? work.zh : work.en}</strong>
              <small>{locale === "zh" ? work.detailZh : work.detailEn}</small>
              <span>
                {(locale === "zh" ? work.tagsZh : work.tagsEn).map((tag) => (
                  <b key={tag}>{tag}</b>
                ))}
              </span>
            </div>
          </a>
        ))}
        </div>
      </div>
    );
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
