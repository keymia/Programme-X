"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, type Lang } from "../i18n";

export function LocalizedNav() {
  const [lang, setLang] = useState<Lang>("fr");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem("lang");
      setLang(saved === "en" ? "en" : "fr");
    };
    sync();
    window.addEventListener("lang-change", sync);
    return () => window.removeEventListener("lang-change", sync);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname, lang]);

  const nav = dict[lang].nav;
  const links = [
    { href: "/", label: nav.home },
    { href: "/team", label: nav.team },
    { href: "/registration", label: nav.join },
    { href: "/gallery", label: nav.gallery },
    { href: "/about", label: nav.about },
    { href: "/admin", label: nav.admin }
  ];
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <div className="nav-wrap">
      <button
        aria-controls="primary-navigation"
        aria-expanded={open}
        aria-label={lang === "fr" ? "Ouvrir le menu" : "Open menu"}
        className="nav-toggle"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>
      <nav className={`nav ${open ? "open" : ""}`} id="primary-navigation" aria-label={lang === "fr" ? "Navigation principale" : "Primary navigation"}>
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={active ? "active" : undefined}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
