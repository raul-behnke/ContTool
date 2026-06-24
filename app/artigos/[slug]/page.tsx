import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBySlug, getPublished } from "@/lib/articles";
import { SafeMarkdown } from "@/components/SafeMarkdown";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getPublished();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getBySlug(slug);
  if (!article) return { title: "Artigo não encontrado" };

  return {
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.excerpt,
    alternates: { canonical: `/blog/artigos/${slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.excerpt,
      publishedTime: article.publishedAt?.toISOString(),
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

function fmtDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getBySlug(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      {article.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.coverImage}
          alt={article.title}
          className="mb-8 aspect-[16/9] w-full rounded-xl object-cover"
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {article.categories.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-2"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 sm:text-4xl">
        {article.title}
      </h1>

      <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
        <span>{article.authorName}</span>
        <span>·</span>
        <time>{fmtDate(article.publishedAt)}</time>
        {article.readingTime > 0 && (
          <>
            <span>·</span>
            <span>{article.readingTime} min de leitura</span>
          </>
        )}
      </div>

      <div className="mt-8">
        <SafeMarkdown content={article.contentMd} />
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link href="/artigos" className="text-sm font-semibold text-brand hover:underline">
          ← Voltar para artigos
        </Link>
      </div>
    </article>
  );
}
