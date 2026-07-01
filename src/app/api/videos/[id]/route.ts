import { createReadStream, statSync } from "node:fs";
import { Readable } from "node:stream";
import { NextRequest } from "next/server";
import { getCanonicalVideoWorkId } from "@/lib/videoCatalog";
import { getVideoSource } from "@/lib/videoSources";

export const runtime = "nodejs";

const CHUNK_SIZE = 1024 * 1024;
const RELEASE_VIDEO_BASE_URL =
  "https://github.com/Simmons-jg/miao-ai-portfolio/releases/download/video-assets-1080p-v1";

function getPublicVideoUrl(id: string) {
  const configuredBaseUrl = process.env.VIDEO_PUBLIC_BASE_URL?.replace(/\/+$/, "");
  const baseUrl =
    configuredBaseUrl && !configuredBaseUrl.includes("blob.vercel-storage.com")
      ? configuredBaseUrl
      : RELEASE_VIDEO_BASE_URL;

  return `${baseUrl}/${id}.mp4`;
}

function getBoundedRange(range: string | null) {
  const fallbackEnd = CHUNK_SIZE - 1;

  if (!range) {
    return `bytes=0-${fallbackEnd}`;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match) {
    return `bytes=0-${fallbackEnd}`;
  }

  const [, startText, endText] = match;
  if (!startText) {
    return range;
  }

  const start = Number.parseInt(startText, 10);
  const requestedEnd = endText ? Number.parseInt(endText, 10) : start + fallbackEnd;
  const end = Math.min(
    Number.isNaN(requestedEnd) ? start + fallbackEnd : requestedEnd,
    start + fallbackEnd,
  );

  if (Number.isNaN(start) || Number.isNaN(end) || start > end) {
    return `bytes=0-${fallbackEnd}`;
  }

  return `bytes=${start}-${end}`;
}

async function proxyPublicVideo(publicVideoUrl: string, range: string | null) {
  const upstreamRange = getBoundedRange(range);
  const upstream = await fetch(publicVideoUrl, {
    headers: {
      Range: upstreamRange,
    },
    cache: "no-store",
    redirect: "follow",
  });

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    "Content-Type": "video/mp4",
  });

  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  if (contentRange) {
    headers.set("Content-Range", contentRange);
  }

  if (!upstream.ok) {
    return new Response("Video source is unavailable", {
      status: upstream.status,
      headers,
    });
  }

  return new Response(upstream.body, {
    status: contentRange ? 206 : upstream.status,
    headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const canonicalId = getCanonicalVideoWorkId(id);
  const source = getVideoSource(canonicalId);

  if (!source) {
    return new Response("Video not found", { status: 404 });
  }

  let size = 0;
  try {
    size = statSync(source).size;
  } catch {
    const publicVideoUrl = getPublicVideoUrl(canonicalId);
    if (publicVideoUrl) {
      return proxyPublicVideo(publicVideoUrl, request.headers.get("range"));
    }

    return new Response("Video file is unavailable", { status: 404 });
  }

  const range = request.headers.get("range");
  if (!range) {
    const stream = Readable.toWeb(createReadStream(source));

    return new Response(stream as unknown as BodyInit, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": String(size),
        "Content-Type": "video/mp4",
      },
    });
  }

  const [startText, endText] = range.replace(/bytes=/, "").split("-");
  const start = Number.parseInt(startText, 10);
  const end = endText ? Number.parseInt(endText, 10) : Math.min(start + CHUNK_SIZE, size - 1);

  if (Number.isNaN(start) || Number.isNaN(end) || start >= size || end >= size || start > end) {
    return new Response("Invalid range", {
      status: 416,
      headers: {
        "Content-Range": `bytes */${size}`,
      },
    });
  }

  const stream = Readable.toWeb(createReadStream(source, { start, end }));

  return new Response(stream as unknown as BodyInit, {
    status: 206,
    headers: {
      "Accept-Ranges": "bytes",
      "Content-Length": String(end - start + 1),
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Type": "video/mp4",
    },
  });
}
