import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { QueryProvider } from "@/components/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { Cairo } from "next/font/google";
import { inter } from "@/lib/fonts";
const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
});
export const metadata: Metadata = {
  title: "TCT Pro admin CRM",
  description: "Admin dashboard for TCT Pro CRM system",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className={cairo.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <QueryProvider>
            <SidebarConfigProvider>
              {children}
            </SidebarConfigProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
