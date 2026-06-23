import { prisma } from "@/lib/prisma";
import type { Article, Category } from "@prisma/client";

export type ArticleWithCategories = Article & { categories: Category[] };

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export async function getPublished(): Promise<ArticleWithCategories[]> {
  return prisma.article.findMany({
    where: { status: "published" },
    orderBy: { publishedAt: "desc" },
    include: { categories: true },
  });
}

export async function getBySlug(
  slug: string
): Promise<ArticleWithCategories | null> {
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { categories: true },
  });
  if (!article || article.status !== "published") return null;
  return article;
}

export async function getByCategory(
  catSlug: string
): Promise<ArticleWithCategories[]> {
  return prisma.article.findMany({
    where: {
      status: "published",
      categories: { some: { slug: catSlug } },
    },
    orderBy: { publishedAt: "desc" },
    include: { categories: true },
  });
}

export async function getCategories(): Promise<Category[]> {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function searchPublished(
  q: string
): Promise<ArticleWithCategories[]> {
  const needle = norm(q.trim());
  if (!needle) return getPublished();
  const all = await getPublished();
  return all.filter((a) =>
    norm(`${a.title} ${a.excerpt} ${a.contentMd}`).includes(needle)
  );
}
