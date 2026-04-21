import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "HB Marketing Task Manager",
  description: "Internal task management system for HB Marketing.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans text-foreground antialiased">
        <AppProviders>{children}</AppProviders>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
