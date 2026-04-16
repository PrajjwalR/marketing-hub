import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardRightRail } from "@/components/dashboard/dashboard-right-rail";
import { UserSync } from "@/components/dashboard/user-sync";
import { PageWrapper } from "@/components/dashboard/page-wrapper";
import { ProductTour } from "@/components/dashboard/product-tour";
import { WorkspaceProvider } from "@/context/workspace-context";
import { PhotoshootProvider } from "@/context/photoshoot-context";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WorkspaceProvider>
            <PhotoshootProvider>
                <div className="flex h-screen bg-white overflow-hidden">
                    <UserSync />
                    <ProductTour />
                    <div className="hidden md:flex shrink-0">
                        <Sidebar />
                    </div>

                    <div className="flex min-w-0 flex-1 overflow-hidden">
                        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#F4F5F7] px-3 pb-6 pt-0 sm:px-4 [scrollbar-gutter:stable]">
                            <PageWrapper>
                                {children}
                            </PageWrapper>
                        </main>
                        <div className="hidden md:block">
                            <DashboardRightRail />
                        </div>
                    </div>
                </div>
            </PhotoshootProvider>
        </WorkspaceProvider>
    );
}
