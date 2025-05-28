"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";

const hiddenRoutes = ["/login", "/verify-otp", "/forgot-password", "/update-password"];

export default function SidebarVisibilityWrapper({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isHidden = hiddenRoutes.includes(pathname);

    return (
        <div className="flex min-h-screen gap-7 w-full">
            {!isHidden && <AppSidebar />}
            <div className="flex-1">{children}</div>
        </div>
    );
}
