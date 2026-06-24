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
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Link
        href={`/admin/articles/${id}/edit`}
        className="rounded-md border border-[#d6e4df] bg-white px-2.5 py-1 text-xs font-medium text-[#1f2937] transition hover:border-[#045E4C] hover:text-[#045E4C]"
      >
        Editar
      </Link>
      <button
        type="button"
        disabled={busy}
        onClick={togglePublish}
        className="rounded-md border border-[#d6e4df] bg-white px-2.5 py-1 text-xs font-medium text-[#045E4C] transition hover:bg-[#f6f9f8] disabled:opacity-50"
      >
        {status === "published" ? "Despublicar" : "Publicar"}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onDelete}
        className="rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        Deletar
      </button>
    </span>
  );
}
