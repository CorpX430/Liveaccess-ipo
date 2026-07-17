import { Router } from "express";

const router = Router();

const NEWS_API_KEY = "a08656f1a1e84e0da2d3f9c2d5116b66";

// Cache news for 10 minutes to avoid rate limits
let newsCache: { articles: any[]; ts: number } | null = null;

// GET /api/news — space & finance headlines
router.get("/news", async (_req, res): Promise<void> => {
  // Return cache if fresh
  if (newsCache && Date.now() - newsCache.ts < 10 * 60 * 1000) {
    res.json({ articles: newsCache.articles });
    return;
  }

  try {
    // Fetch space + SpaceX + stock market news
    const queries = [
      `q=SpaceX+IPO&sortBy=publishedAt&pageSize=6&language=en`,
      `q=space+exploration+stock&sortBy=publishedAt&pageSize=6&language=en`,
    ];

    const results = (await Promise.all(
      queries.map((q) =>
        fetch(`https://newsapi.org/v2/everything?${q}&apiKey=${NEWS_API_KEY}`)
          .then((r) => (r.ok ? r.json() : { articles: [] }))
          .catch(() => ({ articles: [] }))
      )
    )) as Array<{ articles?: any[] }>;

    const allArticles: any[] = [];
    const seen = new Set<string>();
    for (const result of results) {
      for (const a of result.articles ?? []) {
        if (!a.title || a.title === "[Removed]") continue;
        if (seen.has(a.url)) continue;
        seen.add(a.url);
        allArticles.push({
          title: a.title,
          description: a.description,
          url: a.url,
          urlToImage: a.urlToImage,
          publishedAt: a.publishedAt,
          source: a.source?.name ?? "Unknown",
          author: a.author,
        });
      }
    }

    // Sort by date, newest first
    allArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    newsCache = { articles: allArticles.slice(0, 12), ts: Date.now() };
    res.json({ articles: newsCache.articles });
  } catch (err) {
    console.error("[news] Failed to fetch news:", err);
    res.status(500).json({ error: "Failed to fetch news." });
  }
});

export default router;
