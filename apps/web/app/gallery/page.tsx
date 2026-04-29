"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { dict, type Lang } from "../i18n";

export default function GalleryPage() {
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
  const galleryItems = lang === "fr"
    ? [
        {
          title: "Événement communautaire",
          text: "Rencontres pour créer du lien, partager des ressources et renforcer la confiance.",
          image: "/images/medical-mentorship-hero.jpg",
          alt: "Deux professionnels de santé en échange."
        },
        {
          title: "Cercle de mentorat",
          text: "Accompagnement de proximité entre mentors et participants du collectif.",
          image: "/images/medical-team-19.jpg",
          alt: "Mentore accompagnant une participante en clinique."
        },
        {
          title: "Atelier candidature",
          text: "Travail guidé sur les dossiers, lettres et trajectoires académiques.",
          image: "/images/medical-team-05.jpg",
          alt: "Stéthoscope posé près d'un ordinateur portable."
        },
        {
          title: "Talk éducatif",
          text: "Partages d'expérience sur les spécialités, les parcours et la posture professionnelle.",
          image: "/images/medical-team-06.jpg",
          alt: "Portrait d'un médecin."
        },
        {
          title: "Simulation d'entretien",
          text: "Mises en situation réalistes pour préparer les étapes décisives.",
          image: "/images/medical-team-01.jpg",
          alt: "Praticien analysant un scanner."
        },
        {
          title: "Médecine en action",
          text: "Vision concrète des environnements de soins, du bloc à la coordination d'équipe.",
          image: "/images/medical-team-16.jpg",
          alt: "Équipe en intervention chirurgicale."
        }
      ]
    : [
        {
          title: "Community event",
          text: "Gatherings to build relationships, share resources, and strengthen confidence.",
          image: "/images/medical-mentorship-hero.jpg",
          alt: "Two healthcare professionals collaborating."
        },
        {
          title: "Mentorship circle",
          text: "Close support between mentors and members of the collective.",
          image: "/images/medical-team-19.jpg",
          alt: "Mentor supporting a participant in a clinical setting."
        },
        {
          title: "Application workshop",
          text: "Guided work on applications, letters, and academic direction.",
          image: "/images/medical-team-05.jpg",
          alt: "Stethoscope beside a laptop."
        },
        {
          title: "Educational talk",
          text: "Practical insights on specialties, training pathways, and professional presence.",
          image: "/images/medical-team-06.jpg",
          alt: "Doctor portrait."
        },
        {
          title: "Interview practice",
          text: "Realistic simulations to prepare for decisive moments.",
          image: "/images/medical-team-01.jpg",
          alt: "Practitioner reviewing a medical scan."
        },
        {
          title: "Medicine in action",
          text: "A concrete view of healthcare environments, from surgery to team coordination.",
          image: "/images/medical-team-16.jpg",
          alt: "Team in a surgical intervention."
        }
      ];

  return (
    <div className="page shell">
      <section className="hero hero-compact bmc-page-hero">
        <span className="eyebrow">{t.nav.gallery}</span>
        <h1>{t.gallery.title}</h1>
        <p>{t.gallery.subtitle}</p>
      </section>

      <section className="section gallery-grid">
        {galleryItems.map((item, index) => (
          <article className="gallery-tile" key={item.title}>
            <Image className="gallery-image" src={item.image} alt={item.alt} width={1200} height={900} />
            <div className="gallery-overlay">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
