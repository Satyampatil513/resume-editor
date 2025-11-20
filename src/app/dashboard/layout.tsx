import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="w-full">
                <div className="flex h-14 items-center border-b px-4 gap-4">
                    <SidebarTrigger />
                    <div className="font-semibold">Dashboard</div>
                </div>
                <div className="p-4">
                    {children}
                </div>
            </main>
        </SidebarProvider>
    )
}
