import type { Metadata } from "next";
import { getPublished, searchPublished } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Artigos",
  description: "Todos os artigos do blog CONT.TOOL.",
  alternates: { canonical: "/blog/artigos" },
};

export default async function ArtigosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const articles = query ? await searchPublished(query) : await getPublished();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Artigos</h1>
        <form action="/artigos" method="get" className="mt-5 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Buscar artigos..."
            aria-label="Buscar artigos"
            className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          />
        </form>
        {query && (
          <p className="mt-4 text-sm text-gray-600">
            Resultados para &quot;{query}&quot;: {articles.length} artigo(s)
          </p>
        )}
      </header>

      {articles.length === 0 ? (
        <p className="text-gray-500">Nenhum artigo encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      )}
    </div>
  );
}
