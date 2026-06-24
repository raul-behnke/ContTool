import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ArticleRowActions } from "@/components/admin/ArticleRowActions";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminHome() {
  const session = await auth();
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 font-sans text-[#1f2937]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0D5B49]">Artigos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Olá, {session?.user?.name ?? "—"}
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1 rounded-lg bg-[#045E4C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D5B49]"
        >
          + Novo artigo
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#d6e4df] bg-white shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#d6e4df] bg-[#f6f9f8] text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Categorias</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr
                  key={a.id}
                  className="border-b border-[#eef3f1] last:border-0 hover:bg-[#f6f9f8]/60"
                >
                  <td className="px-4 py-3 font-medium text-[#1f2937]">{a.title}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        a.status === "published"
                          ? "bg-[#67D46B]/20 text-[#0D5B49]"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {a.status === "published" ? "Publicado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {a.categories.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center rounded-full bg-[#045E4C]/8 px-2 py-0.5 text-xs text-[#045E4C]"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {(a.publishedAt ?? a.createdAt).toISOString().slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <ArticleRowActions id={a.id} status={a.status} />
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    Nenhum artigo ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
