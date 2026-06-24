"use client";

import { useEffect, useState } from "react";

type User = { id: string; name: string; email: string };

const inputClass =
  "w-full rounded-lg border border-[#d6e4df] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#045E4C] focus:ring-2 focus:ring-[#045E4C]/30";

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
    <main className="mx-auto max-w-2xl px-4 py-8 font-sans text-[#1f2937]">
      <h1 className="mb-6 text-2xl font-bold text-[#0D5B49]">Usuários</h1>
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mb-6 rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
        <h2 className="mb-4 text-sm font-semibold text-[#045E4C]">
          {editId ? "Editar usuário" : "Novo usuário"}
        </h2>
        <div className="grid gap-3 sm:max-w-sm">
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
          <input
            placeholder={editId ? "Nova senha (opcional)" : "Senha"}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
          <div className="flex gap-2">
            <button
              onClick={submit}
              className="rounded-lg bg-[#045E4C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0D5B49]"
            >
              {editId ? "Salvar" : "Criar"}
            </button>
            {editId && (
              <button
                onClick={reset}
                className="rounded-lg border border-[#d6e4df] px-4 py-2 text-sm font-medium text-[#1f2937] transition hover:bg-[#f6f9f8]"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <ul className="divide-y divide-[#eef3f1] overflow-hidden rounded-2xl border border-[#d6e4df] bg-white shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
        {items.map((u) => (
          <li key={u.id} className="flex items-center gap-2 px-5 py-3">
            <span className="flex-1">
              {u.name}{" "}
              <small className="text-gray-400">{u.email}</small>
            </span>
            <button
              onClick={() => {
                setEditId(u.id);
                setName(u.name);
                setEmail(u.email);
                setPassword("");
              }}
              className="rounded-lg border border-[#d6e4df] px-3 py-1.5 text-sm font-medium text-[#1f2937] transition hover:border-[#045E4C] hover:text-[#045E4C]"
            >
              Editar
            </button>
            <button
              onClick={() => remove(u.id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              Deletar
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-5 py-10 text-center text-gray-400">
            Nenhum usuário ainda.
          </li>
        )}
      </ul>
    </main>
  );
}
