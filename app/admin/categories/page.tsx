"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = { id: number; name: string; slug: string };

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
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui", padding: "0 16px" }}>
      <Link href="/admin">← Painel</Link>
      <h1>Categorias</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
        <input
          placeholder="Nova categoria"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={create}>Criar</button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((c) => (
          <li
            key={c.id}
            style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" }}
          >
            {editId === c.id ? (
              <>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ flex: 1, padding: 6 }} />
                <button onClick={() => rename(c.id)}>Salvar</button>
                <button onClick={() => setEditId(null)}>Cancelar</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1 }}>
                  {c.name} <small style={{ color: "#888" }}>/{c.slug}</small>
                </span>
                <button
                  onClick={() => {
                    setEditId(c.id);
                    setEditName(c.name);
                  }}
                >
                  Renomear
                </button>
                <button onClick={() => remove(c.id)} style={{ color: "crimson" }}>
                  Deletar
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
