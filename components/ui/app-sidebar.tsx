"use client";

import { Github, BookOpen, Settings, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Logout from "../../module/auth/components/logout";
import { title } from "process";

const AppSidebar = () => {
  //const [theme, setTheme] = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BookOpen,
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: Github,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: BookOpen,
    },
    {
      title: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: BookOpen,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + "/dashboard");
  };

  if (!mounted || !session) return null; // Hydration defensive technique

  const user = session.user;
  const userName = user.name || "Guest";
  const userEmail = user.email || "";
  const userAvatar = user.image || null;
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex flex-col gap-4 px-2 py-6">
          <div className="flex items-center gap-4 px-3 py-4 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent/80 transition-colors">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground tracking-wide">
                Connected Account
              </p>
              <p className="text-sm font-medium text-sidebar-foreground/90">
                @{userName}
              </p>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-6 flex-col gap-1">
        <div className="mb-2">
          <p className="text-xs font-semibold text-sidebar-foreground/60 px-3 mb-3 uppercase tracking-widest">
            Menu
          </p>
        </div>

        <SidebarMenu className="gap-2">
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`h-11 px-4 rounded-lg transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "hover:bg-sidebar-accent/60 text-sidebar-foreground"
                }`}
              >
                <Link href={item.url} className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-3 py-4 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="h-12 px-4 rounded-lg data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10 rounded-lg shrink-0">
                    <AvatarImage
                      src={userAvatar || "/placeholder.svg"}
                      alt={userName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-relaxed min-w-0">
                    <span className="truncate font-semibold text-base">
                      {userName}
                    </span>
                    <span className="truncate text-xs text-sidebar-foreground/70">
                      {userEmail}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-80 rounded-lg"
                side="right"
                sideOffset={8}
              >
                <div className="flex items-center gap-3 px-4 py-4 bg-sidebar-accent/30 rounded-t-lg">
                  <Avatar className="h-12 w-12 rounded-lg shrink-0">
                    <AvatarImage
                      src={userAvatar || "/placeholder.svg"}
                      alt={userName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{userName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {userEmail}
                    </p>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;

{
  /* <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              <BookOpen className="w-4 h-4" />
              <span>CodeBunny</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <Link href={item.url}>
                <SidebarMenuButton isActive={isActive(item.url)}>
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.title}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator />
      </SidebarContent>

      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
              {userImage ? (
                <Avatar className="w-8 h-8 rounded-full">
                  <AvatarImage src={userImage} alt={userName} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-8 h-8 rounded-full">{userInitials}</Avatar>
              )}
              {userName}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {/* User profile dropdown content */
}
{
  /* Logout button */
}
{
  /* Theme toggle */
}
//       </DropdownMenuContent>
//     </DropdownMenu>

//     {/* Theme toggle button */}
//     {theme === "dark"
//       ? // Sun icon for light theme
//         null
//       : // Moon icon for dark theme
//         null}
//   </SidebarFooter>
// </Sidebar> */}
