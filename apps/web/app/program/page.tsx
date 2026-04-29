"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { dict, type Lang } from "../i18n";

export default function ProgramPage() {
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
  const tracks = [
    {
      label: "Track 1",
      title: "Foundation",
      text: "Career strategy, leadership mindset, and network positioning.",
      image: "/images/medical-team-01.jpg",
      alt: "Doctor analyzing diagnostic scans."
    },
    {
      label: "Track 2",
      title: "Advancement",
      text: "Operational leadership, institutional navigation, and governance.",
      image: "/images/medical-team-04.jpg",
      alt: "Healthcare professional working in a clinical lab."
    },
    {
      label: "Track 3",
      title: "Executive",
      text: "Board readiness, policy impact, and multi-site systems thinking.",
      image: "/images/medical-team-16.jpg",
      alt: "Surgical team operating in an emergency room."
    },
    {
      label: "Lab",
      title: "Mentor Labs",
      text: "Small-group sessions with senior practitioners and institutional advisors.",
      image: "/images/medical-team-05.jpg",
      alt: "Laptop and stethoscope for workshop planning."
    }
  ];
  return (
    <div className="page shell">
      <section className="hero hero-compact">
        <span className="eyebrow">Program</span>
        <h1>{t.program.title}</h1>
        <p>{t.program.subtitle}</p>
      </section>
      <section className="section grid cols-2 media-grid">
        {tracks.map((track) => (
          <article className="card media-card" key={track.title}>
            <Image src={track.image} alt={track.alt} width={1200} height={800} />
            <div className="card-body">
              <span>{track.label}</span>
              <h2>{track.title}</h2>
              <p>{track.text}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
