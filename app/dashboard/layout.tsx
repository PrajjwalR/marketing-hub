import { Sidebar } from "@/components/dashboard/sidebar";
import { DashboardRightRail } from "@/components/dashboard/dashboard-right-rail";
import { UserSync } from "@/components/dashboard/user-sync";
import { PageWrapper } from "@/components/dashboard/page-wrapper";
import { ProductTour } from "@/components/dashboard/product-tour";
import { MobileBottomNav, MobileNav } from "@/components/dashboard/mobile-nav";
import { WorkspaceProvider } from "@/context/workspace-context";
import { PhotoshootProvider } from "@/context/photoshoot-context";
import { AppsProvider } from "@/context/apps-context";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WorkspaceProvider>
            <AppsProvider>
            <PhotoshootProvider>
                {/* `ae-app` activates the logged-in theme tokens defined in globals.css */}
                <div className="ae-app flex h-dvh overflow-hidden bg-canvas text-zinc-900">
                    <UserSync />
                    <ProductTour />
                    <div className="hidden md:flex shrink-0">
                        <Sidebar />
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <MobileNav />
                        <div className="flex min-w-0 flex-1 overflow-hidden">
                            <main className="ae-main min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-canvas px-4 pb-28 pt-0 sm:px-5 md:pb-8 [scrollbar-gutter:stable]">
                                <PageWrapper>
                                    {children}
                                </PageWrapper>
                            </main>
                            <div className="hidden md:block">
                                <DashboardRightRail />
                            </div>
                        </div>
                    </div>
                    <MobileBottomNav />
                </div>
            </PhotoshootProvider>
            </AppsProvider>
        </WorkspaceProvider>
    );
}
