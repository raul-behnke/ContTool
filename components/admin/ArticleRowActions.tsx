"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  id: number;
  status: string;
};

export function ArticleRowActions({ id, status }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function togglePublish() {
    setBusy(true);
    const next = status === "published" ? "draft" : "published";
    const res = await fetch(`/blog/api/articles/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Erro ao atualizar status");
  }

  async function onDelete() {
    if (!confirm("Deletar este artigo?")) return;
    setBusy(true);
    const res = await fetch(`/blog/api/articles/${id}`, { method: "DELETE" });
    setBusy(false);
    if (res.ok) router.refresh();
    else alert("Erro ao deletar");
  }

  return (
    <span style={{ display: "inline-flex", gap: 8 }}>
      <Link href={`/admin/articles/${id}/edit`}>Editar</Link>
      <button type="button" disabled={busy} onClick={togglePublish}>
        {status === "published" ? "Despublicar" : "Publicar"}
      </button>
      <button type="button" disabled={busy} onClick={onDelete} style={{ color: "crimson" }}>
        Deletar
      </button>
    </span>
  );
}
