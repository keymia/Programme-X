"use client";

import { useEffect, useState } from "react";
import type { Lang } from "../i18n";

export function LanguageSwitcher() {
  const [lang, setLang] = useState<Lang>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    if (saved === "fr" || saved === "en") setLang(saved);
    document.documentElement.lang = saved === "en" ? "en" : "fr";
  }, []);

  const onChange = (next: Lang) => {
    setLang(next);
    localStorage.setItem("lang", next);
    document.documentElement.lang = next;
    window.dispatchEvent(new CustomEvent("lang-change", { detail: next }));
  };

  return (
    <div className="lang-switch">
      <button type="button" className={lang === "fr" ? "btn" : "btn alt"} onClick={() => onChange("fr")}>FR</button>
      <button type="button" className={lang === "en" ? "btn" : "btn alt"} onClick={() => onChange("en")}>EN</button>
    </div>
  );
}

