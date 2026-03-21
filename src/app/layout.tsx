import type { Metadata } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { MantineWrapper } from "@/components/MantineProvider";
import { ColorSchemeScript } from "@mantine/core";
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
    <html lang="fr" className={atkinson.variable}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineWrapper>
          <header className="app-header">
            <a href="/" className="app-header-title">
              Navimeter
            </a>
            <span className="app-header-subtitle">Analyse de navigation</span>
          </header>
          <main className="app-main">{children}</main>
        </MantineWrapper>
      </body>
    </html>
  );
}
