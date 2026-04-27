import { NextResponse, type NextRequest } from "next/server";

const SONGSTERR_API = "https://www.songsterr.com/a/ra/songs.json";
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

const cache = new Map<string, { data: unknown; ts: number }>();

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json(
      { error: "Missing ?q= query parameter" },
      { status: 400 },
    );
  }

  const cacheKey = q.toLowerCase();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const url = `${SONGSTERR_API}?pattern=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    cache.set(cacheKey, { data, ts: Date.now() });

    // Prune old entries when the cache gets large
    if (cache.size > 500) {
      const now = Date.now();
      for (const [key, entry] of cache) {
        if (now - entry.ts > CACHE_TTL_MS) cache.delete(key);
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[songsterr/search] Upstream error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
