import type { Metadata } from "next";
import { MusicSpacePage } from "@/components/MusicSpacePage";

export const metadata: Metadata = {
  title: "Music Space / MiaoMeowMew",
  description: "A real playable music room for Miao's AI music sketches.",
};

export default function MusicPage() {
  return <MusicSpacePage />;
}
