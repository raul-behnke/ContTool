import Link from "next/link";
import { getPublished } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { ContactForm } from "@/components/ContactForm";

export const revalidate = 60;

export default async function Home() {
  const articles = (await getPublished()).slice(0, 6);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand to-brand-2 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
            Blog CONT.TOOL
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">
            Gestão inteligente de ferramentas para a indústria moderna
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-emerald-50">
            Conteúdos sobre redução de custos, otimização de operações e
            Indústria 4.0 para você tomar decisões melhores no chão de fábrica.
          </p>
          <Link
            href="/artigos"
            className="mt-8 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand transition hover:bg-emerald-50"
          >
            Ver todos os artigos
          </Link>
        </div>
      </section>

      {/* Latest articles */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Últimos artigos</h2>
          <Link href="/artigos" className="text-sm font-semibold text-brand hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard key={a.id} article={a} />
          ))}
        </div>
      </section>

      {/* Sobre + contato */}
      <section id="sobre" className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-16 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-brand">SOBRE A CONT.TOOL</h2>
            <p className="mt-4 text-gray-600">
              A CONT.TOOL desenvolve soluções inteligentes para a gestão de
              ferramentas e insumos industriais. Com gaveteiros inteligentes e
              automação, ajudamos empresas a reduzir custos, evitar estoques
              desequilibrados e otimizar suas operações.
            </p>
            <p className="mt-4 text-gray-600">
              Quer entender como podemos ajudar sua operação? Fale com a nossa
              equipe pelo formulário ao lado.
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900">
              Fale conosco
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
