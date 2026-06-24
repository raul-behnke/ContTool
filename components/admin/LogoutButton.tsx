"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/blog/admin/login" })}
      className="rounded-lg border border-[#d6e4df] bg-white px-3 py-1.5 text-sm font-medium text-[#1f2937] transition hover:border-[#045E4C] hover:text-[#045E4C]"
    >
      Sair
    </button>
  );
}
