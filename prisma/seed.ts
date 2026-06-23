import { prisma } from "@/lib/prisma";
import puppeteer from "puppeteer-core";
import TurndownService from "turndown";
import { gfm } from "turndown-plugin-gfm";
import sharp from "sharp";
import bcrypt from "bcryptjs";
import path from "node:path";
import fs from "node:fs/promises";

const CHROME =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const BASE = "https://conttool.com/blog/artigos";

type Meta = { slug: string; date: string; category: string };

// DD/MM/YYYY → one category each.
const ARTICLES: Meta[] = [
  { slug: "superciclo-do-tungstenio-2026", date: "11/06/2026", category: "Redução de Custos" },
  { slug: "5s-na-industria", date: "24/04/2026", category: "Gestão de Ferramentas" },
  { slug: "feimec-2026", date: "01/05/2026", category: "Indústria 4.0" },
  { slug: "como-a-automacao-contabil-pode-transformar-seu-negocio", date: "05/06/2024", category: "Tecnologia e Inovação" },
  { slug: "dicas-para-reduzir-o-consumo-de-ferramentas", date: "05/06/2024", category: "Redução de Custos" },
  { slug: "beneficios-da-automacao-na-gestao-de-insumos", date: "05/06/2024", category: "Gestão de Ferramentas" },
  { slug: "melhores-practicas-para-evitar-estoque-desequilibrado", date: "05/06/2024", category: "Redução de Custos" },
  { slug: "vantagens-do-uso-de-gaveteiros-inteligentes", date: "05/06/2024", category: "Tecnologia e Inovação" },
  { slug: "como-a-cont-tool-pode-ajudar-na-gestao-de-inventario", date: "05/06/2024", category: "Otimização de Operações" },
];

const CATEGORIES = [
  "Redução de Custos",
  "Gestão de Ferramentas",
  "Tecnologia e Inovação",
  "Otimização de Operações",
  "Indústria 4.0",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function parseDate(ddmmyyyy: string): Date {
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Scraped = {
  title: string | null;
  excerpt: string | null;
  cover: string | null;
  contentHtml: string;
  textLen: number;
};

async function scrape(page: any, slug: string): Promise<Scraped> {
  const url = `${BASE}/${slug}`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await sleep(3500);
  return page.evaluate(() => {
    const text = (el: Element | null) =>
      el ? (el as HTMLElement).innerText?.trim() || null : null;
    const metaContent = (sel: string) =>
      (document.querySelector(sel) as HTMLMetaElement | null)?.content?.trim() ||
      null;

    const h1 = document.querySelector("h1");
    const title = text(h1) || metaContent('meta[property="og:title"]');
    const excerpt =
      metaContent('meta[name="description"]') ||
      metaContent('meta[property="og:description"]');
    const cover = metaContent('meta[property="og:image"]');

    // pick element with the MOST <p> descendants among candidates
    const sels = ["article", "main", "[class*=prose]", "[class*=content]"];
    const candidates: Element[] = [];
    for (const s of sels)
      document.querySelectorAll(s).forEach((e) => candidates.push(e));
    let best: Element | null = null;
    let bestP = -1;
    for (const c of candidates) {
      const pc = c.querySelectorAll("p").length;
      if (pc > bestP) {
        bestP = pc;
        best = c;
      }
    }
    const contentHtml = best ? best.innerHTML : "";
    const textLen = best ? (best as HTMLElement).innerText.trim().length : 0;
    return { title, excerpt, cover, contentHtml, textLen };
  });
}

async function handleCover(
  cover: string | null,
  slug: string
): Promise<string | null> {
  if (!cover) return null;
  let u: URL;
  try {
    u = new URL(cover);
  } catch {
    return null;
  }
  if (u.hostname === "conttool.com") {
    let p = u.pathname;
    if (!p.startsWith("/blog/")) p = "/blog" + (p.startsWith("/") ? p : "/" + p);
    return p;
  }
  // external → download + rehost
  const res = await fetch(cover);
  if (!res.ok) {
    console.log(`  [cover] external fetch failed ${res.status} for ${slug}`);
    return null;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const outDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(outDir, { recursive: true });
  await sharp(buf)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(path.join(outDir, `${slug}.webp`));
  return `/blog/uploads/${slug}.webp`;
}

async function main() {
  // 1. categories
  for (const name of CATEGORIES) {
    const slug = slugify(name);
    await prisma.category.upsert({
      where: { name },
      update: { slug },
      create: { name, slug },
    });
  }
  console.log(`[categories] upserted ${CATEGORIES.length}`);

  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });
  td.use(gfm);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const failures: string[] = [];
  try {
    const page = await browser.newPage();
    // tsx/esbuild injects a __name helper into evaluate() bodies; shim it in-page.
    await page.evaluateOnNewDocument(() => {
      // @ts-ignore
      window.__name = (fn: unknown) => fn;
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    );
    for (const art of ARTICLES) {
      const s = await scrape(page, art.slug);
      const contentMd = s.contentHtml
        ? td.turndown(s.contentHtml).trim()
        : "";
      console.log(
        `[scrape] ${art.slug} :: html=${s.contentHtml.length} md=${contentMd.length} text=${s.textLen}`
      );
      if (contentMd.length <= 300) failures.push(art.slug);

      const cat = await prisma.category.findUnique({
        where: { name: art.category },
      });
      if (!cat) throw new Error(`category missing: ${art.category}`);

      const coverImage = await handleCover(s.cover, art.slug);

      const words = contentMd.split(/\s+/).filter(Boolean).length;
      const readingTime = Math.max(1, Math.round(words / 220));

      const title = s.title || art.slug;
      const excerpt =
        s.excerpt ||
        contentMd.replace(/[#*`>\-\[\]()!]/g, "").trim().slice(0, 160);

      await prisma.article.upsert({
        where: { slug: art.slug },
        update: {
          title,
          excerpt,
          contentMd,
          status: "published",
          publishedAt: parseDate(art.date),
          authorName: "Equipe Editorial",
          readingTime,
          coverImage,
          categories: { set: [], connect: [{ id: cat.id }] },
        },
        create: {
          slug: art.slug,
          title,
          excerpt,
          contentMd,
          status: "published",
          publishedAt: parseDate(art.date),
          authorName: "Equipe Editorial",
          readingTime,
          coverImage,
          categories: { connect: [{ id: cat.id }] },
        },
      });
    }
  } finally {
    await browser.close();
  }

  // admin from env
  const email = process.env.ADMIN_EMAIL;
  const name = process.env.ADMIN_NAME;
  const pwd = process.env.ADMIN_PASSWORD;
  if (!email || !name || !pwd) {
    throw new Error("Missing ADMIN_NAME/ADMIN_EMAIL/ADMIN_PASSWORD in env");
  }
  const passwordHash = await bcrypt.hash(pwd, 10);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  });
  console.log(`[admin] upserted user ${email}`);

  if (failures.length) {
    console.log(`[WARN] short/empty content for: ${failures.join(", ")}`);
  }
  console.log("[done]");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
