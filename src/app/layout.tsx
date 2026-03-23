import type { Metadata } from "next";
import localFont from "next/font/local";
import { MantineWrapper } from "@/components/MantineProvider";
import { MenuUtilisateur } from "@/components/MenuUtilisateur";
import { BandeauImpersonation } from "@/components/BandeauImpersonation";
import { Footer } from "@/components/Footer";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import "./globals.css";

const atkinson = localFont({
  src: "../fonts/atkinson-variable.woff2",
  weight: "200 800",
  style: "normal",
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "Sillage",
  description: "Journal de navigation et analyse de performance à la voile",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={atkinson.variable} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body>
        <MantineWrapper>
          <BandeauImpersonation />
          <header className="app-header">
            <a href="/" className="app-header-title">
              <svg
                className="app-header-logo"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#43728B" />
                    <stop offset="20%" stopColor="#43728B" />
                    <stop offset="50%" stopColor="#D32F2F" />
                    <stop offset="80%" stopColor="#F6BC00" />
                    <stop offset="100%" stopColor="#F6BC00" />
                  </linearGradient>
                </defs>
                <path
                  d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2"
                  stroke="white"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 3.5c5-2 7 2.5 3 4C1.5 10 2 15 5 16c5 2 9-10 14-7s.5 13.5-4 12c-5-2.5.5-11 6-2"
                  stroke="url(#logo-grad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sillage
            </a>
            <MenuUtilisateur />
          </header>
          <main className="app-main">{children}</main>
          <Footer />
        </MantineWrapper>
      </body>
    </html>
  );
}
