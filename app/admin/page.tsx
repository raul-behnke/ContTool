import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/admin/LogoutButton";
import { ArticleRowActions } from "@/components/admin/ArticleRowActions";

export const metadata = { robots: { index: false, follow: false } };

export default async function AdminHome() {
  const session = await auth();
  const articles = await prisma.article.findMany({
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  return (
    <main style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "system-ui", padding: "0 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Painel</h1>
        <LogoutButton />
      </div>
      <p>Olá, {session?.user?.name ?? "—"}</p>

      <nav style={{ display: "flex", gap: 16, margin: "16px 0" }}>
        <Link href="/admin/articles/new">+ Novo artigo</Link>
        <Link href="/admin/categories">Categorias</Link>
        <Link href="/admin/users">Usuários</Link>
      </nav>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
            <th style={{ padding: 8 }}>Título</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}>Categorias</th>
            <th style={{ padding: 8 }}>Data</th>
            <th style={{ padding: 8 }}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: 8 }}>{a.title}</td>
              <td style={{ padding: 8 }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: 12,
                    fontSize: 12,
                    background: a.status === "published" ? "#dcfce7" : "#fef9c3",
                    color: a.status === "published" ? "#166534" : "#854d0e",
                  }}
                >
                  {a.status === "published" ? "publicado" : "rascunho"}
                </span>
              </td>
              <td style={{ padding: 8 }}>{a.categories.map((c) => c.name).join(", ")}</td>
              <td style={{ padding: 8 }}>
                {(a.publishedAt ?? a.createdAt).toISOString().slice(0, 10)}
              </td>
              <td style={{ padding: 8 }}>
                <ArticleRowActions id={a.id} status={a.status} />
              </td>
            </tr>
          ))}
          {articles.length === 0 && (
            <tr>
              <td colSpan={5} style={{ padding: 16, color: "#666" }}>
                Nenhum artigo ainda.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
