import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Navimeter",
  description: "Analyse de traces de navigation à voile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${atkinson.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="bg-accent-blue text-white px-6 py-3 flex items-center gap-3 shadow-sm">
          <a href="/" className="text-xl font-bold tracking-tight">
            Navimeter
          </a>
          <span className="text-sm opacity-75">Analyse de navigation</span>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
