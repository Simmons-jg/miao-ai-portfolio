"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import MusicParticles from "@/components/MusicParticles";
import { videoWorks } from "@/lib/videoCatalog";

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

const MAINFRAME_CAT_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_37vWe8zXxPK530lYMCDkCgkIHii/hf_20260621_223340_b9143502-d3b1-45ad-a1fb-a322c3300fff.mp4";

const MAINFRAME_CAT_POSTER = "/portfolio-assets/miao-ai-cat-entry.png";
const MAINFRAME_CAT_WECHAT_QR = "/portfolio-assets/wechat-kabunnchan-qr.png";
const WECHAT_ID = "kabunnchan";

const copy = {
  en: {
    brand: "Miao / Guo Jiawen",
    role: "AI creator / images / videos / music / product",
    nav: ["Home", "About", "Images", "Videos", "Music", "Product", "Contact"],
    lang: "中文",
    heroTitle: "MIAO\nAI CREATOR",
    heroBody:
      "Hello, this is Miao. I make AI images, moving stories, music, and strange little tools. Let's do some cool things :)",
    primary: "Enter images",
    secondary: "About",
    index: "Rooms",
    stage: "AI creator playground",
    productTitle: "I'M MAKING AN AI VIDEO TOOL",
    productSubtitle: "Script in. Video tasks out.",
    productHint: "It is not a gallery. It is the machine behind the gallery.",
    worksTitle: "Images",
    worksLead:
      "Some pictures made with AI, but judged by human taste.",
    methodTitle: "Music notes",
    contactTitle: "CONTACT ME",
    contactBody:
      "If you like strange images, AI videos, product demos, or cool interactive websites, we can talk.",
  },
  zh: {
    brand: "郭嘉雯 / Miao喵渺淼妙",
    role: "AI 创作者 / 图像 / 影视 / 音乐 / 产品",
    nav: ["主页", "关于", "图像", "影视", "音乐", "产品", "联系"],
    lang: "EN",
    heroTitle: "MIAO\nAI 创作者",
    heroBody:
      "你好，我是 Miao。我做 AI 图像、影视、音乐，也做一些奇奇怪怪的 AI 工具。一起做点酷东西 :)",
    primary: "进入图像",
    secondary: "关于",
    index: "房间",
    stage: "AI 创作者游乐场",
    productTitle: "我在做一台 AI 视频小机器",
    productSubtitle: "剧本进去，任务出来",
    productHint: "它不是作品墙，是作品墙背后的机器。",
    worksTitle: "图像",
    worksLead: "不是生成了就算作品。我更在意氛围、构图、人物感和世界观。",
    methodTitle: "音乐空间",
    contactTitle: "CONTACT ME",
    contactBody:
      "如果你喜欢奇怪的图像、AI 视频、产品 Demo，或者酷一点的互动网站，我们可以聊聊。",
  },
} as const;

const navLinks = [
  { href: "#top", en: "Home", zh: "主页" },
  { href: "#direction", en: "About", zh: "关于" },
  { href: "#judgment", en: "Videos", zh: "影视" },
  { href: "#works", en: "Images", zh: "图像" },
  { href: "#method", en: "Music", zh: "音乐" },
  { href: "#product", en: "Product", zh: "产品" },
  { href: "#contact", en: "Contact", zh: "联系" },
];

const chapters: Chapter[] = [
  {
    id: "direction",
    code: "01",
    nav: { en: "About", zh: "关于" },
    title: { en: "WHAT SKILLS DO I HAVE", zh: "我会做什么" },
    line: {
      en: "I turn AI images, video, product ideas, and music into things with taste, rhythm, and interaction.",
      zh: "我把 AI 图像、影视、产品想法和音乐，做成有审美、有节奏、能被点开的作品。",
    },
    body: {
      en: "Not just prompting. I care about mood, story, tool logic, and how a viewer enters the work.",
      zh: "不是只会写提示词。我更在意氛围、故事、工具逻辑，以及一个人怎么进入作品。",
    },
    signal: "VISUAL / VIDEO / MUSIC / TOOL",
  },
  {
    id: "product",
    code: "02",
    nav: { en: "Product", zh: "产品" },
    title: { en: "I am building an AI video machine.", zh: "我在做一台 AI 视频小机器。" },
    line: { en: "Script in. Style, characters, shots, covers and video tasks out.", zh: "剧本进去，人物、风格、分镜、封面和视频任务出来。" },
    body: {
      en: "It is not a gallery. It is the machine behind the gallery.",
      zh: "它不是作品墙，是作品墙背后的机器。",
    },
    signal: "SCRIPT / STYLE / SHOTS / TASKS",
  },
  {
    id: "judgment",
    code: "03",
    nav: { en: "Videos", zh: "影视" },
    title: { en: "VIDEOS", zh: "影视" },
    line: {
      en: "I like making interesting moving visuals.",
      zh: "我喜欢做一些有趣的动态画面。",
    },
    body: {
      en: "Some are music videos, some are experimental shorts, and some are just a mood I wanted to try. They are not always complete, but each one has its own rhythm.",
      zh: "有些是 MV，有些是实验短片，有些只是一个想试出来的气氛。不一定都很完整，但它们都有自己的节奏。",
    },
    signal: "MV / SHORTS / MOOD / RHYTHM",
  },
  {
    id: "works",
    code: "04",
    nav: { en: "Images", zh: "图像" },
    title: { en: "IMAGES", zh: "图像" },
    line: { en: "Some pictures made with AI, but judged by human taste.", zh: "不是生成了就算作品。" },
    body: {
      en: "I care more about atmosphere, composition, character presence, and worldbuilding.",
      zh: "我更在意氛围、构图、人物感和世界观。",
    },
    signal: "IMAGE / TASTE / WORLD",
  },
  {
    id: "method",
    code: "05",
    nav: { en: "Music", zh: "音乐" },
    title: { en: "MUSIC", zh: "音乐" },
    line: { en: "Complete music pieces, built as a way to explore diversity.", zh: "完整的音乐作品，也是我探索多样性的入口。" },
    body: {
      en: "I use melody, rhythm, texture, and emotion as different rooms. Each finished piece can open into many paths of style and feeling.",
      zh: "我用旋律、节奏、材质和情绪做不同的空间。每首作品都是完整的，也会延展出很多条风格和情绪路径。",
    },
    signal: "COMPLETE TRACKS / DIVERSITY / QUIET PLAY",
  },
  {
    id: "contact",
    code: "06",
    nav: { en: "Contact", zh: "联系" },
    title: { en: "CONTACT ME", zh: "CONTACT ME" },
    line: { en: "If you like strange images, AI videos, product demos, or cool interactive websites, we can talk.", zh: "如果你喜欢奇怪的图像、AI 视频、产品 Demo，或者酷一点的互动网站，我们可以聊聊。" },
    body: {
      en: "Email, X, Bilibili, Xiaohongshu, and Douyin are open for different kinds of conversation.",
      zh: "Email、X、B 站、小红书和抖音，都可以作为不同的入口。",
    },
    signal: "EMAIL / X / BILI / RED / DOUYIN",
  },
];

