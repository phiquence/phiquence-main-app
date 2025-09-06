
'use client';

import { AppSidebar, SidebarProvider, SidebarInset } from '@/components/app/sidebar';
import { UserDataProvider } from '@/hooks/use-auth';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <UserDataProvider>
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <div className="p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    </UserDataProvider>
  );
}
