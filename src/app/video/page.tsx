import { Suspense } from "react";
import { VideoRoomPage } from "@/components/VideoRoomPage";

export default function VideoAliasPage() {
  return (
    <Suspense fallback={null}>
      <VideoRoomPage />
    </Suspense>
  );
}