const refinedCopy = {
  en: {
    ...copy.en,
    brand: "MiaoMeowMew",
    resumeBrand: "Guo Jiawen",
    resumeRole: "AI creator / AI product & AIGC creation",
    siteTitle: "MiaoMeowMew / AI Creator Portfolio",
    role: "AI creator / images / film / music / product",
    lang: "中文",
    heroTitle: "Hello,\nthis is Miao",
    heroBody:
      "Hello, this is Miao, an AI creator. I make images, videos, music, and strange little tools with AI. Let's do some cool things :)",
    primary: "Enter images",
    secondary: "What I make",
    index: "Rooms",
    stage: "AI creator playground",
    productTitle: "I'M MAKING AN AI VIDEO TOOL",
    productSubtitle: "Script in. Style, characters, shots, covers and video tasks out.",
    productHint: "It is not a gallery. It is the machine behind the gallery.",
    worksTitle: "Images",
    worksLead: "Some pictures made with AI, but judged by human taste.",
    methodTitle: "MUSIC",
    contactTitle: "CONTACT ME",
    contactBody:
      "If you like strange images, AI videos, product demos, or cool interactive websites, we can talk.",
  },
  zh: {
    ...copy.zh,
    brand: "Miao喵渺淼妙",
    resumeBrand: "郭嘉雯",
    resumeRole: "AI 创作者 / AI 产品 / AIGC 创作方向",
    siteTitle: "Miao喵渺淼妙 / AI 创作者作品集",
    role: "AI 创作者 / 图像 / 影视 / 音乐 / 产品",
    lang: "EN",
    heroTitle: "你好，\n我是 Miao",
    heroBody:
      "你好，我是 Miao，一个用 AI 做视觉、视频和产品的人。我做图像、视频、音乐，也做一些奇奇怪怪的 AI 工具。一起做点酷东西 :)",
    primary: "进入图像",
    secondary: "我会做什么",
    index: "房间",
    stage: "AI 创作者游乐场",
    productTitle: "我在做一台 AI 视频机器",
    productSubtitle: "剧本进去，人物、风格、分镜、封面和视频任务出来。",
    productHint: "它不是作品墙。它是作品墙背后的机器。",
    worksTitle: "图像",
    worksLead: "不是生成了就算作品。我更在意氛围、构图、人物感和世界观。",
    methodTitle: "音乐",
    contactTitle: "CONTACT ME",
    contactBody:
      "如果你喜欢奇怪的图像、AI 视频、产品 Demo，或者酷一点的互动网站，我们可以聊聊。",
  },
} as const;

const refinedNavLabelsZh = ["主页", "关于", "影视", "图像", "音乐", "产品", "联系"];

const refinedNavLinks = navLinks.map((link, index) => ({
  ...link,
  zh: refinedNavLabelsZh[index] ?? link.zh,
}));

const refinedChapterText: Record<string, Partial<Chapter>> = {
  direction: {
    nav: { en: "About", zh: "关于" },
    title: { en: "WHAT SKILLS DO I HAVE", zh: "我会做什么" },
    line: {
      en: "A personal toolkit for images, videos, music, and AI products.",
      zh: "图像、影视、音乐和 AI 产品，是我现在最常用的创作工具箱。",
    },
    body: {
      en: "Not just prompting. I care about mood, story, tool logic, and how a viewer enters the work.",
      zh: "不是只会写提示词。我更在意氛围、故事、工具逻辑，以及一个人怎么进入作品。",
    },
    signal: "VISUAL FIRST / MAKE IT MOVE / TOOL AS PLAY",
  },
  product: {
    nav: { en: "Product", zh: "产品" },
    title: { en: "PRODUCT", zh: "产品" },
    line: {
      en: "I am building an AI video machine.",
      zh: "我在做一台 AI 视频机器。",
    },
    body: {
      en: "Script in. Style, characters, shots, covers and video tasks out. It is not a gallery. It is the machine behind the gallery.",
      zh: "剧本进去，人物、风格、分镜、封面和视频任务出来。它不是作品墙，它是作品墙背后的机器。",
    },
    signal: "SCRIPT / STYLE / SHOTS / TASKS",
  },
  judgment: {
    nav: { en: "Videos", zh: "影视" },
    title: { en: "VIDEOS", zh: "影视" },
    line: {
      en: "I like making interesting moving visuals.",
      zh: "我喜欢做一些有趣的动态画面。",
    },
    body: {
      en: "Some are music videos, some are experimental shorts, and some are just a mood I wanted to try. They are not always complete, but each one has its own rhythm.",
      zh: "有些是 MV，有些是实验短片，有些只是一个想试出来的气氛。不一定都很完整，但它们都有自己的节奏。",
    },
    signal: "MV / SHORTS / MOOD / RHYTHM",
  },
  works: {
    nav: { en: "Images", zh: "图像" },
    title: { en: "IMAGES", zh: "图像" },
    line: {
      en: "Some pictures made with AI, but judged by human taste.",
      zh: "不是生成了就算作品。",
    },
    body: {
      en: "I care more about atmosphere, composition, character presence, and worldbuilding.",
      zh: "我更在意氛围、构图、人物感和世界观。",
    },
    signal: "IMAGE / TASTE / WORLD",
  },
  method: {
    nav: { en: "Music", zh: "音乐" },
    title: { en: "MUSIC", zh: "音乐" },
    line: {
      en: "Complete music pieces, built as a way to explore diversity.",
      zh: "完整的音乐作品，也是我探索多样性的入口。",
    },
    body: {
      en: "I use melody, rhythm, texture, and emotion as different rooms. Each finished piece can open into many paths of style and feeling.",
      zh: "我用旋律、节奏、材质和情绪做不同的空间。每首作品都是完整的，也会延展出很多条风格和情绪路径。",
    },
    signal: "COMPLETE TRACKS / DIVERSITY / QUIET PLAY",
  },
  contact: {
    nav: { en: "Contact", zh: "联系" },
    title: { en: "CONTACT ME", zh: "CONTACT ME" },
    line: {
      en: "If you like strange images, AI videos, product demos, or cool interactive websites, we can talk.",
      zh: "如果你喜欢奇怪的图像、AI 视频、产品 Demo，或者酷一点的互动网站，我们可以聊聊。",
    },
    body: {
      en: "Email, X, Bilibili, Xiaohongshu, and Douyin are open for different kinds of conversation.",
      zh: "Email、X、B 站、小红书和抖音，都可以作为不同的入口。",
    },
    signal: "EMAIL / X / BILI / RED / DOUYIN",
  },
};

const chapterOrder = ["direction", "judgment", "works", "method", "product", "contact"];

const refinedChapters = chapterOrder.map((id, index) => {
  const chapter = chapters.find((item) => item.id === id);
  if (!chapter) {
    throw new Error(`Missing portfolio chapter: ${id}`);
  }

  return {
    ...chapter,
    ...(refinedChapterText[chapter.id] ?? {}),
    code: String(index + 1).padStart(2, "0"),
  };
}) as Chapter[];

