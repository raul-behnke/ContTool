import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readingTime(contentMd: string): number {
  const words = contentMd.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// Strip markdown to plain text for excerpt generation
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Revalidate all paths affected by an article change.
export async function revalidateArticle(slug?: string): Promise<void> {
  revalidatePath("/");
  revalidatePath("/artigos");
  if (slug) revalidatePath("/artigos/" + slug, "page");
  // Revalidate every category page (cheap; few categories)
  const cats = await prisma.category.findMany({ select: { slug: true } });
  for (const c of cats) revalidatePath("/categoria/" + c.slug, "page");
}
