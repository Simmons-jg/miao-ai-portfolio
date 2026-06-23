import type { Metadata } from "next";
import { Suspense } from "react";
import { VideoRoomPage } from "@/components/VideoRoomPage";
import { roomTitle } from "@/lib/siteMeta";

export const metadata: Metadata = {
  title: roomTitle("Video"),
};

export default function VideosPage() {
  return (
    <Suspense fallback={null}>
      <VideoRoomPage />
    </Suspense>
  );
}
