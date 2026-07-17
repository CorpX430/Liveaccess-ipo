import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { SideNav } from "@/components/SideNav";
import { useTheme } from "@/contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
import { Clock, ExternalLink, Newspaper } from "lucide-react";

interface Article {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: string;
  author: string | null;
}

function useNews() {
  return useQuery<{ articles: Article[] }>({
    queryKey: ["news"],
    queryFn: async () => {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/news`);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    refetchInterval: 10 * 60 * 1000, // every 10 min
    staleTime: 5 * 60 * 1000,
  });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function News() {
  const [, setLocation] = useLocation();
  const userRaw = localStorage.getItem("spcx_user");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const { isDark } = useTheme();

  useEffect(() => {
    if (!user) setLocation("/signin");
  }, [user, setLocation]);

  const { data, isLoading } = useNews();
  const articles = data?.articles ?? [];

  if (!user) return null;

  const bg = isDark ? "bg-[#050a0f]" : "bg-[#f5f7fa]";
  const headerBg = isDark ? "bg-[#050a0f]/80 border-white/10" : "bg-white/80 border-black/10";
  const cardBg = isDark ? "bg-[#0a0f16] border-white/10 hover:border-white/20" : "bg-white border-black/10 hover:border-black/20";
  const textMuted = isDark ? "text-white/50" : "text-black/50";
  const textMain = isDark ? "text-white" : "text-black";

  return (
    <div className={`min-h-[100dvh] ${bg} ${textMain}`}>
      <header className={`h-16 border-b ${headerBg} backdrop-blur-md flex items-center px-4 sticky top-0 z-40`}>
        <SideNav />
        <span className="ml-4 font-display tracking-widest font-bold text-lg uppercase">Market News</span>
        <div className={`ml-auto flex items-center gap-2 text-xs uppercase tracking-widest font-display ${textMuted}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live Feed
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold uppercase tracking-widest mb-2">Space & Markets</h1>
          <p className={`${textMuted} text-sm tracking-wide`}>Real-time coverage of SpaceX, aerospace, and capital markets.</p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${cardBg} border animate-pulse`}>
                <div className="aspect-video bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-full" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-24 space-y-4">
            <Newspaper className={`w-16 h-16 mx-auto ${textMuted}`} />
            <p className={`${textMuted} text-lg`}>No news articles available at this time.</p>
            <p className={`${textMuted} text-sm`}>Check back shortly — the feed refreshes every 10 minutes.</p>
          </div>
        )}

        {/* Hero article */}
        {!isLoading && articles.length > 0 && (
          <div className="space-y-6">
            <a
              href={articles[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className={`block border ${cardBg} transition-colors group overflow-hidden md:flex`}
            >
              {articles[0].urlToImage && (
                <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden shrink-0">
                  <img
                    src={articles[0].urlToImage}
                    alt={articles[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <div className={`flex items-center gap-2 mb-4 text-xs uppercase tracking-widest font-display ${textMuted}`}>
                    <span className="text-primary font-bold">{articles[0].source}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(articles[0].publishedAt)}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-wide leading-tight mb-4 group-hover:text-primary transition-colors">
                    {articles[0].title}
                  </h2>
                  {articles[0].description && (
                    <p className={`${textMuted} text-sm leading-relaxed line-clamp-3`}>{articles[0].description}</p>
                  )}
                </div>
                <div className={`mt-6 flex items-center gap-2 text-xs font-display uppercase tracking-widest ${textMuted} group-hover:text-primary transition-colors`}>
                  Read Full Story <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>

            {/* Grid of remaining articles */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.slice(1).map((article, i) => (
                <a
                  key={i}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block border ${cardBg} transition-colors group overflow-hidden`}
                >
                  {article.urlToImage && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className={`flex items-center gap-2 mb-3 text-xs uppercase tracking-widest font-display ${textMuted}`}>
                      <span className="text-primary font-bold truncate">{article.source}</span>
                      <span className="shrink-0">·</span>
                      <span className="shrink-0">{timeAgo(article.publishedAt)}</span>
                    </div>
                    <h3 className="font-display font-bold text-base uppercase tracking-wide leading-tight line-clamp-3 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
