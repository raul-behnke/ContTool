"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClientMarkdown } from "./ClientMarkdown";

type Category = { id: number; name: string; slug: string };

type ArticleInit = {
  id?: number;
  title?: string;
  slug?: string;
  excerpt?: string;
  contentMd?: string;
  status?: string;
  coverImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  categoryIds?: number[];
};

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stripMd(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const inputClass =
  "w-full rounded-lg border border-[#d6e4df] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#045E4C] focus:ring-2 focus:ring-[#045E4C]/30";
const labelClass = "grid gap-1.5 text-sm font-medium text-[#1f2937]";

export default function ArticleEditor({ init }: { init?: ArticleInit }) {
  const router = useRouter();
  const isEdit = !!init?.id;

  const [title, setTitle] = useState(init?.title ?? "");
  const [slug, setSlug] = useState(init?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [excerpt, setExcerpt] = useState(init?.excerpt ?? "");
  const [contentMd, setContentMd] = useState(init?.contentMd ?? "");
  const [coverImage, setCoverImage] = useState(init?.coverImage ?? "");
  const [seoTitle, setSeoTitle] = useState(init?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(init?.seoDescription ?? "");
  const [categoryIds, setCategoryIds] = useState<number[]>(init?.categoryIds ?? []);
  const [status, setStatus] = useState(init?.status ?? "draft");

  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // auto slug from title until user edits slug manually
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  async function loadCategories() {
    const res = await fetch("/blog/api/categories");
    if (res.ok) setCategories(await res.json());
  }
  useEffect(() => {
    loadCategories();
  }, []);

  const preview = useMemo(() => contentMd, [contentMd]);

  function toggleCat(id: number) {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  async function createCategory() {
    const name = newCat.trim();
    if (!name) return;
    const res = await fetch("/blog/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const cat: Category = await res.json();
      setNewCat("");
      await loadCategories();
      setCategoryIds((prev) => [...prev, cat.id]);
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Erro ao criar categoria");
    }
  }

  function generateExcerpt() {
    const text = stripMd(contentMd);
    setExcerpt(text.slice(0, 160).trim());
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/blog/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      const j = await res.json();
      setCoverImage(j.url);
    } else {
      setError("Falha no upload");
    }
  }

  async function save(nextStatus: string) {
    setSaving(true);
    setError("");
    const payload = {
      title,
      slug,
      excerpt,
      contentMd,
      status: nextStatus,
      coverImage,
      seoTitle,
      seoDescription,
      categoryIds,
    };
    const url = isEdit ? `/blog/api/articles/${init!.id}` : "/blog/api/articles";
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Erro ao salvar");
    }
  }

  async function onDelete() {
    if (!isEdit) return;
    if (!confirm("Deletar este artigo?")) return;
    setSaving(true);
    const res = await fetch(`/blog/api/articles/${init!.id}`, { method: "DELETE" });
    setSaving(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Erro ao deletar");
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 pb-28 font-sans text-[#1f2937]">
      <h1 className="mb-6 text-2xl font-bold text-[#0D5B49]">
        {isEdit ? "Editar artigo" : "Novo artigo"}
      </h1>
      {error && (
        <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT: form fields */}
        <div className="grid content-start gap-5 rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
          <label className={labelClass}>
            Título
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>

          <label className={labelClass}>
            Slug
            <input
              className={inputClass}
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
            />
          </label>

          <div className="grid gap-1.5">
            <label className={labelClass}>
              Resumo (excerpt)
              <textarea
                className={`${inputClass} min-h-[70px] resize-y`}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={generateExcerpt}
              className="justify-self-start rounded-lg border border-[#d6e4df] px-3 py-1.5 text-xs font-medium text-[#045E4C] transition hover:bg-[#f6f9f8]"
            >
              Gerar do 1º parágrafo
            </button>
          </div>

          <fieldset className="rounded-xl border border-[#d6e4df] p-4">
            <legend className="px-1 text-sm font-semibold text-[#045E4C]">
              Categorias
            </legend>
            <div className="flex flex-wrap gap-3">
              {categories.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-2 text-sm text-[#1f2937]"
                >
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(c.id)}
                    onChange={() => toggleCat(c.id)}
                    className="h-4 w-4 accent-[#045E4C]"
                  />
                  {c.name}
                </label>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className={`${inputClass} max-w-[220px]`}
                placeholder="Nova categoria"
                value={newCat}
                onChange={(e) => setNewCat(e.target.value)}
              />
              <button
                type="button"
                onClick={createCategory}
                className="shrink-0 rounded-lg bg-[#045E4C] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#0D5B49]"
              >
                Criar
              </button>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border border-[#d6e4df] p-4">
            <legend className="px-1 text-sm font-semibold text-[#045E4C]">
              Imagem de capa
            </legend>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#045E4C] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#0D5B49]"
            />
            {uploading && (
              <span className="mt-2 inline-block text-xs text-gray-500">
                enviando…
              </span>
            )}
            {coverImage && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="capa"
                  className="max-w-xs rounded-lg border border-[#d6e4df]"
                />
                <div className="mt-1 break-all text-xs text-gray-400">
                  {coverImage}
                </div>
              </div>
            )}
          </fieldset>

          <label className={labelClass}>
            SEO Title
            <input
              className={inputClass}
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
            />
          </label>
          <label className={labelClass}>
            SEO Description
            <textarea
              className={`${inputClass} min-h-[60px] resize-y`}
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
            />
          </label>
        </div>

        {/* RIGHT: markdown + preview */}
        <div className="grid content-start gap-5 rounded-2xl border border-[#d6e4df] bg-white p-5 shadow-[0_4px_20px_rgba(4,94,76,0.05)]">
          <label className={labelClass}>
            Conteúdo (Markdown)
            <textarea
              className={`${inputClass} min-h-[360px] resize-y font-mono`}
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
            />
          </label>
          <div className="grid gap-1.5">
            <div className="text-sm font-medium text-[#1f2937]">
              Pré-visualização
            </div>
            <div className="min-h-[200px] overflow-auto rounded-lg border border-[#d6e4df] bg-[#f6f9f8] p-4">
              <ClientMarkdown content={preview} />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky footer actions */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-[#d6e4df] bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <button
            type="button"
            disabled={saving}
            onClick={() => save("draft")}
            className="rounded-lg border border-[#045E4C] px-4 py-2 text-sm font-semibold text-[#045E4C] transition hover:bg-[#f6f9f8] disabled:opacity-50"
          >
            Salvar rascunho
          </button>
          {status === "published" ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => save("draft")}
              className="rounded-lg border border-[#d6e4df] px-4 py-2 text-sm font-semibold text-[#1f2937] transition hover:bg-[#f6f9f8] disabled:opacity-50"
            >
              Despublicar
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => save("published")}
              className="rounded-lg bg-[#045E4C] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0D5B49] disabled:opacity-50"
            >
              Publicar
            </button>
          )}
          {isEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={onDelete}
              className="ml-auto rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              Deletar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
