import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleEditor from "@/components/admin/ArticleEditor";

export const metadata = { robots: { index: false, follow: false } };

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await prisma.article.findUnique({
    where: { id: Number(id) },
    include: { categories: true },
  });
  if (!article) notFound();

  return (
    <ArticleEditor
      init={{
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        contentMd: article.contentMd,
        status: article.status,
        coverImage: article.coverImage,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        categoryIds: article.categories.map((c) => c.id),
      }}
    />
  );
}
