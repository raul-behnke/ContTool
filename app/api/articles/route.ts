import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, readingTime, revalidateArticle } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });
  return NextResponse.json(articles);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const title: string = (body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  let slug: string = body.slug ? slugify(body.slug) : slugify(title);
  if (!slug) slug = "artigo-" + Date.now();

  // ensure unique slug
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now().toString(36)}`;

  const status: string = body.status === "published" ? "published" : "draft";
  const contentMd: string = body.contentMd ?? "";
  const categoryIds: number[] = Array.isArray(body.categoryIds) ? body.categoryIds : [];

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      excerpt: body.excerpt ?? "",
      contentMd,
      status,
      coverImage: body.coverImage || null,
      seoTitle: body.seoTitle || null,
      seoDescription: body.seoDescription || null,
      readingTime: readingTime(contentMd),
      authorName: session.user?.name ?? "Autor",
      authorId: (session.user as { id?: string })?.id ?? null,
      publishedAt: status === "published" ? new Date() : null,
      categories: { connect: categoryIds.map((id) => ({ id })) },
    },
    include: { categories: true },
  });

  await revalidateArticle(article.slug);
  return NextResponse.json(article, { status: 201 });
}
