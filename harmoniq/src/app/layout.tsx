import type { Metadata } from "next";
import "./globals.css";
import { HarmoniQShell } from "./HarmoniQShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "HarmoniQ — Your AI Guitar Coach",
  description:
    "Personalized guitar practice plans powered by AI. Practice smarter with adaptive roadmaps, real tabs, and progress tracking.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  openGraph: {
    title: "HarmoniQ — Your AI Guitar Coach",
    description: "Personalized guitar practice plans powered by AI.",
    type: "website",
  },
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
