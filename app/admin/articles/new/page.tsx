import ArticleEditor from "@/components/admin/ArticleEditor";

export const metadata = { robots: { index: false, follow: false } };

export default function NewArticlePage() {
  return <ArticleEditor />;
}
