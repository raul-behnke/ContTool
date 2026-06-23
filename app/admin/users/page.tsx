"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type User = { id: string; name: string; email: string };

export default function UsersPage() {
  const [items, setItems] = useState<User[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function load() {
    const res = await fetch("/blog/api/users");
    if (res.ok) setItems(await res.json());
  }
  useEffect(() => {
    load();
  }, []);

  function reset() {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
  }

  async function submit() {
    setError("");
    if (editId) {
      const body: Record<string, string> = { name, email };
      if (password) body.password = password;
      const res = await fetch(`/blog/api/users/${editId}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        reset();
        load();
      } else setError((await res.json().catch(() => ({}))).error ?? "Erro");
    } else {
      const res = await fetch("/blog/api/users", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        reset();
        load();
      } else setError((await res.json().catch(() => ({}))).error ?? "Erro");
    }
  }

  async function remove(id: string) {
    if (!confirm("Deletar usuário?")) return;
    setError("");
    const res = await fetch(`/blog/api/users/${id}`, { method: "DELETE" });
    if (res.ok) load();
    else setError((await res.json().catch(() => ({}))).error ?? "Erro ao deletar");
  }

  return (
    <main style={{ maxWidth: 640, margin: "40px auto", fontFamily: "system-ui", padding: "0 16px" }}>
      <Link href="/admin">← Painel</Link>
      <h1>Usuários</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gap: 8, margin: "16px 0", maxWidth: 360 }}>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ padding: 8 }} />
        <input
          placeholder={editId ? "Nova senha (opcional)" : "Senha"}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 8 }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={submit}>{editId ? "Salvar" : "Criar"}</button>
          {editId && <button onClick={reset}>Cancelar</button>}
        </div>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((u) => (
          <li
            key={u.id}
            style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid #eee" }}
          >
            <span style={{ flex: 1 }}>
              {u.name} <small style={{ color: "#888" }}>{u.email}</small>
            </span>
            <button
              onClick={() => {
                setEditId(u.id);
                setName(u.name);
                setEmail(u.email);
                setPassword("");
              }}
            >
              Editar
            </button>
            <button onClick={() => remove(u.id)} style={{ color: "crimson" }}>
              Deletar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
