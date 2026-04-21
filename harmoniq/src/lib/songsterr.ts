const SONGSTERR_API = "https://www.songsterr.com/a/ra/songs.json";

export interface SongsterrResult {
  id: number;
  title: string;
  artist: { name: string };
}

/**
 * Search Songsterr for a song. Returns the songId of the first match,
 * or null if nothing found.
 */
export async function searchSong(
  query: string
): Promise<number | null> {
  try {
    const url = `${SONGSTERR_API}?pattern=${encodeURIComponent(query)}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return null;
    const data: SongsterrResult[] = await res.json();
    return data.length > 0 ? data[0].id : null;
  } catch {
    return null;
  }
}

export function songsterrPlayerUrl(songId: number): string {
  return `https://www.songsterr.com/a/wa/song?id=${songId}`;
}

export function songsterrSearchUrl(query: string): string {
  return `https://www.songsterr.com/a/wa/search?pattern=${encodeURIComponent(query)}`;
}
