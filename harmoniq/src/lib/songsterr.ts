export interface SongsterrResult {
  id: number;
  title: string;
  artist: { name: string; id?: number };
  chordsPresent: boolean;
  hasPlayer?: boolean;
  tabTypes?: string[];
}

/**
 * Search Songsterr via our server-side proxy (avoids CORS issues).
 * Returns all matching results.
 */
export async function searchSongs(
  query: string,
): Promise<SongsterrResult[]> {
  try {
    const res = await fetch(
      `/api/songsterr/search?q=${encodeURIComponent(query)}`,
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

/**
 * Search Songsterr — returns the first match or null.
 */
export async function searchSong(
  query: string,
): Promise<SongsterrResult | null> {
  const results = await searchSongs(query);
  return results.length > 0 ? results[0] : null;
}

/**
 * Try title+artist first, then title-only as fallback.
 */
export async function searchSongByTitleAndArtist(
  title: string,
  artist: string,
): Promise<SongsterrResult | null> {
  const combined = await searchSong(`${title} ${artist}`);
  if (combined) return combined;
  return searchSong(title);
}

export function getSongsterrEmbedUrl(songId: number): string {
  return `https://www.songsterr.com/a/wa/song?id=${songId}`;
}

export function getSongsterrSearchUrl(query: string): string {
  return `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(query)}`;
}

// Keep the old name around so existing imports don't break
export const songsterrSearchUrl = getSongsterrSearchUrl;
export const songsterrPlayerUrl = getSongsterrEmbedUrl;
