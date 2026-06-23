import { NextResponse } from "next/server";
import path from "path";
import { mkdir } from "fs/promises";
import sharp from "sharp";
import { auth } from "@/auth";
import { slugify } from "@/lib/admin";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file required" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());

  const base = file.name.replace(/\.[^.]+$/, "");
  const safeName = `${slugify(base) || "img"}-${Date.now().toString(36)}`;

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const outPath = path.join(dir, `${safeName}.webp`);

  await sharp(buf)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(outPath);

  return NextResponse.json({ url: `/blog/uploads/${safeName}.webp` });
}
