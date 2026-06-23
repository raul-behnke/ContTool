import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify, readingTime, revalidateArticle } from "@/lib/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const articleId = Number(id);
  const current = await prisma.article.findUnique({ where: { id: articleId } });
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

  const body = await request.json();
  const title: string = (body.title ?? current.title).trim();

  let slug: string = body.slug ? slugify(body.slug) : current.slug;
  if (!slug) slug = current.slug;
  if (slug !== current.slug) {
    const clash = await prisma.article.findUnique({ where: { slug } });
    if (clash && clash.id !== articleId) slug = `${slug}-${Date.now().toString(36)}`;
  }

  const status: string = body.status === "published" ? "published" : "draft";
  const contentMd: string = body.contentMd ?? current.contentMd;
  const categoryIds: number[] = Array.isArray(body.categoryIds) ? body.categoryIds : [];

  // manage publishedAt on status change
  let publishedAt = current.publishedAt;
  if (status === "published" && !current.publishedAt) publishedAt = new Date();
  if (status === "draft") publishedAt = null;

  const article = await prisma.article.update({
    where: { id: articleId },
    data: {
      title,
      slug,
      excerpt: body.excerpt ?? current.excerpt,
      contentMd,
      status,
      coverImage: body.coverImage !== undefined ? body.coverImage || null : current.coverImage,
      seoTitle: body.seoTitle !== undefined ? body.seoTitle || null : current.seoTitle,
      seoDescription:
        body.seoDescription !== undefined ? body.seoDescription || null : current.seoDescription,
      readingTime: readingTime(contentMd),
      publishedAt,
      categories: { set: [], connect: categoryIds.map((cid) => ({ id: cid })) },
    },
    include: { categories: true },
  });

  await revalidateArticle(article.slug);
  if (current.slug !== article.slug) await revalidateArticle(current.slug);
  return NextResponse.json(article);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id } = await params;
  const articleId = Number(id);
  const current = await prisma.article.findUnique({ where: { id: articleId } });
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });

  await prisma.article.delete({ where: { id: articleId } });
  await revalidateArticle(current.slug);
  return NextResponse.json({ ok: true });
}
