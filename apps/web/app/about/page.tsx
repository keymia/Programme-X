"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { dict, type Lang } from "../i18n";

export default function AboutPage() {
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
  const pillars = lang === "fr"
    ? [
        {
          label: "Mission",
          title: "Excellence équitable",
          text: "Créer des trajectoires médicales ambitieuses, accessibles et mesurables pour la relève.",
          image: "/images/medical-mentorship-hero.jpg",
          alt: "Deux professionnels de santé en discussion."
        },
        {
          label: "Vision",
          title: "Standard moderne",
          text: "Structurer un accompagnement clair entre préparation académique, mentorat et leadership clinique.",
          image: "/images/medical-team-13.jpg",
          alt: "Praticien analysant des images médicales."
        },
        {
          label: "Valeurs",
          title: "Confiance durable",
          text: "Respect, impact concret, transmission intergénérationnelle et responsabilité collective.",
          image: "/images/medical-team-12.jpg",
          alt: "Deux mains tenant un coeur symbolique."
        }
      ]
    : [
        {
          label: "Mission",
          title: "Equitable excellence",
          text: "Build ambitious and accessible medical pathways with clear outcomes for the next generation.",
          image: "/images/medical-mentorship-hero.jpg",
          alt: "Two healthcare professionals reviewing information together."
        },
        {
          label: "Vision",
          title: "Modern standard",
          text: "Deliver structured support across academic readiness, mentorship, and clinical leadership.",
          image: "/images/medical-team-13.jpg",
          alt: "Practitioner reviewing medical scans."
        },
        {
          label: "Values",
          title: "Sustainable trust",
          text: "Respect, practical impact, intergenerational transfer, and shared accountability.",
          image: "/images/medical-team-12.jpg",
          alt: "Two hands holding a symbolic heart."
        }
      ];
  return (
    <div className="page shell">
      <section className="hero hero-compact">
        <span className="eyebrow">About</span>
        <h1>{t.about.title}</h1>
        <p>{t.about.subtitle}</p>
      </section>
      <section className="section grid cols-3 media-grid">
        {pillars.map((pillar) => (
          <article className="card media-card" key={pillar.title}>
            <Image src={pillar.image} alt={pillar.alt} width={1200} height={800} />
            <div className="card-body">
              <span>{pillar.label}</span>
              <h2>{pillar.title}</h2>
              <p>{pillar.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
