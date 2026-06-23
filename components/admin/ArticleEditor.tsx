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

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: "1px solid #ccc",
  borderRadius: 6,
  fontFamily: "inherit",
  fontSize: 14,
  boxSizing: "border-box",
};

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
    <div style={{ maxWidth: 1100, margin: "40px auto", fontFamily: "system-ui", padding: "0 16px" }}>
      <h1>{isEdit ? "Editar artigo" : "Novo artigo"}</h1>
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gap: 14 }}>
        <label>
          Título
          <input style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>

        <label>
          Slug
          <input
            style={inputStyle}
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
          />
        </label>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <label>
            Conteúdo (Markdown)
            <textarea
              style={{ ...inputStyle, minHeight: 360, fontFamily: "monospace" }}
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
            />
          </label>
          <div>
            <div style={{ fontSize: 14 }}>Pré-visualização</div>
            <div
              style={{
                border: "1px solid #eee",
                borderRadius: 6,
                padding: 12,
                minHeight: 360,
                overflow: "auto",
              }}
            >
              <ClientMarkdown content={preview} />
            </div>
          </div>
        </div>

        <label>
          Resumo (excerpt)
          <textarea
            style={{ ...inputStyle, minHeight: 70 }}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </label>
        <button type="button" onClick={generateExcerpt} style={{ justifySelf: "start" }}>
          Gerar do 1º parágrafo
        </button>

        <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, padding: 12 }}>
          <legend>Categorias</legend>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {categories.map((c) => (
              <label key={c.id} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={categoryIds.includes(c.id)}
                  onChange={() => toggleCat(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              style={{ ...inputStyle, width: 220 }}
              placeholder="Nova categoria"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <button type="button" onClick={createCategory}>
              Criar
            </button>
          </div>
        </fieldset>

        <fieldset style={{ border: "1px solid #ddd", borderRadius: 6, padding: 12 }}>
          <legend>Imagem de capa</legend>
          <input type="file" accept="image/*" onChange={onUpload} />
          {uploading && <span> enviando…</span>}
          {coverImage && (
            <div style={{ marginTop: 10 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImage} alt="capa" style={{ maxWidth: 320, borderRadius: 6 }} />
              <div style={{ fontSize: 12, color: "#666" }}>{coverImage}</div>
            </div>
          )}
        </fieldset>

        <label>
          SEO Title
          <input style={inputStyle} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </label>
        <label>
          SEO Description
          <textarea
            style={{ ...inputStyle, minHeight: 60 }}
            value={seoDescription}
            onChange={(e) => setSeoDescription(e.target.value)}
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 8 }}>
          <button type="button" disabled={saving} onClick={() => save("draft")}>
            Salvar rascunho
          </button>
          {status === "published" ? (
            <button type="button" disabled={saving} onClick={() => save("draft")}>
              Despublicar
            </button>
          ) : (
            <button type="button" disabled={saving} onClick={() => save("published")}>
              Publicar
            </button>
          )}
          {isEdit && (
            <button
              type="button"
              disabled={saving}
              onClick={onDelete}
              style={{ marginLeft: "auto", color: "crimson" }}
            >
              Deletar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
