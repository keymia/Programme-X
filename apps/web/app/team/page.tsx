"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { dict, type Lang } from "../i18n";

const mentorGroups = [
  {
    label: "Mentors",
    title: "Physician mentors",
    text: "Critical care, internal medicine, surgery, neuroscience, endocrinology, and community care perspectives.",
    image: "/images/medical-team-03.jpg",
    alt: "Surgeon preparing in an operating room."
  },
  {
    label: "Founders",
    title: "Community builders",
    text: "Leaders who combine clinical excellence, representation, and long-term support for Black students.",
    image: "/images/medical-mentorship-hero.jpg",
    alt: "Black healthcare professionals reviewing information together."
  },
  {
    label: "Members",
    title: "Students and trainees",
    text: "Aspiring physicians learning through events, coaching, mentorship, and shared accountability.",
    image: "/images/medical-team-19.jpg",
    alt: "Mentor supporting a participant during a healthcare consultation."
  }
];

export default function TeamPage() {
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

  return (
    <div className="page shell">
      <section className="hero hero-compact bmc-page-hero">
        <span className="eyebrow">{t.nav.team}</span>
        <h1>{t.team.title}</h1>
        <p>{t.team.subtitle}</p>
      </section>

      <section className="section grid cols-3 media-grid">
        {mentorGroups.map((group, index) => (
          <article className="card media-card" key={group.label}>
            <Image src={group.image} alt={group.alt} width={1200} height={800} />
            <div className="card-body">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{group.title}</h2>
              <p>{group.text}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="section join-band">
        <h2>{lang === "fr" ? "Une communauté qui rend le parcours visible." : "A community that makes the path visible."}</h2>
        <p>
          {lang === "fr"
            ? "Le rôle de l'équipe est de relier inspiration, conseils concrets et occasions de leadership."
            : "The team's role is to connect inspiration, practical guidance, and leadership opportunities."}
        </p>
      </section>
    </div>
  );
}
