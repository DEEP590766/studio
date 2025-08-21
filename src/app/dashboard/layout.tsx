
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, Lightbulb, Wallet, Bot, Sun, Moon } from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const menuItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/dashboard/advisory",
      label: "AI Advisory",
      icon: Bot,
    },
    {
      href: "/dashboard/goals",
      label: "Savings Goals",
      icon: Target,
    },
    {
      href: "/dashboard/tips",
      label: "Finance Tips",
      icon: Lightbulb,
    },
  ];

  const handleThemeChange = (isChecked: boolean) => {
    setTheme(isChecked ? "dark" : "light");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Image 
              src="https://storage.googleapis.com/project-hosting-dev-us-west1-429321.appspot.com/1724263051390-sxeiiiq5" 
              alt="Zenitho Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <h1 className="text-xl font-bold">Zenitho</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                    {theme === 'light' ? <Sun /> : <Moon />}
                    <span className="text-sm">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={handleThemeChange}
                    aria-label="Toggle theme"
                />
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
