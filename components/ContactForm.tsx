"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "ok" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const fd = new FormData(e.currentTarget);
    const payload = {
      nome_completo: String(fd.get("nome_completo") ?? ""),
      telefone_whatsapp: String(fd.get("telefone_whatsapp") ?? ""),
      email_corporativo: String(fd.get("email_corporativo") ?? ""),
      empresa: String(fd.get("empresa") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus(res.ok ? "ok" : "error");
      if (res.ok) (e.target as HTMLFormElement).reset();
    } catch {
      setStatus("error");
    }
  }

  const input =
    "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand";

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input
        className={input}
        name="nome_completo"
        placeholder="Nome completo"
        required
      />
      <input
        className={input}
        name="telefone_whatsapp"
        placeholder="WhatsApp"
        required
      />
      <input
        className={input}
        name="email_corporativo"
        type="email"
        placeholder="E-mail corporativo"
      />
      <input className={input} name="empresa" placeholder="Empresa" />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-2 disabled:opacity-60"
      >
        {status === "sending" ? "Enviando..." : "Enviar"}
      </button>
      {status === "ok" && (
        <p className="text-sm text-brand">Mensagem enviada com sucesso!</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600">
          Não foi possível enviar. Tente novamente.
        </p>
      )}
    </form>
  );
}
