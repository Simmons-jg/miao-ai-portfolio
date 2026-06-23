import { Suspense } from "react";
import { VideoRoomPage } from "@/components/VideoRoomPage";

export default function VedioAliasPage() {
  return (
    <Suspense fallback={null}>
      <VideoRoomPage />
    </Suspense>
  );
}
