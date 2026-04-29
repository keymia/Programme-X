import "./globals.css";
import type { ReactNode } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { LanguageSwitcher } from "./components/language-switcher";
import { LocalizedNav } from "./components/localized-nav";

function safeMetadataBase() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    if (raw && /^https?:\/\//i.test(raw)) return new URL(raw);
  } catch {}
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  title: "Site Demo",
  description: "Institutional SaaS platform for mentorship, matching, events and community leadership.",
  metadataBase: safeMetadataBase(),
  openGraph: {
    title: "Site Demo",
    description: "Institutional mentorship and leadership platform.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Demo",
    description: "Institutional mentorship and leadership platform."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <header className="topbar">
          <div className="shell topbar-inner">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">AD</span>
              Appli demo
            </Link>
            <LocalizedNav />
            <LanguageSwitcher />
          </div>
        </header>
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
