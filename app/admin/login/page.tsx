"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) setError("Credenciais inválidas");
    else window.location.href = "/blog/admin";
  }
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f6f9f8] px-4 py-12 font-sans text-[#1f2937]">
      <div className="w-full max-w-sm rounded-2xl border border-[#d6e4df] bg-white p-8 shadow-[0_8px_30px_rgba(4,94,76,0.08)]">
        <div className="mb-6 text-center">
          <span className="text-2xl font-extrabold tracking-tight text-[#045E4C]">
            CONT<span className="text-[#67D46B]">.</span>TOOL
          </span>
        </div>
        <h1 className="mb-6 text-center text-xl font-semibold text-[#1f2937]">
          Entrar no Painel
        </h1>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[#1f2937]">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              placeholder="voce@empresa.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#d6e4df] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#045E4C] focus:ring-2 focus:ring-[#045E4C]/30"
            />
          </div>
          <div className="grid gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-[#1f2937]">
              Senha
            </label>
            <input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#d6e4df] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#045E4C] focus:ring-2 focus:ring-[#045E4C]/30"
            />
          </div>
          <button
            type="submit"
            className="mt-2 w-full rounded-lg bg-[#045E4C] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0D5B49] focus:outline-none focus:ring-2 focus:ring-[#045E4C]/40"
          >
            Entrar
          </button>
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
