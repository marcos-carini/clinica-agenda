import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import WithAuthentication from "@/hocs/with-authentication";

import { AppSidebar } from "./_components/app-sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WithAuthentication>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <SidebarTrigger />
          {children}
        </main>
      </SidebarProvider>
    </WithAuthentication>
  );
}
