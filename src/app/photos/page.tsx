import type { Metadata } from "next";
import { TimeChannelNative } from "@/components/TimeChannelNative";
import { roomTitle } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: roomTitle("Images"),
};

export default function PhotosPage() {
  return <TimeChannelNative />;
}
