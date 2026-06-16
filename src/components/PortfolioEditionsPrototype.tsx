"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
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
    role: "AI product / AIGC direction / algorithm collaboration",
    nav: ["Work", "Product", "Method", "Contact"],
    lang: "中文",
    heroTitle: "Building systems that think, create, and evolve.",
    heroBody:
      "A bilingual portfolio for AI product roles where creative direction, product judgment, and model evaluation need to work as one system.",
    primary: "Enter work",
    secondary: "Product slot",
    index: "Chapters",
    stage: "Real-time portfolio system",
    productTitle: "Active product interface",
    productSubtitle: "Reserved runtime slot",
    productHint: "Future modules can mount here without flattening the portfolio into a gallery.",
    worksTitle: "Evidence wall",
    worksLead: "Films, AI product demos, commercial AIGC visuals, and creator campaigns are framed as evidence trails rather than decorative thumbnails.",
    methodTitle: "Operating rhythm",
    contactTitle: "Role argument",
    contactBody:
      "The site is designed to prove one thing quickly: creative direction, AI product thinking, and algorithmic evaluation can live in one person.",
  },
  zh: {
    brand: "郭嘉雯 / Miao喵渺淼妙",
    role: "AI 产品 / AIGC 创作 / 算法协作",
    nav: ["作品", "产品", "方法", "联系"],
    lang: "EN",
    heroTitle: "构建会思考、创作与进化的系统。",
    heroBody:
      "一个面向 AI 产品与 AIGC 创作岗位的双语作品集，用作品证明编导审美、产品判断和模型评估可以集中在同一个人身上。",
    primary: "进入作品",
    secondary: "产品接口",
    index: "章节",
    stage: "实时作品集系统",
    productTitle: "正在开发的产品接口",
    productSubtitle: "预留运行时槽位",
    productHint: "后续产品可以接入这里，而不是把作品集压成普通图片墙。",
    worksTitle: "作品证据墙",
    worksLead: "影像、产品 Demo、商业 AIGC 视觉和内容商单会被组织成证据链，而不是装饰性的图片墙。",
    methodTitle: "工作节奏",
    contactTitle: "岗位论证",
    contactBody:
      "这个网站要快速证明一件事：AI 编导、AI 产品和算法评估可以集中在同一个人身上。",
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
    id: "algorithm",
    code: "III",
    nav: { en: "Evaluation", zh: "算法评估" },
    title: { en: "Taste becomes a review protocol.", zh: "审美变成审核协议。" },
    line: { en: "Model output needs a director and an evaluator.", zh: "模型输出既需要导演，也需要评估者。" },
    body: {
      en: "Lens language, consistency, narrative integrity, latency, cost, and controllability become the loop that keeps generated work from drifting.",
      zh: "镜头语言、一致性、叙事完整性、延迟、成本和可控性构成反馈闭环，让生成式作品不漂移。",
    },
    signal: "QUALITY / COST / CONTROL",
  },
  {
    id: "works",
    code: "IV",
    nav: { en: "Works", zh: "作品" },
    title: { en: "Works become a cinematic evidence wall.", zh: "作品成为电影化证据墙。" },
    line: { en: "The archive should feel alive because the process is alive.", zh: "档案要有生命力，因为过程本身是动态的。" },
    body: {
      en: "The portfolio holds feature-film AIGC work, overseas AI shorts, concert visuals, product campaigns, and product demos in one narrative structure.",
      zh: "作品集会把院线电影 AIGC、海外 AI 短剧、演唱会视觉、产品商单和产品 Demo 放进同一套叙事结构。",
    },
    signal: "CASE / METHOD / OUTCOME",
  },
  {
    id: "method",
    code: "V",
    nav: { en: "Method", zh: "方法" },
    title: { en: "Observe, script, generate, evaluate, ship.", zh: "观察、编剧、生成、评估、交付。" },
    line: { en: "A process should move, not read like a list.", zh: "方法不应该像清单，而应该像流程一样移动。" },
    body: {
      en: "The page exposes how a messy creative or product question becomes a working demo, a production workflow, and a defensible model brief.",
      zh: "页面会展示一个混乱的创意或产品问题如何变成可运行 Demo、生产工作流和可辩护的模型需求。",
    },
    signal: "OBSERVE / FRAME / SHIP",
  },
  {
    id: "contact",
    code: "VI",
    nav: { en: "Fit", zh: "匹配" },
    title: { en: "A portfolio for the hybrid role.", zh: "为复合岗位而设计的作品集。" },
    line: { en: "Director taste, product sense, algorithm literacy.", zh: "编导审美、产品 sense、算法理解。" },
    body: {
      en: "Recruiters should understand the role fit before they finish the page. The details can then prove it.",
      zh: "面试官应该在读完页面前就理解岗位匹配，细节再继续证明。",
    },
    signal: "DIRECTION / PRODUCT / ALGORITHM",
  },
];

