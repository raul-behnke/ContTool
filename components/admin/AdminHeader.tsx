"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "./LogoutButton";

const links = [
  { href: "/admin", label: "Artigos" },
  { href: "/admin/categories", label: "Categorias" },
  { href: "/admin/users", label: "Usuários" },
];

export function AdminHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin/login")) return null;

  return (
    <header className="sticky top-0 z-20 border-b border-[#d6e4df] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/admin" className="text-lg font-extrabold tracking-tight text-[#045E4C]">
          CONT<span className="text-[#67D46B]">.</span>TOOL
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  active
                    ? "bg-[#045E4C]/10 text-[#045E4C]"
                    : "text-[#1f2937] hover:bg-[#f6f9f8] hover:text-[#045E4C]"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
          <span className="ml-1 sm:ml-2">
            <LogoutButton />
          </span>
        </nav>
      </div>
    </header>
  );
}