const refinedTasteSignals = [
  {
    code: "01",
    en: "I'M A VIDEO STORYTELLER",
    zh: "爱做一些有节奏、有故事感的影像和片段",
    metricEn: "make it move",
    metricZh: "让它动起来",
  },
  {
    code: "02",
    en: "I'M AN AI VISUAL CREATOR",
    zh: "爱做一些有氛围的 AI 图像",
    metricEn: "visual first",
    metricZh: "视觉先行",
  },
  {
    code: "03",
    en: "I'M AN AI MUSIC MAKER",
    zh: "会用 AI 写一些有画面感的音乐",
    metricEn: "sound mood",
    metricZh: "声音情绪",
  },
  {
    code: "04",
    en: "I'M AN AI PRODUCT THINKER",
    zh: "爱把创作流程做成可以玩的工具",
    metricEn: "tools can play",
    metricZh: "工具也要好玩",
  },
];

const refinedKineticTracks = [
  { en: "VISUAL FIRST", zh: "视觉先行" },
  { en: "MAKE IT MOVE", zh: "让它动起来" },
  { en: "AI CAN BE WILD", zh: "AI 可以很野" },
  { en: "STORY BEFORE TOOL", zh: "故事先于工具" },
  { en: "NOT JUST PROMPTS", zh: "不只是提示词" },
  { en: "CREATE COOL THINGS", zh: "一起做点酷东西" },
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
    image: "/portfolio-assets/optimized/miao-work-01-silver-orchid.webp",
    kind: "person",
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
    image: "/portfolio-assets/optimized/miao-work-02-fairy-study-room.webp",
    kind: "scene",
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
    image: "/portfolio-assets/optimized/miao-work-03-blue-crown.webp",
    kind: "person",
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
    image: "/portfolio-assets/optimized/miao-work-04-ink-lotus.webp",
    kind: "person",
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
    image: "/portfolio-assets/optimized/miao-work-05-desert-stage.webp",
    kind: "scene",
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
    image: "/portfolio-assets/optimized/miao-work-06-flower-portrait.webp",
    kind: "person",
    tagsEn: ["genre", "texture", "boundary"],
    tagsZh: ["类型", "质感", "边界"],
  },
];

const productModules = [
  {
    id: "input",
    code: "01",
    en: "Script In",
    zh: "剧本进入",
    stateEn: "source material",
    stateZh: "原始材料",
    detailEn: "A rough script or idea becomes something the machine can read, split, and route.",
    detailZh: "粗糙的剧本或想法，会被拆成机器可以读取和分发的材料。",
    metricsEn: ["script", "intent", "route"],
    metricsZh: ["剧本", "意图", "路线"],
  },
  {
    id: "route",
    code: "02",
    en: "Style Route",
    zh: "风格路线",
    stateEn: "style route",
    stateZh: "风格路线",
    detailEn: "The tool keeps character, world, and visual style from drifting apart.",
    detailZh: "让人物、世界观和视觉风格不要在生成过程中散掉。",
    metricsEn: ["style", "world", "character"],
    metricsZh: ["风格", "世界", "人物"],
  },
  {
    id: "review",
    code: "03",
    en: "Shot Logic",
    zh: "分镜逻辑",
    stateEn: "moving image",
    stateZh: "动态影像",
    detailEn: "Characters, scenes, shots, and covers become a video task list instead of a pile of prompts.",
    detailZh: "人物、场景、分镜和封面会变成视频任务表，而不是一堆提示词。",
    metricsEn: ["shots", "covers", "tasks"],
    metricsZh: ["分镜", "封面", "任务"],
  },
  {
    id: "ship",
    code: "04",
    en: "Video Tasks Out",
    zh: "视频任务输出",
    stateEn: "machine output",
    stateZh: "机器输出",
    detailEn: "The output is a clear production route: what to make, what to check, and what to send next.",
    detailZh: "输出的是清楚的制作路线：做什么、检查什么、下一步发给谁。",
    metricsEn: ["make", "check", "send"],
    metricsZh: ["制作", "检查", "分发"],
  },
];

const productEntrances = [
  {
    code: "LIVE",
    en: "AI video machine",
    zh: "AI 影视机器",
    detailEn: "Open the production tool behind the image and video workflow.",
    detailZh: "进入图像和影视流程背后的真实产品。",
    href: "/product",
  },
  {
    code: "LAB",
    en: "Small experiments",
    zh: "小作品集合",
    detailEn: "Tiny tools, prototypes, and unfinished interaction ideas.",
    detailZh: "一些小工具、原型和还在生长的交互想法。",
    href: "/product#lab",
  },
  {
    code: "ROOM",
    en: "Creator channels",
    zh: "创作房间",
    detailEn: "Images, videos, music, and product demos stay in their own rooms.",
    detailZh: "图像、影视、音乐和产品 Demo 分开进入。",
    href: "/#works",
  },
];

const tasteChecks = [
  { en: "play", zh: "播放", value: "play" },
  { en: "cut", zh: "剪辑", value: "cut" },
  { en: "rhythm", zh: "节奏", value: "rhythm" },
  { en: "mood", zh: "情绪", value: "mood" },
  { en: "story", zh: "故事", value: "story" },
  { en: "screen", zh: "画面", value: "screen" },
];

const contactChannels = [
  {
    key: "email",
    label: "EMAIL",
    value: "Guokabunn@gmail.com",
    detailEn: "Send a brief, idea, or weird image question.",
    detailZh: "发项目想法、合作需求，或者奇怪图像问题。",
    href: "mailto:Guokabunn@gmail.com",
  },
  {
    key: "wechat",
    label: "WECHAT",
    value: WECHAT_ID,
    detailEn: "Scan the card, or search the WeChat ID.",
    detailZh: "扫猫卡二维码，或直接搜微信号。",
  },
  {
    key: "bili",
    label: "BILI",
    value: "UID 31520441",
    detailEn: "Video room and public experiments.",
    detailZh: "视频房间和公开实验。",
  },
  {
    key: "red",
    label: "RED",
    value: "Miao喵渺淼妙",
    detailEn: "Image notes and work-in-progress fragments.",
    detailZh: "图像笔记和一些正在生长的片段。",
  },
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

const MUSIC_SAMPLE_URL = "/audio/out-yo-head-music-box-edit.mp3";

type WebglRendererOptions = {
  alpha?: boolean;
  antialias?: boolean;
  powerPreference?: WebGLPowerPreference;
};

function canCreateWebglContext() {
  if (typeof window === "undefined" || !window.WebGLRenderingContext) return false;

  const testCanvas = document.createElement("canvas");
  const context =
    testCanvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
    testCanvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });

  if (!context) return false;

  context.getExtension("WEBGL_lose_context")?.loseContext();
  return true;
}

