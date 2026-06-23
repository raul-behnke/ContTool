import Link from "next/link";
import type { ArticleWithCategories } from "@/lib/articles";

const FALLBACK_COVER = "/blog/uploads/feimec-2026.webp";

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function ArticleCard({ article }: { article: ArticleWithCategories }) {
  const cat = article.categories[0];
  const cover = article.coverImage ?? FALLBACK_COVER;
  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        {/* coverImage already includes /blog prefix; <img> is not basePath-prefixed */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={article.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
        {cat && (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            {cat.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs uppercase tracking-wide text-gray-500">
          {fmtDate(article.publishedAt)}
        </time>
        <h3 className="mt-2 text-lg font-bold leading-snug text-gray-900 group-hover:text-brand">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-gray-600">
          {article.excerpt}
        </p>
        <span className="mt-4 text-sm font-semibold text-brand">
          Ler artigo →
        </span>
      </div>
    </Link>
  );
}
