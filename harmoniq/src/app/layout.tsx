import type { Metadata } from "next";
import "./globals.css";
import { HarmoniQShell } from "./HarmoniQShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HarmoniQ",
  description: "A clean, Duolingo-inspired music learning prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-white text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <HarmoniQShell>{children}</HarmoniQShell>
        </Providers>
      </body>
    </html>
  );
}
