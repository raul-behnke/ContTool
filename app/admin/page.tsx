import { auth } from "@/auth";
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminHome() {
  const session = await auth();
  return (
    <main style={{ maxWidth: 720, margin: "60px auto", fontFamily: "system-ui" }}>
      <h1>Painel</h1>
      <p>Logado como: {session?.user?.name ?? "—"} ({session?.user?.email ?? "—"})</p>
    </main>
  );
}
