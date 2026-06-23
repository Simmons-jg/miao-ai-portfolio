import { Suspense } from "react";
import { VideoRoomPage } from "@/components/VideoRoomPage";

export default function MusicVideoAliasPage() {
  return (
    <Suspense fallback={null}>
      <VideoRoomPage />
    </Suspense>
  );
}
