"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { dict, type Lang } from "./i18n";

export default function HomePage() {
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
  const communityHighlights = lang === "fr"
    ? [
        {
          label: "Mentorat",
          title: "Encadrement clinique ciblé",
          text: "Des échanges réguliers entre étudiants et praticiens pour transformer les objectifs en plan d'action concret.",
          image: "/images/medical-team-19.jpg",
          alt: "Professionnelle de santé accompagnant une patiente."
        },
        {
          label: "Préparation",
          title: "Ateliers dossiers & candidatures",
          text: "Sessions guidées pour CV, lettres, stratégie d'application et positionnement académique.",
          image: "/images/medical-team-05.jpg",
          alt: "Poste de travail avec ordinateur et stéthoscope."
        },
        {
          label: "Communauté",
          title: "Réseau qui avance ensemble",
          text: "Une dynamique intergénérationnelle entre mentors, étudiants et partenaires institutionnels.",
          image: "/images/medical-team-22.jpg",
          alt: "Équipe médicale marchant dans un couloir d'hôpital."
        }
      ]
    : [
        {
          label: "Mentorship",
          title: "Focused clinical guidance",
          text: "Regular exchanges between students and practitioners to turn goals into actionable next steps.",
          image: "/images/medical-team-19.jpg",
          alt: "Healthcare professional supporting a patient."
        },
        {
          label: "Preparation",
          title: "Application and profile workshops",
          text: "Guided sessions for CVs, letters, application strategy, and academic positioning.",
          image: "/images/medical-team-05.jpg",
          alt: "Desk setup with laptop and stethoscope."
        },
        {
          label: "Community",
          title: "A network that grows together",
          text: "An intergenerational dynamic connecting mentors, students, and institutional partners.",
          image: "/images/medical-team-22.jpg",
          alt: "Medical team walking through a hospital hallway."
        }
      ];
  return (
    <div className="page shell">
      <section className="hero hero-home">
        <div className="hero-content">
          <span className="eyebrow">Black Med Collective</span>
          <h1>{t.home.title}</h1>
          <p>{t.home.subtitle}</p>
          <div className="actions">
            <a className="btn" href="/registration">{t.home.cta1}</a>
            <a className="btn alt" href="/team">{t.home.cta2}</a>
          </div>
        </div>
        <div className="hero-stats" aria-label="Platform highlights">
          <span><strong>30</strong> new members yearly</span>
          <span><strong>6</strong> support pillars</span>
          <span><strong>BMC</strong> community first</span>
        </div>
      </section>

      <section className="section section-lead bmc-mission">
        <span className="eyebrow">Empowering Black futures in medicine</span>
        <h2>Representation, mentorship, and application support in one living community.</h2>
        <p>
          Inspired by the official Black Med Collective mission, this platform brings the community
          experience into a structured digital space for applicants, mentors, and organizers.
        </p>
      </section>

      <section className="section grid cols-3 access-grid">
        <article className="card feature-card"><span>01</span><h2>Community Events</h2><p>Spaces for students, mentors, and physicians to meet, learn, and build confidence.</p></article>
        <article className="card feature-card"><span>02</span><h2>Mentorship</h2><p>Guided connections between aspiring physicians and people already walking the path.</p></article>
        <article className="card feature-card"><span>03</span><h2>Application Support</h2><p>Structured help for applications, MCAT planning, interviews, and next steps.</p></article>
      </section>

      <section className="section">
        <span className="eyebrow">
          {lang === "fr" ? "Vue terrain" : "Inside the journey"}
        </span>
        <div className="grid cols-3 media-grid">
          {communityHighlights.map((item) => (
            <article className="card media-card" key={item.title}>
              <Image src={item.image} alt={item.alt} width={1200} height={800} />
              <div className="card-body">
                <span>{item.label}</span>
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section testimonial-band">
        <div>
          <span className="eyebrow">Testimonials</span>
          <h2>Built around encouragement, visibility, and practical support.</h2>
        </div>
        <blockquote>
          “A radiant community that uplifts Black students and nurtures their passion for medicine.”
        </blockquote>
      </section>

      <section className="section join-band">
        <h2>Join our movement</h2>
        <p>Take the next step in your medical journey with a community designed to support you.</p>
        <a className="btn" href="/registration">Fill the platform form</a>
      </section>
    </div>
  );
}