const works = [
  {
    id: "01",
    en: "Feature Film AIGC Pipeline",
    zh: "院线电影 AIGC 管线",
    detailEn: "AI rendering, shot compositing, scene consistency, and delivery review.",
    detailZh: "AI 渲染、镜头合成、场景一致性和交付审核。",
    image: "/portfolio-assets/work-05.png",
  },
  {
    id: "02",
    en: "Concert Visual Delivery",
    zh: "演唱会 AIGC 视觉",
    detailEn: "Prompt engineering, generation, quality control, and stage-ready output.",
    detailZh: "提示词工程、AI 生成、质量控制和舞台交付。",
    image: "/portfolio-assets/work-03.jpg",
  },
  {
    id: "03",
    en: "AI Product Campaigns",
    zh: "AI 产品创意商单",
    detailEn: "WorkBuddy, Tabbit, creator scripts, product demos, and audience hooks.",
    detailZh: "WorkBuddy、Tabbit、创意脚本、产品 Demo 和传播钩子。",
    image: "/portfolio-assets/work-01.png",
  },
  {
    id: "04",
    en: "Original AI Worlds",
    zh: "原创 AI 世界观",
    detailEn: "Character systems, surreal scenes, horror texture, and cinematic mood boards.",
    detailZh: "人物系统、超现实场景、恐怖质感和电影化 moodboard。",
    image: "/portfolio-assets/work-04.png",
  },
];

const method = ["Observe", "Script", "Prototype", "Evaluate", "Ship"];

const proofPoints = [
  { en: "25+ AI shorts", zh: "25+ 部 AI 短剧" },
  { en: "1-2M top views", zh: "最高 100-200 万播放" },
  { en: "Concert AIGC delivery", zh: "演唱会 AIGC 交付" },
  { en: "TOEFL 101", zh: "托福 101" },
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
    }, rootRef);

    return () => {
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
      </section>

      {chapters.map((chapter, index) => (
        <section id={chapter.id} className="chapter-scene" data-chapter data-scene-index={index} key={chapter.id}>
          <div className="chapter-kicker" data-reveal>
            <span>{chapter.code}</span>
            <b>{chapter.nav[locale]}</b>
          </div>
          <article data-reveal>
            <h2>{chapter.title[locale]}</h2>
            <p className="chapter-line">{chapter.line[locale]}</p>
            <p>{chapter.body[locale]}</p>
          </article>
          <ScenePanel locale={locale} chapter={chapter} index={index} />
        </section>
      ))}
    </main>
  );
}

function ScenePanel({ locale, chapter, index }: { locale: Locale; chapter: Chapter; index: number }) {
  if (chapter.id === "product") {
    return (
      <div className="scene-panel product-panel" data-reveal>
        <span>{copy[locale].productSubtitle}</span>
        <strong>{copy[locale].productTitle}</strong>
        <code>{productId}</code>
        <div className="port-grid">
          {["Input schema", "Route planner", "Review queue", "API slot"].map((item) => (
            <b key={item}>{locale === "zh" ? translatePort(item) : item}</b>
          ))}
        </div>
        <p>{copy[locale].productHint}</p>
      </div>
    );
  }

  if (chapter.id === "works") {
    return (
      <div className="scene-panel works-panel" data-reveal>
        <span>{copy[locale].worksTitle}</span>
        <p>{copy[locale].worksLead}</p>
        {works.map((work) => (
          <a href="#contact" className="work-entry" key={work.id}>
            <img src={work.image} alt="" loading="lazy" />
            <i>{work.id}</i>
            <span>
              <strong>{locale === "zh" ? work.zh : work.en}</strong>
              <small>{locale === "zh" ? work.detailZh : work.detailEn}</small>
            </span>
          </a>
        ))}
      </div>
    );
  }

  if (chapter.id === "method") {
    return (
      <div className="scene-panel method-panel" data-reveal>
        <span>{copy[locale].methodTitle}</span>
        <div>
          {method.map((step, stepIndex) => (
            <b key={step}>
              <i>{String(stepIndex + 1).padStart(2, "0")}</i>
              {locale === "zh" ? translateMethod(step) : step}
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

function translatePort(value: string) {
  const map: Record<string, string> = {
    "Input schema": "输入结构",
    "Route planner": "路线规划",
    "Review queue": "审核队列",
    "API slot": "API 槽位",
  };
  return map[value] ?? value;
}

function translateMethod(value: string) {
  const map: Record<string, string> = {
    Observe: "观察",
    Script: "编剧",
    Prototype: "原型",
    Evaluate: "评估",
    Ship: "交付",
  };
  return map[value] ?? value;
}
