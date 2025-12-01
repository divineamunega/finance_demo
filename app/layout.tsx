import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AppProvider } from "@/context/AppContext";


export const metadata: Metadata = {
  title: "FinancePro - Dashboard",
  description: "Personal finance management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
