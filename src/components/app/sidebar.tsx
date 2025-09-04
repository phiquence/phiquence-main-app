
"use client";

import { usePathname } from 'next/navigation';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarFooter,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import {
    LayoutDashboard,
    Wallet,
    CircleDollarSign,
    CandlestickChart,
    Users,
    LifeBuoy,
    Settings,
    LogOut,
    Crown,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';
import { useAuth, useUserData } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';


const menuItems = [
    { href: "/app", label: "Dashboard", icon: LayoutDashboard },
    { href: "/app/wallet", label: "Wallet", icon: Wallet },
    { href: "/app/staking", label: "Staking", icon: CircleDollarSign },
    { href: "/app/trading-hub", label: "Trading Hub", icon: CandlestickChart },
    { href: "/app/affiliate", label: "Affiliate", icon: Users },
    { href: "/app/support", label: "Support", icon: LifeBuoy },
    { href: "/app/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { userData } = useUserData();

    const isFounder = (userData as any)?.isFounder || false;

    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center justify-between">
                    <Logo />
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
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
                    {!isFounder && (
                         <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={pathname === '/app/founder'}
                                tooltip="Founder Club"
                                className="text-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-300 data-[active=true]:bg-yellow-400/10 data-[active=true]:text-yellow-300"
                            >
                                <Link href="/app/founder">
                                    <Crown/>
                                    <span>Founder Club</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <div className="flex items-center gap-3 p-2 rounded-md transition-colors hover:bg-sidebar-accent">
                    <Avatar>
                        <AvatarImage src={user?.photoURL || "https://picsum.photos/100/100"} data-ai-hint="person" />
                        <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden group-data-[collapsible=icon]:hidden">
                        <p className="font-medium text-sm truncate">{user?.displayName || 'User'}</p>
                        <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden" onClick={logout}>
                        <LogOut />
                    </Button>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