function createWebglRenderer(
  canvas: HTMLCanvasElement,
  options: WebglRendererOptions,
  label: string,
) {
  const attempts: WebglRendererOptions[] = [
    options,
    { ...options, antialias: false, powerPreference: "default" },
    { ...options, antialias: false, powerPreference: "low-power" },
  ];
  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      return new THREE.WebGLRenderer({
        canvas,
        ...attempt,
      });
    } catch (error) {
      lastError = error;
    }
  }

  console.warn(`${label} WebGL renderer unavailable.`, lastError);
  return null;
}

function startWebglStageFallback(canvas: HTMLCanvasElement, rootRef: { current: HTMLElement | null }) {
  const context = canvas.getContext("2d", { alpha: false });
  if (!context) return () => {};

  canvas.classList.add("webgl-stage-fallback");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const pointer = { x: 0.5, y: 0.5 };
  const scene = { current: 0, target: 0 };
  let width = 1;
  let height = 1;
  let raf = 0;
  let lastDraw = 0;
  let scrolling = false;
  let scrollTimer = 0;

  const accents = [
    [183, 255, 37],
    [206, 236, 126],
    [114, 192, 178],
    [245, 222, 188],
    [255, 118, 54],
    [255, 74, 36],
  ];

  const accentForScene = () => {
    const clamped = Math.max(0, Math.min(accents.length - 1, scene.current));
    const baseIndex = Math.floor(clamped);
    const nextIndex = Math.min(accents.length - 1, baseIndex + 1);
    const mix = clamped - baseIndex;
    const base = accents[baseIndex];
    const next = accents[nextIndex];
    return base.map((value, index) => value + (next[index] - value) * mix);
  };

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.max(1, Math.floor(width * ratio));
    canvas.height = Math.max(1, Math.floor(height * ratio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const readScene = () => {
    const raw = rootRef.current?.style.getPropertyValue("--scene-index");
    const next = raw ? Number.parseFloat(raw) : 0;
    if (Number.isFinite(next)) scene.target = next;
  };

  const onPointerMove = (event: PointerEvent) => {
    pointer.x = event.clientX / Math.max(1, width);
    pointer.y = event.clientY / Math.max(1, height);
  };

  const onScroll = () => {
    scrolling = true;
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      scrolling = false;
    }, 140);
  };

  const drawGrid = () => {
    context.save();
    context.globalAlpha = 0.22;
    context.strokeStyle = "rgba(243, 239, 223, 0.12)";
    context.lineWidth = 1;
    for (let x = 0; x <= width; x += 64) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let y = 0; y <= height; y += 64) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
  };

  const draw = (time = performance.now()) => {
    if (rootRef.current?.classList.contains("hero-theme-light")) {
      if (!reduceMotion) {
        raf = window.requestAnimationFrame(draw);
      }
      return;
    }

    if (!reduceMotion && time - lastDraw < (scrolling ? 120 : 33)) {
      raf = window.requestAnimationFrame(draw);
      return;
    }
    lastDraw = time;

    scene.current += (scene.target - scene.current) * (reduceMotion ? 0.18 : 0.045);
    const seconds = time * 0.001;
    const [r, g, b] = accentForScene();
    const px = pointer.x * width;
    const py = pointer.y * height;

    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#070806");
    background.addColorStop(0.5, "#12150e");
    background.addColorStop(1, "#1b0c07");
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    const centerGlow = context.createRadialGradient(width * 0.54, height * 0.42, 0, width * 0.54, height * 0.42, width * 0.55);
    centerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.18)`);
    centerGlow.addColorStop(0.42, "rgba(243, 239, 223, 0.055)");
    centerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = centerGlow;
    context.fillRect(0, 0, width, height);

    const pointerGlow = context.createRadialGradient(px, py, 0, px, py, Math.max(width, height) * 0.34);
    pointerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.2)`);
    pointerGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    context.fillStyle = pointerGlow;
    context.fillRect(0, 0, width, height);

    drawGrid();

    context.save();
    context.globalCompositeOperation = "screen";
    for (let index = 0; index < 7; index += 1) {
      const x = width * (0.18 + index * 0.13 + Math.sin(seconds * 0.18 + index) * 0.018);
      const beam = context.createLinearGradient(x - 90, 0, x + 90, height);
      beam.addColorStop(0, "rgba(0, 0, 0, 0)");
      beam.addColorStop(0.45, `rgba(${r}, ${g}, ${b}, ${0.035 + index * 0.004})`);
      beam.addColorStop(1, "rgba(0, 0, 0, 0)");
      context.fillStyle = beam;
      context.fillRect(x - 110, 0, 220, height);
    }

    context.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.14)`;
    context.lineWidth = 1;
    for (let index = 0; index < 9; index += 1) {
      const y = height * (0.18 + index * 0.075);
      const sway = Math.sin(seconds * 0.22 + index * 0.9) * 38;
      context.beginPath();
      context.moveTo(width * 0.35, y + sway);
      context.bezierCurveTo(width * 0.48, y - 40, width * 0.62, y + 42, width * 0.86, y + sway * 0.4);
      context.stroke();
    }
    context.restore();

    const vignette = context.createRadialGradient(width * 0.5, height * 0.48, width * 0.2, width * 0.5, height * 0.5, width * 0.72);
    vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
    vignette.addColorStop(1, "rgba(0, 0, 0, 0.62)");
    context.fillStyle = vignette;
    context.fillRect(0, 0, width, height);

    if (!reduceMotion) {
      raf = window.requestAnimationFrame(draw);
    }
  };

  resize();
  readScene();
  draw();

  const observer = new MutationObserver(readScene);
  if (rootRef.current) observer.observe(rootRef.current, { attributes: true, attributeFilter: ["style"] });
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    observer.disconnect();
    window.cancelAnimationFrame(raf);
    window.clearTimeout(scrollTimer);
    window.removeEventListener("resize", resize);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("scroll", onScroll);
    canvas.classList.remove("webgl-stage-fallback");
  };
}

export function PortfolioEditionsPrototype() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeProductModule, setActiveProductModule] = useState(0);
  const [heroInView, setHeroInView] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeVideo, setActiveVideo] = useState(0);
  const activeChapter = refinedChapters[activeIndex] ?? refinedChapters[0];
  const c = refinedCopy[locale];

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";
    document.title = c.siteTitle;
  }, [c.siteTitle, locale]);

  useEffect(() => {
    const urls = [
      ...works.slice(0, 6).map((work) => work.image),
      ...videoWorks.slice(0, 5).map((work) => work.poster),
    ];

    const preloadImages = () => {
      urls.forEach((url) => {
        const image = new Image();
        image.decoding = "async";
        image.src = url;
        image.decode().catch(() => undefined);
      });
    };

    const requestIdle = window.requestIdleCallback?.bind(window);
    const cancelIdle = window.cancelIdleCallback?.bind(window);

    if (requestIdle && cancelIdle) {
      const idleId = requestIdle(preloadImages, { timeout: 1800 });
      return () => cancelIdle(idleId);
    }

    const timer = window.setTimeout(preloadImages, 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hero = document.getElementById("top");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting && entry.intersectionRatio > 0.24),
      { threshold: [0, 0.24, 0.5] },
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let timer = 0;
    const onScroll = () => {
      root.classList.add("is-scrolling");
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        root.classList.remove("is-scrolling");
      }, 160);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      root.classList.remove("is-scrolling");
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 900);

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-chapter]");
      let currentSceneIndex = 0;
      const activateScene = (nextIndex: number) => {
        if (currentSceneIndex === nextIndex) return;
        currentSceneIndex = nextIndex;
        startTransition(() => setActiveIndex(nextIndex));
      };

      sections.forEach((section, index) => {
        const sceneIndex = Number.parseInt(section.dataset.sceneIndex ?? String(index), 10);
        const nextIndex = Number.isFinite(sceneIndex) ? Math.min(refinedChapters.length - 1, Math.max(0, sceneIndex)) : 0;
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => activateScene(nextIndex),
          onEnterBack: () => activateScene(nextIndex),
        });

        const revealTargets = section.querySelectorAll("[data-reveal]");
        if (revealTargets.length > 0) {
          gsap.fromTo(
            revealTargets,
            { autoAlpha: 0, y: 38 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.82,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 68%",
                toggleActions: "play none none none",
              },
            },
          );
        }
      });

      const artifactCore = rootRef.current?.querySelector(".artifact-core");
      if (artifactCore) {
        gsap.to(artifactCore, {
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
      }

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

          const cards = gsap.utils.toArray<HTMLElement>("[data-evidence-card]", channel);
          cards.forEach((card, cardIndex) => {
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
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canCreateWebglContext()) {
      return startWebglStageFallback(canvas, rootRef);
    }

    const renderer = createWebglRenderer(canvas, {
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    }, "Homepage background");
    if (!renderer) {
      return startWebglStageFallback(canvas, rootRef);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

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

    let scrolling = false;
    let scrollTimer = 0;
    const onScroll = () => {
      scrolling = true;
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        scrolling = false;
      }, 140);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("scroll", onScroll, { passive: true });

    let raf = 0;
    let lastRender = 0;
    const startTime = performance.now();
    const render = (now = performance.now()) => {
      const interval = scrolling ? 120 : reduceMotion ? 100 : 33;
      if (!rootRef.current?.classList.contains("hero-theme-light") && now - lastRender >= interval) {
        lastRender = now;
        material.uniforms.uTime.value = (now - startTime) / 1000;
        material.uniforms.uScene.value = THREE.MathUtils.lerp(
          material.uniforms.uScene.value,
          targetScene.value,
          reduceMotion ? 0.2 : 0.055,
        );
        renderer.render(scene, camera);
      }
      raf = window.requestAnimationFrame(render);
    };
    render();

    const observer = new MutationObserver(onSceneChange);
    if (rootRef.current) observer.observe(rootRef.current, { attributes: true, attributeFilter: ["style"] });

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      window.clearTimeout(scrollTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
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

  const progress = useMemo(() => `${((activeIndex + 1) / refinedChapters.length) * 100}%`, [activeIndex]);

  return (
    <main
      ref={rootRef}
      className={`portfolio-shell ${heroInView ? "hero-theme-light" : ""}`}
      data-locale={locale}
      data-active={activeChapter.id}
    >
      <canvas ref={canvasRef} className="webgl-stage" aria-hidden="true" />
      <div className="stage-fade" aria-hidden="true" />

      <header className="site-header">
        <a className="brand-lockup" href="#top" aria-label={c.brand}>
          <span className="brand-mark" aria-hidden="true" />
          <span className="brand-copy">
            <span className="brand-face brand-face-public">
              <strong>{c.brand}</strong>
              <small>{c.role}</small>
            </span>
            <span className="brand-face brand-face-resume" aria-hidden="true">
              <strong>{c.resumeBrand}</strong>
              <small>{c.resumeRole}</small>
            </span>
          </span>
        </a>
        <nav aria-label="Primary navigation">
          {refinedNavLinks.map((link) => (
            <a href={link.href} key={link.href}>
              {locale === "zh" ? link.zh : link.en}
            </a>
          ))}
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
        {refinedChapters.map((chapter, index) => (
          <a href={`#${chapter.id}`} className={index === activeIndex ? "active" : ""} key={chapter.id}>
            <span>{chapter.code}</span>
            <strong>{chapter.nav[locale]}</strong>
          </a>
        ))}
        <i style={{ height: progress }} aria-hidden="true" />
      </aside>

      <SocialDock />

      <section id="top" className="hero-scene mainframe-landing-scene" data-chapter data-scene-index="0">
        <MainframeLandingHero locale={locale} />
      </section>

      <section className="kinetic-manifesto" aria-label={locale === "zh" ? "作品集视觉宣言" : "Portfolio manifesto"}>
        <div className="manifesto-core">
          {refinedKineticTracks.map((track, index) => (
            <div className="manifesto-track" data-direction={index % 2 === 0 ? "left" : "right"} key={track.en}>
              <span>{locale === "zh" ? track.zh : track.en}</span>
              <span>{locale === "zh" ? track.zh : track.en}</span>
              <span>{locale === "zh" ? track.zh : track.en}</span>
            </div>
          ))}
        </div>
      </section>

      {refinedChapters.map((chapter, index) =>
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
        ) : chapter.id === "judgment" ? (
          <section
            id={chapter.id}
            className="chapter-scene video-chapter-scene"
            data-chapter
            data-scene-index={index}
            key={chapter.id}
          >
            <VideoRoomPanel
              chapter={chapter}
              locale={locale}
              activeVideo={activeVideo}
              onVideoChange={setActiveVideo}
            />
          </section>
        ) : (
          <section
            id={chapter.id}
            className={`chapter-scene ${chapter.id === "product" ? "product-scene" : ""} ${chapter.id === "method" ? "music-chapter-scene" : ""} ${chapter.id === "contact" ? "contact-scene" : ""}`}
            data-chapter
            data-scene-index={index}
            key={chapter.id}
          >
            <div className="chapter-kicker" data-reveal>
              <span>{chapter.code}</span>
              <b>{chapter.nav[locale]}</b>
            </div>
            {chapter.id === "method" ? null : (
              <article data-reveal>
                <h2>{chapter.title[locale]}</h2>
                <p className="chapter-line">{chapter.line[locale]}</p>
                <p>{chapter.body[locale]}</p>
              </article>
            )}
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

function useMainframeTypewriter(text: string, speed = 38, startDelay = 360) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let index = 0;
    let startId: number | undefined;
    let intervalId: number | undefined;

    const resetId = window.setTimeout(() => {
      setDisplayed("");
      setDone(false);

      startId = window.setTimeout(() => {
        intervalId = window.setInterval(() => {
          index += 1;
          setDisplayed(text.slice(0, index));

          if (index >= text.length) {
            if (intervalId) window.clearInterval(intervalId);
            setDone(true);
          }
        }, speed);
      }, startDelay);
    }, 0);

    return () => {
      window.clearTimeout(resetId);
      if (startId) window.clearTimeout(startId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [speed, startDelay, text]);

  return { displayed, done };
}

function MainframeLandingVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const ready = true;

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    const video = videoElement;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    let previousPointerX: number | null = null;
    let targetTime = 0;
    let seeking = false;

    function applySeek() {
      seeking = true;
      video.currentTime = targetTime;
    }

    const handleMouseMove = (event: MouseEvent) => {
      if (window.innerWidth < 1024 || reduceMotion || coarsePointer) return;

      const duration = video.duration;
      if (!duration || Number.isNaN(duration) || video.readyState < 1) return;

      if (previousPointerX === null) {
        previousPointerX = event.clientX;
        targetTime = video.currentTime || 0;
        return;
      }

      const delta = event.clientX - previousPointerX;
      previousPointerX = event.clientX;
      targetTime = Math.max(0, Math.min(duration, targetTime + (delta / window.innerWidth) * duration * 0.8));

      if (!seeking) applySeek();
    };

    const handleMouseLeave = () => {
      previousPointerX = null;
    };

    const handleLoadedMetadata = () => {
      if (window.innerWidth < 1024 || reduceMotion || coarsePointer) {
        video.loop = true;
        const play = video.play();
        if (play && typeof play.catch === "function") play.catch(() => undefined);
        return;
      }

      video.loop = false;
      video.pause();
      targetTime = 0;
      try {
        if (video.currentTime > 0.03) video.currentTime = 0;
      } catch {
        // Some browsers reject early seeks until the first frame is available.
      }
    };

    const handleSeeked = () => {
      seeking = false;
      if (!video.duration || Math.abs(video.currentTime - targetTime) <= 0.01) return;
      applySeek();
    };

    video.loop = false;
    video.muted = true;
    video.pause();

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("seeked", handleSeeked);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    if (video.readyState >= 1) handleLoadedMetadata();

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("seeked", handleSeeked);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="mainframe-landing-video"
      src={MAINFRAME_CAT_VIDEO_URL}
      poster={MAINFRAME_CAT_POSTER}
      muted
      playsInline
      preload="auto"
      crossOrigin="anonymous"
      data-ready={ready ? "true" : "false"}
      aria-hidden="true"
    />
  );
}

