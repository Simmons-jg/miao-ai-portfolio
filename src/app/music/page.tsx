import type { Metadata } from "next";
import { MusicSpacePage } from "@/components/MusicSpacePage";
import { roomTitle } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: roomTitle("Music"),
  description: "A real playable music room for Miao's AI music sketches.",
};

export default function MusicPage() {
  return <MusicSpacePage />;
}
