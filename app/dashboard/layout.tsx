import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { UserSync } from "@/components/dashboard/user-sync";
import { PageWrapper } from "@/components/dashboard/page-wrapper";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-white overflow-hidden">
            <UserSync />
            <div className="hidden md:flex shrink-0">
                <Sidebar />
            </div>

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto overflow-x-hidden bg-zinc-50/30 p-8 [scrollbar-gutter:stable]">
                    <PageWrapper>
                        {children}
                    </PageWrapper>
                </main>
            </div>
        </div>
    );
}
