import type React from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppProvider from "@/provider/AppProvider";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/shared/AuthProvider";
import { Providers } from "@/components/shared/session-provider";
import SidebarVisibilityWrapper from "@/components/shared/SidebarVisibilityWrapper";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Exodus Dashboard",
  description: "Admin dashboard for Exodus Transport Company",
  icons: {
    icon: "assets/logo.png", // or .png/.svg
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <SidebarProvider>
          <SidebarVisibilityWrapper>
            <Providers>
              <AuthProvider>
                <AppProvider>
                  {children}
                  <Toaster />
                </AppProvider>
              </AuthProvider>
            </Providers>
          </SidebarVisibilityWrapper>
        </SidebarProvider>
      </body>
    </html>
  );
}
