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
    <main style={{ maxWidth: 360, margin: "80px auto", fontFamily: "system-ui" }}>
      <h1>Entrar</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Entrar</button>
        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>
    </main>
  );
}
