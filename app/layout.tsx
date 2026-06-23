import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://conttool.com"),
  title: {
    default: "CONT.TOOL — Blog",
    template: "%s | CONT.TOOL",
  },
  description:
    "Conteúdos sobre gestão de ferramentas, redução de custos e Indústria 4.0.",
};

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-brand">
            CONT<span className="text-gray-900">.TOOL</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-gray-700">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>
          <Link href="/artigos" className="hover:text-brand">
            Artigos
          </Link>
          <form action="/artigos" method="get" className="ml-2">
            <input
              type="search"
              name="q"
              placeholder="Buscar artigos..."
              aria-label="Buscar artigos"
              className="w-40 rounded-full border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand sm:w-48"
            />
          </form>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold text-brand">
          CONT<span className="text-gray-900">.TOOL</span>
        </p>
        <p>
          © {new Date().getFullYear()} CONT.TOOL. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <Header />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
