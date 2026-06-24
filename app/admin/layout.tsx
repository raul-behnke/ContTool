import { Providers } from "./providers";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#f6f9f8] font-sans text-[#1f2937]">
        <AdminHeader />
        {children}
      </div>
    </Providers>
  );
}
