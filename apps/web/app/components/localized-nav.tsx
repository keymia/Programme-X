"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dict, type Lang } from "../i18n";

export function LocalizedNav() {
  const [lang, setLang] = useState<Lang>("fr");
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
    <nav className="nav" aria-label={lang === "fr" ? "Navigation principale" : "Primary navigation"}>
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
  );
}
