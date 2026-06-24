"use client";

import { useEffect, useState } from "react";

type Category = { id: number; name: string; slug: string };

const inputClass =
  "w-full rounded-lg border border-[#d6e4df] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#045E4C] focus:ring-2 focus:ring-[#045E4C]/30";

export default function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/blog/api/categories");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  async function create() {
    setError("");
    if (!name.trim()) return;
    const res = await fetch("/blog/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      setName("");
      load();
    } else setError((await res.json().catch(() => ({}))).error ?? "Erro");
  }

  async function rename(id: number) {
    setError("");
    const res = await fetch(`/blog/api/categories/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });
    if (res.ok) {
      setEditId(null);
      load();
    } else setError((await res.json().catch(() => ({}))).error ?? "Erro");
  }

  async function remove(id: number) {
    if (!confirm("Deletar categoria?")) return;
    const res = await fetch(`/blog/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else setError("Erro ao deletar");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 font-sans text-[#1f2937]">
      <h1 className="mb-6 text-2xl font-bold text-[#0D5B49]">Categorias</h1>
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
        <div className="flex gap-2">
          <input
            placeholder="Nova categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <button
            onClick={create}
            className="shrink-0 rounded-lg bg-[#045E4C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0D5B49]"
          >
            Criar
          </button>
        </div>
      </div>

      <ul className="divide-y divide-[#eef3f1] overflow-hidden rounded-2xl border border-[#d6e4df] bg-white shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
        {items.map((c) => (
          <li key={c.id} className="flex items-center gap-2 px-5 py-3">
            {editId === c.id ? (
              <>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={() => rename(c.id)}
                  className="shrink-0 rounded-lg bg-[#045E4C] px-3 py-1.5 text-sm font-medium text-white transition hover:bg-[#0D5B49]"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setEditId(null)}
                  className="shrink-0 rounded-lg border border-[#d6e4df] px-3 py-1.5 text-sm font-medium text-[#1f2937] transition hover:bg-[#f6f9f8]"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">
                  {c.name}{" "}
                  <small className="text-gray-400">/{c.slug}</small>
                </span>
                <button
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                  }}
                  className="rounded-lg border border-[#d6e4df] px-3 py-1.5 text-sm font-medium text-[#1f2937] transition hover:border-[#045E4C] hover:text-[#045E4C]"
                >
                  Renomear
                </button>
                <button
                  onClick={() => remove(c.id)}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Deletar
                </button>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-5 py-10 text-center text-gray-400">
            Nenhuma categoria ainda.
          </li>
        )}
      </ul>
    </main>
  );
}