function MainframeLandingHero({ locale }: { locale: Locale }) {
  const hero =
    locale === "zh"
      ? {
          eyebrow: "AI 创作者 / 图像 / 影视 / 音乐 / 产品",
          title: "你好，\n我是 Miao。",
          body: "我做图像、视频、音乐，也做一些奇奇怪怪的 AI 工具。一起做点酷东西 :)",
          enter: "进入房间",
        }
      : {
          eyebrow: "AI creator / images / film / music / product",
          title: "Hello,\nthis is Miao.",
          body: "I make images, videos, music, and strange little tools with AI. Let's do some cool things :)",
          enter: "Enter rooms",
        };
  const { displayed, done } = useMainframeTypewriter(hero.title, locale === "zh" ? 48 : 36, 260);

  return (
    <>
      <div className="mainframe-landing-media" aria-hidden="true">
        <MainframeLandingVideo />
        <div className="mainframe-landing-scrim" />
        <div className="mainframe-landing-grid" />
        <div className="mainframe-landing-notes">
          <span>MIAO // IMAGE // FILM</span>
          <span>PROMPT &gt; TASTE &gt; RHYTHM</span>
          <span>AI CAN BE WILD</span>
          <span>MAKE IT MOVE</span>
          <span>TOOL AS PLAY</span>
        </div>
      </div>

      <div className="mainframe-landing-copy">
        <p className="mainframe-landing-eyebrow">{hero.eyebrow}</p>
        <h1 className="mainframe-landing-title" aria-label={hero.title}>
          {displayed || "\u00A0"}
          {!done ? <i aria-hidden="true" /> : null}
        </h1>
        <p className="mainframe-landing-body">{hero.body}</p>

        <div className="mainframe-landing-actions">
          <a className="mainframe-landing-primary" href="#direction">
            {hero.enter}
          </a>
        </div>
      </div>

      <div className="mainframe-landing-handoff" aria-hidden="true" />
    </>
  );
}

