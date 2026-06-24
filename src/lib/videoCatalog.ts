export type VideoWork = {
  id: string;
  code: string;
  titleEn: string;
  titleZh: string;
  metaEn: string;
  metaZh: string;
  date: string;
  poster: string;
};

export const videoWorkIdAliases: Record<string, string> = {
  "who-am-i": "who-are-you",
};

export function getCanonicalVideoWorkId(id: string) {
  return videoWorkIdAliases[id] ?? id;
}

export const videoWorks: VideoWork[] = [
  {
    id: "grand-void",
    code: "01",
    titleEn: "Grand Void Performance",
    titleZh: "盛大的虚无表演",
    metaEn: "music video / image atmosphere",
    metaZh: "MV / 影像氛围",
    date: "2026",
    poster: "/videos/grand-void-poster.jpg",
  },
  {
    id: "gangshang-flower",
    code: "02",
    titleEn: "Gang Shang Hua Kai",
    titleZh: "杠上花开",
    metaEn: "music video / motion image",
    metaZh: "MV / 动态影像",
    date: "2026",
    poster: "/videos/gangshang-flower-poster.jpg",
  },
  {
    id: "wasted-time",
    code: "03",
    titleEn: "Wasted Time With You",
    titleZh: "我想和你虚度时光",
    metaEn: "music video / mood edit",
    metaZh: "MV / 氛围剪辑",
    date: "2026",
    poster: "/videos/wasted-time-poster.jpg",
  },
  {
    id: "cedo-amori",
    code: "04",
    titleEn: "Cedo Amori",
    titleZh: "Cedo Amori",
    metaEn: "music video / title packaging",
    metaZh: "MV / 字体包装",
    date: "2026",
    poster: "/videos/cedo-amori-poster.jpg",
  },
  {
    id: "who-are-you",
    code: "05",
    titleEn: "Who Are You",
    titleZh: "你是谁",
    metaEn: "identity film / visual system",
    metaZh: "身份影像 / 视觉系统",
    date: "2026",
    poster: "/videos/who-am-i-poster.jpg",
  },
  {
    id: "autophagy",
    code: "06",
    titleEn: "Autophagy",
    titleZh: "自噬",
    metaEn: "experimental film / image narrative",
    metaZh: "实验影像 / 图像叙事",
    date: "2026",
    poster: "/videos/autophagy-poster.jpg",
  },
  {
    id: "time-thief",
    code: "07",
    titleEn: "Time Thief",
    titleZh: "时间小偷",
    metaEn: "experimental film / rhythm test",
    metaZh: "实验影像 / 节奏测试",
    date: "2026",
    poster: "/videos/time-thief-poster.jpg",
  },
  {
    id: "style-audition",
    code: "08",
    titleEn: "Style Audition",
    titleZh: "风格试镜",
    metaEn: "style test / camera language",
    metaZh: "风格测试 / 镜头语言",
    date: "2026",
    poster: "/videos/style-audition-poster.jpg",
  },
  {
    id: "overseas-test",
    code: "09",
    titleEn: "Overseas Film Test",
    titleZh: "出海影视测试",
    metaEn: "market story / vertical video",
    metaZh: "市场叙事 / 竖屏视频",
    date: "2026",
    poster: "/videos/overseas-test-poster.jpg",
  },
];
