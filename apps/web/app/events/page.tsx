"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { dict, type Lang } from "../i18n";

export default function EventsPage() {
  const [lang, setLang] = useState<Lang>("fr");
  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem("lang");
      setLang(saved === "en" ? "en" : "fr");
    };
    sync();
    window.addEventListener("lang-change", sync);
    return () => window.removeEventListener("lang-change", sync);
  }, []);
  const t = dict[lang];
  const events = [
    {
      period: "Sep 2026",
      title: "Annual Summit",
      text: "Toronto • September 2026",
      detail: "Panels, mentorship speed sessions, and leadership clinics.",
      image: "/images/medical-team-22.jpg",
      alt: "Medical professionals moving through a hospital corridor."
    },
    {
      period: "Oct 2026",
      title: "Policy Roundtable",
      text: "Ottawa • October 2026",
      detail: "Representation, equity, and institutional change with invited experts.",
      image: "/images/medical-team-12.jpg",
      alt: "Hands exchanging a symbolic heart."
    },
    {
      period: "Nov 2026",
      title: "Innovation Session",
      text: "Montreal • November 2026",
      detail: "Clinical technologies, case reviews, and career navigation insights.",
      image: "/images/medical-team-13.jpg",
      alt: "Practitioner reviewing medical imaging plates."
    }
  ];
  return (
    <div className="page shell">
      <section className="hero hero-compact">
        <span className="eyebrow">Events</span>
        <h1>{t.events.title}</h1>
        <p>{t.events.subtitle}</p>
      </section>
      <section className="section grid cols-3 media-grid">
        {events.map((event) => (
          <article className="card media-card" key={event.title}>
            <Image src={event.image} alt={event.alt} width={1200} height={800} />
            <div className="card-body">
              <span>{event.period}</span>
              <h2>{event.title}</h2>
              <p>{event.text}</p>
              <p>{event.detail}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