function MainframeCatHeroVisual({ locale }: { locale: Locale }) {
  const [contentOpen, setContentOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const stageRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const seekingRef = useRef(false);
  const targetTimeRef = useRef(0);
  const reduceMotionRef = useRef(false);
  const lastScrubRef = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const playLoop = () => {
      video.loop = true;
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    };

    const onLoadedMetadata = () => {
      if (window.innerWidth < 900 || reduceMotionRef.current) {
        playLoop();
        return;
      }

      targetTimeRef.current = video.duration * 0.48;
      try {
        video.currentTime = targetTimeRef.current;
      } catch {
        playLoop();
      }
    };

    const onSeeked = () => {
      seekingRef.current = false;
      if (!video.duration) return;

      if (Math.abs(video.currentTime - targetTimeRef.current) > 0.05) {
        seekingRef.current = true;
        video.currentTime = targetTimeRef.current;
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("seeked", onSeeked);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("seeked", onSeeked);
    };
  }, []);

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  useEffect(() => {
    if (!contentOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContentOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [contentOpen]);

  const scrubVideo = (ratio: number) => {
    const video = videoRef.current;
    if (!video || !video.duration || window.innerWidth < 900 || reduceMotionRef.current) return;
    const now = performance.now();
    if (now - lastScrubRef.current < 90) return;

    lastScrubRef.current = now;
    targetTimeRef.current = Math.min(video.duration - 0.05, Math.max(0, video.duration * (0.12 + ratio * 0.76)));
    if (seekingRef.current) return;

    seekingRef.current = true;
    video.pause();
    video.currentTime = targetTimeRef.current;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));

    event.currentTarget.style.setProperty("--cat-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--cat-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--cat-tilt-x", `${(0.5 - y) * 8}deg`);
    event.currentTarget.style.setProperty("--cat-tilt-y", `${(x - 0.5) * 11}deg`);

    scrubVideo(x);
  };

  const handlePointerLeave = () => {
    const stage = stageRef.current;
    if (!stage) return;

    stage.style.setProperty("--cat-x", "54%");
    stage.style.setProperty("--cat-y", "42%");
    stage.style.setProperty("--cat-tilt-x", "0deg");
    stage.style.setProperty("--cat-tilt-y", "0deg");
  };

  return (
    <>
      <button
        className="mainframe-cat-stage"
        type="button"
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onClick={() => setContentOpen(true)}
        aria-label={locale === "zh" ? "打开 Miao 视觉名片" : "Open Miao visual card"}
        data-reveal
      >
        <span className="mainframe-cat-orbit orbit-one" aria-hidden="true" />
        <span className="mainframe-cat-orbit orbit-two" aria-hidden="true" />
        <span className="mainframe-cat-card">
          <video
            ref={videoRef}
            className="mainframe-cat-video"
            src={MAINFRAME_CAT_VIDEO_URL}
            poster={MAINFRAME_CAT_POSTER}
            muted
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
          />
          <span className="mainframe-cat-glow" aria-hidden="true" />
          <span className="mainframe-cat-scan" aria-hidden="true" />
          <span className="mainframe-cat-lens" aria-hidden="true" />
          <span className="mainframe-cat-edge" aria-hidden="true" />
          <span className="mainframe-cat-code" aria-hidden="true">
            <span>MIAO // IMAGE // FILM</span>
            <span>PROMPT &gt; TASTE &gt; RHYTHM</span>
            <span>AI CAN BE WILD</span>
            <span>MAKE IT MOVE</span>
            <span>TOOL AS PLAY</span>
          </span>
          <span className="mainframe-cat-pixels" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => {
              const pixelStyle = {
                "--pixel-index": index,
                "--pixel-x": `${9 + ((index * 37) % 76)}%`,
                "--pixel-y": `${13 + ((index * 29) % 70)}%`,
              } as CSSProperties;

              return <i key={index} style={pixelStyle} />;
            })}
          </span>
          <span className="mainframe-cat-sparkles" aria-hidden="true">
            {Array.from({ length: 12 }, (_, index) => (
              <i key={index} style={{ "--spark-index": index } as CSSProperties} />
            ))}
          </span>
          <span className="mainframe-cat-prompt" aria-hidden="true">
            <b>{locale === "zh" ? "点亮" : "wake"}</b>
            <small>{locale === "zh" ? "移动鼠标 / 点击打开" : "move cursor / open card"}</small>
          </span>
          <span className="mainframe-cat-caption">
            <strong>{locale === "zh" ? "视觉先行 / 让画面动起来" : "visual first / make images move"}</strong>
            <small>{locale === "zh" ? "工具也可以像玩具 / 审美就是信号" : "tools can be playful / taste is the signal"}</small>
          </span>
          <span className="mainframe-cat-enter" aria-hidden="true">
            {locale === "zh" ? "点击进入" : "click to enter"}
          </span>
        </span>
      </button>

      {contentOpen && portalRoot
        ? createPortal(
            (
        <div
          className="cat-content-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={locale === "zh" ? "Miao 视觉名片" : "Miao visual card"}
        >
          <button
            className="cat-content-backdrop"
            type="button"
            onClick={() => setContentOpen(false)}
            aria-label={locale === "zh" ? "关闭" : "Close"}
          />
          <div className="cat-content-window">
            <span className="cat-content-corners" aria-hidden="true" />
            <button
              className="cat-content-close"
              type="button"
              onClick={() => setContentOpen(false)}
              aria-label={locale === "zh" ? "关闭" : "Close"}
            >
              X
            </button>
            <div className="cat-contact-band">
              <div className="cat-contact-copy">
                <span>{locale === "zh" ? "微信联系" : "WeChat contact"}</span>
                <strong>{WECHAT_ID}</strong>
                <p>
                  {locale === "zh"
                    ? "扫二维码，或直接搜索微信号。适合聊合作、视频、图像和产品 Demo。"
                    : "Scan the code or search the ID. Best for collaborations, video, image, and product demos."}
                </p>
              </div>
              <figure className="cat-contact-qr">
                <img
                  src={MAINFRAME_CAT_WECHAT_QR}
                  alt={locale === "zh" ? "微信二维码" : "WeChat QR code"}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>WECHAT / {WECHAT_ID}</figcaption>
              </figure>
            </div>
            <div className="cat-content-card">
              <img className="cat-content-image" src={MAINFRAME_CAT_POSTER} alt="" loading="lazy" decoding="async" />
              <span className="cat-content-scan" aria-hidden="true" />
              <span className="cat-content-lens" aria-hidden="true" />
              <span className="cat-content-pixels" aria-hidden="true">
                {Array.from({ length: 24 }, (_, index) => {
                  const pixelStyle = {
                    "--pixel-index": index,
                    "--pixel-x": `${7 + ((index * 31) % 82)}%`,
                    "--pixel-y": `${9 + ((index * 23) % 76)}%`,
                  } as CSSProperties;

                  return <i key={index} style={pixelStyle} />;
                })}
              </span>
              <span className="cat-content-sparkles" aria-hidden="true">
                {Array.from({ length: 14 }, (_, index) => (
                  <i key={index} style={{ "--spark-index": index } as CSSProperties} />
                ))}
              </span>
              <div className="cat-content-code" aria-hidden="true">
                <span>MIAO // IMAGE // FILM</span>
                <span>PROMPT &gt; TASTE &gt; RHYTHM</span>
                <span>AI CAN BE WILD</span>
                <span>MAKE IT MOVE</span>
                <span>TOOL AS PLAY</span>
              </div>
              <div className="cat-content-caption">
                <strong>{locale === "zh" ? "视觉先行 / 让画面动起来" : "visual first / make images move"}</strong>
                <span>
                  {locale === "zh"
                    ? "工具也可以像玩具，审美就是信号。"
                    : "Tools can be playful, and taste is the signal."}
                </span>
              </div>
            </div>
          </div>
        </div>
            ),
            portalRoot,
          )
        : null}
    </>
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
  const [activeSkill, setActiveSkill] = useState(0);
  const activeSignal = refinedTasteSignals[activeSkill] ?? refinedTasteSignals[0];

  if (chapter.id === "direction") {
    return (
      <div className="scene-panel skill-showcase-panel" data-reveal>
        <span>{locale === "zh" ? "个人技能" : "Personal skills"}</span>
        <strong>
          {locale === "zh"
            ? "不是只会生成，而是把 AI 变成影像、图像、声音和工具。"
            : "Not just generating. I turn AI into video, images, sound, and tools."}
        </strong>
        <div className="skill-stage" aria-live="polite">
          <i>{activeSignal.code}</i>
          <b>{locale === "zh" ? activeSignal.metricZh : activeSignal.metricEn}</b>
          <p>{locale === "zh" ? activeSignal.zh : activeSignal.en}</p>
        </div>
        <div className="skill-picker" role="tablist" aria-label={locale === "zh" ? "选择技能" : "Choose a skill"}>
          {refinedTasteSignals.map((item, skillIndex) => (
            <button
              type="button"
              className={skillIndex === activeSkill ? "active" : ""}
              key={item.code}
              role="tab"
              aria-selected={skillIndex === activeSkill}
              onClick={() => setActiveSkill(skillIndex)}
              onMouseEnter={() => setActiveSkill(skillIndex)}
            >
              <span>{item.code}</span>
              <strong>{locale === "zh" ? item.zh : item.en}</strong>
              <small>{locale === "zh" ? item.metricZh : item.metricEn}</small>
            </button>
          ))}
        </div>
        <div className="skill-orbit" aria-hidden="true">
          <i />
          <i />
          <i />
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
          <span>{refinedCopy[locale].productSubtitle}</span>
          <b>{locale === "zh" ? "正在运行" : "running"}</b>
        </div>
        <strong>{refinedCopy[locale].productTitle}</strong>
        <code>{locale === "zh" ? "剧本 / 风格 / 人物 / 分镜 / 任务" : "script / style / characters / shots / tasks"}</code>

        <div className="product-module-grid" role="tablist" aria-label={refinedCopy[locale].productTitle}>
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

        <div className="product-entrance-strip" aria-label={locale === "zh" ? "产品和小作品入口" : "Product and lab entrances"}>
          {productEntrances.map((entry) => (
            <Link href={entry.href} key={entry.code}>
              <span>{entry.code}</span>
              <strong>{locale === "zh" ? entry.zh : entry.en}</strong>
              <small>{locale === "zh" ? entry.detailZh : entry.detailEn}</small>
            </Link>
          ))}
        </div>

        <div className="product-livebar" aria-hidden="true">
          <i style={{ width: `${((activeProductModule + 1) / productModules.length) * 100}%` }} />
        </div>
        <p>{refinedCopy[locale].productHint}</p>
      </div>
    );
  }

  if (chapter.id === "judgment-old") {
    return (
      <div className="scene-panel evaluation-panel" data-reveal>
        <span>{locale === "zh" ? "影视房间" : "Videos room"}</span>
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
            ? "视频要被播放，要有节奏，也要有故事。它不应该被塞进图片墙。"
            : "Video needs playback, rhythm, and story. It should not be buried inside an image wall."}
        </p>
      </div>
    );
  }

  if (chapter.id === "works") {
    return <WorkTimeChannel locale={locale} />;
  }

  if (chapter.id === "method") {
    return <MusicParticles locale={locale} ctaHref="#method" sampleUrl={MUSIC_SAMPLE_URL} />;
  }

  if (chapter.id === "contact") {
    return (
      <div className="scene-panel contact-panel" data-reveal>
        <div className="contact-copy">
          <span>{refinedCopy[locale].contactTitle}</span>
          <strong>{chapter.signal}</strong>
          <p>{refinedCopy[locale].contactBody}</p>
          <div className="contact-channel-deck" aria-label={locale === "zh" ? "联系入口" : "Contact channels"}>
            {contactChannels.map((item) =>
              item.href ? (
                <a className="contact-channel" data-channel={item.label} href={item.href} key={item.key}>
                  <small>{item.label}</small>
                  <b>{item.value}</b>
                  <span>{locale === "zh" ? item.detailZh : item.detailEn}</span>
                </a>
              ) : (
                <div className="contact-channel" data-channel={item.label} key={item.key}>
                  <small>{item.label}</small>
                  <b>{item.value}</b>
                  <span>{locale === "zh" ? item.detailZh : item.detailEn}</span>
                </div>
              ),
            )}
          </div>
        </div>
        <div className="contact-cat-entry" aria-label={locale === "zh" ? "Miao 互动名片" : "Miao interactive card"}>
          <MainframeCatHeroVisual locale={locale} />
        </div>
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

function VideoRoomPanel({
  locale,
  chapter,
  activeVideo,
  onVideoChange,
}: {
  locale: Locale;
  chapter: Chapter;
  activeVideo: number;
  onVideoChange: (index: number) => void;
}) {
  const active = videoWorks[activeVideo] ?? videoWorks[0];
  const featured = videoWorks.slice(0, 5);

  return (
    <div className="video-room-panel" data-reveal>
      <div className="home-video-banner">
        <div className="home-video-banner-copy">
          <span>
            {chapter.code} / {chapter.nav[locale]}
          </span>
          <h2>{chapter.title[locale]}</h2>
          <p className="chapter-line">{chapter.line[locale]}</p>
          <p>{chapter.body[locale]}</p>
          <Link className="home-video-open" href={`/videos?work=${active.id}`}>
            <span>{locale === "zh" ? "点开看原片" : "watch original cut"}</span>
            <b>{locale === "zh" ? active.titleZh : active.titleEn}</b>
          </Link>
        </div>

        <div className="home-video-banner-stack" aria-label={locale === "zh" ? "精选视频封面" : "Featured video covers"}>
          {featured.map((work, index) => (
            <Link
              href={`/videos?work=${work.id}`}
              key={work.id}
              className={`home-video-frame ${index === activeVideo ? "active" : ""}`}
              onMouseEnter={() => onVideoChange(index)}
              onFocus={() => onVideoChange(index)}
            >
            <img src={work.poster} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
              <b>{work.code}</b>
            </Link>
          ))}
        </div>
      </div>

      <div className="home-video-index" aria-label={locale === "zh" ? "视频作品索引" : "Video work index"}>
        {videoWorks.map((work, workIndex) => (
          <Link
            href={`/videos?work=${work.id}`}
            key={work.id}
            className={`home-video-row ${workIndex === activeVideo ? "active" : ""}`}
            onMouseEnter={() => onVideoChange(workIndex)}
            onFocus={() => onVideoChange(workIndex)}
          >
            <span>{work.code}</span>
            <strong>{locale === "zh" ? work.titleZh : work.titleEn}</strong>
            <small>{locale === "zh" ? work.metaZh : work.metaEn}</small>
            <b>{work.date}</b>
            <img className="home-video-row-poster" src={work.poster} alt="" loading="lazy" decoding="async" />
          </Link>
        ))}
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
    if (!canCreateWebglContext()) {
      root.classList.add("channel-ready", "channel-webgl-fallback");
      return () => {
        channelControlRef.current = null;
        root.classList.remove("channel-webgl-fallback");
      };
    }

    const renderer = createWebglRenderer(canvas, {
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    }, "Work time channel");
    if (!renderer) {
      root.classList.add("channel-ready", "channel-webgl-fallback");
      return () => {
        channelControlRef.current = null;
        root.classList.remove("channel-webgl-fallback");
      };
    }

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
    let channelVisible = false;
    let lastChannelRender = 0;

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

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        channelVisible = entry.isIntersecting;
      },
      { rootMargin: "360px 0px", threshold: 0 },
    );

    const clock = new THREE.Clock();
    const render = (now = performance.now()) => {
      if (!channelVisible || (!reduceMotion && now - lastChannelRender < 33)) {
        animationFrame = window.requestAnimationFrame(render);
        return;
      }

      lastChannelRender = now;
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
    visibilityObserver.observe(root);
    root.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", resize);
    render();

    return () => {
      channelControlRef.current = null;
      visibilityObserver.disconnect();
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
    event.currentTarget.style.setProperty("--eye-dx", `${Math.max(-1, Math.min(1, x)) * 18}px`);
    event.currentTarget.style.setProperty("--eye-dy", `${Math.max(-1, Math.min(1, y)) * 12}px`);
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
        <div className="work-card-fan" aria-label={locale === "zh" ? "精选作品入口" : "Selected work entry"}>
          {works.slice(0, 5).map((work, index) => (
            <button
              type="button"
              className={`work-entry-card ${work.kind}`}
              key={work.id}
              onClick={() => enterWork(index)}
              onMouseEnter={() => focusWork(index)}
            >
              <img src={work.image} alt="" loading="eager" decoding="async" />
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
            aria-label={locale === "zh" ? "进入 AI 之眼图像频道" : "Enter AI Eye image channel"}
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
          <p>{locale === "zh" ? "进入 Miao 的图像频道" : "Enter Miao's image channel"}</p>
          <small>{locale === "zh" ? "氛围 / 构图 / 人物感 / 世界观" : "mood / framing / character / world"}</small>
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
