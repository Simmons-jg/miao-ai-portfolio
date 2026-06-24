import { getCanonicalVideoWorkId, videoWorks } from "./videoCatalog";

export const videoSourceMap: Record<string, string> = {
  "time-thief": "E:/作品/作品/视频/实验短片/时间小偷Time Theif.mp4",
  autophagy: "E:/作品/作品/视频/实验短片/《自噬》(Autophagy)字幕版本_prob3.mp4",
  "who-are-you": "E:/作品/作品/视频/实验短片/你是谁0402_4_prob3.mp4",
  "wasted-time": "E:/作品/作品/视频/MV/我想和你虚度时光.mp4",
  "cedo-amori": "E:/作品/作品/视频/MV/Cedo Amori 底部字体包装_prob3.mp4",
  "gangshang-flower": "E:/作品/作品/视频/MV/杠上花开_prob3.mp4",
  "grand-void": "E:/作品/作品/视频/MV/盛大的虚无表演v2 HEVC_prob3.mp4",
  "style-audition": "E:/作品/作品/视频/风格试镜/4月29日.mp4",
  "overseas-test": "E:/作品/作品/视频/出海短剧/8c6b2b541a92882fc2288d62048f5555.mp4",
};

export function getVideoSource(id: string) {
  const canonicalId = getCanonicalVideoWorkId(id);

  if (!videoWorks.some((work) => work.id === canonicalId)) {
    return null;
  }

  return videoSourceMap[canonicalId] ?? null;
}
