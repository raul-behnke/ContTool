import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getByCategory, getCategories } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";

export const revalidate = 60;

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  return {
    title: cat ? cat.name : "Categoria",
    description: cat
      ? `Artigos na categoria ${cat.name}.`
      : "Categoria não encontrada.",
    alternates: { canonical: `/blog/categoria/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cats = await getCategories();
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const articles = await getByCategory(slug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">
          Categoria
        </p>
        <h1 className="mt-1 text-3xl font-extrabold text-gray-900">
          {cat.name}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {articles.length} artigo(s)
        </p>
      </header>

      {articles.length === 0 ? (
        <p className="text-gray-500">Nenhum artigo nesta categoria.</p>
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
