 "use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { dict, type Lang } from "../i18n";

type FormType = "mentor" | "mentee";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const languages = [
  { value: "francais", label: { fr: "Français", en: "French" } },
  { value: "anglais", label: { fr: "Anglais", en: "English" } }
] as const;
const academicLevels = [
  { value: "12e annee", label: { fr: "12e année", en: "Grade 12" } },
  { value: "1re annee premed", label: { fr: "1re année préméd", en: "Premed year 1" } },
  { value: "2e annee premed", label: { fr: "2e année préméd", en: "Premed year 2" } },
  { value: "3e annee premed", label: { fr: "3e année préméd", en: "Premed year 3" } },
  { value: "4e annee premed", label: { fr: "4e année préméd", en: "Premed year 4" } },
  { value: "Medecine - annee 1", label: { fr: "Médecine - année 1", en: "Medicine - year 1" } },
  { value: "Medecine - annee 2", label: { fr: "Médecine - année 2", en: "Medicine - year 2" } },
  { value: "Medecine - annee 3", label: { fr: "Médecine - année 3", en: "Medicine - year 3" } },
  { value: "Medecine - annee 4", label: { fr: "Médecine - année 4", en: "Medicine - year 4" } },
  { value: "Medecine - internat", label: { fr: "Médecine - internat", en: "Medicine - internship" } },
  { value: "Medecine - residence R1", label: { fr: "Médecine - résidence R1", en: "Medicine - residency R1" } },
  { value: "Medecine - residence R2", label: { fr: "Médecine - résidence R2", en: "Medicine - residency R2" } },
  { value: "Medecine - residence R3", label: { fr: "Médecine - résidence R3", en: "Medicine - residency R3" } },
  { value: "Medecine - residence R4+", label: { fr: "Médecine - résidence R4+", en: "Medicine - residency R4+" } },
  { value: "Medecine - fellow", label: { fr: "Médecine - fellowship", en: "Medicine - fellowship" } }
] as const;

export default function RegistrationPage() {
  const [lang, setLang] = useState<Lang>("fr");
  const startedAt = useMemo(() => Date.now(), []);
  const [formType, setFormType] = useState<FormType>("mentor");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const t = dict[lang];
  const form = t.registration.form;

  useEffect(() => {
    const saved = localStorage.getItem("lang");
    setLang(saved === "en" ? "en" : "fr");
    const sync = () => {
      const next = localStorage.getItem("lang");
      setLang(next === "en" ? "en" : "fr");
    };
    window.addEventListener("lang-change", sync);
    return () => window.removeEventListener("lang-change", sync);
  }, []);

  async function submitMentor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const fd = new FormData(event.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      level: String(fd.get("level") || "").trim(),
      expertise: String(fd.get("expertise") || "").trim(),
      language: String(fd.get("language") || "").trim(),
      city: String(fd.get("city") || "").trim(),
      region: String(fd.get("region") || "").trim(),
      availability: String(fd.get("availability") || "").trim(),
      targetSpecialty: String(fd.get("targetSpecialty") || "").trim(),
      mentorCapacity: Number(fd.get("mentorCapacity") || 3),
      honeypot: String(fd.get("company") || ""),
      submittedAt: startedAt
    };
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!emailOk || payload.fullName.length < 2 || payload.expertise.length < 2) {
      setMessage(form.mentorInvalid);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/v1/applications/mentor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setMessage(res.ok ? form.mentorSuccess : form.submitError);
    } catch {
      setMessage(form.submitError);
    }
    setLoading(false);
  }

  async function submitMentee(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setLoading(true);
    const fd = new FormData(event.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      academicLevel: String(fd.get("academicLevel") || "").trim(),
      goals: String(fd.get("goals") || "").trim(),
      language: String(fd.get("language") || "").trim(),
      region: String(fd.get("region") || "").trim(),
      availability: String(fd.get("availability") || "").trim(),
      targetSpecialty: String(fd.get("targetSpecialty") || "").trim(),
      honeypot: String(fd.get("company") || ""),
      submittedAt: startedAt
    };
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!emailOk || payload.fullName.length < 2 || payload.goals.length < 8) {
      setMessage(form.menteeInvalid);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/api/v1/applications/mentee`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setMessage(res.ok ? form.menteeSuccess : form.submitError);
    } catch {
      setMessage(form.submitError);
    }
    setLoading(false);
  }

  return (
    <div className="page shell">
      <section className="hero hero-compact">
        <span className="eyebrow">{t.nav.registration}</span>
        <h1>{t.registration.title}</h1>
        <p>{t.registration.subtitle}</p>
      </section>
      <section className="section form-shell">
        <div className="segmented">
          <button className={formType === "mentor" ? "btn" : "btn alt"} type="button" onClick={() => setFormType("mentor")}>{form.mentor}</button>
          <button className={formType === "mentee" ? "btn" : "btn alt"} type="button" onClick={() => setFormType("mentee")}>{form.mentee}</button>
        </div>
        {formType === "mentor" ? (
          <form onSubmit={submitMentor}>
            <input name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
            <label htmlFor="mentor-fullName">{form.fullName}</label>
            <input id="mentor-fullName" name="fullName" minLength={2} maxLength={120} required />
            <label htmlFor="mentor-email">{form.email}</label>
            <input id="mentor-email" name="email" type="email" maxLength={160} required />
            <label htmlFor="mentor-level">{form.level}</label>
            <input id="mentor-level" name="level" minLength={2} maxLength={80} required />
            <label htmlFor="mentor-expertise">{form.expertise}</label>
            <input id="mentor-expertise" name="expertise" minLength={2} maxLength={240} required />
            <label htmlFor="mentor-language">{form.language}</label>
            <select id="mentor-language" name="language" defaultValue="" required>
              <option value="" disabled>{form.selectLanguage}</option>
              {languages.map((language) => (
                <option key={language.value} value={language.value}>{language.label[lang]}</option>
              ))}
            </select>
            <label htmlFor="mentor-city">{form.city}</label>
            <input id="mentor-city" name="city" minLength={2} maxLength={120} required />
            <label htmlFor="mentor-availability">{form.availability}</label>
            <input id="mentor-availability" name="availability" minLength={2} maxLength={160} required />
            <label htmlFor="mentor-region">{form.region}</label>
            <input id="mentor-region" name="region" minLength={2} maxLength={120} required />
            <label htmlFor="mentor-targetSpecialty">{form.targetSpecialty}</label>
            <input id="mentor-targetSpecialty" name="targetSpecialty" minLength={2} maxLength={160} required />
            <label htmlFor="mentor-mentorCapacity">{form.mentorCapacity}</label>
            <input id="mentor-mentorCapacity" name="mentorCapacity" type="number" min={1} max={20} defaultValue={3} required />
            <button className="btn" type="submit" disabled={loading}>{loading ? form.submitting : form.submitMentor}</button>
          </form>
        ) : (
          <form onSubmit={submitMentee}>
            <input name="company" tabIndex={-1} autoComplete="off" style={{ display: "none" }} />
            <label htmlFor="mentee-fullName">{form.fullName}</label>
            <input id="mentee-fullName" name="fullName" minLength={2} maxLength={120} required />
            <label htmlFor="mentee-email">{form.email}</label>
            <input id="mentee-email" name="email" type="email" maxLength={160} required />
            <label htmlFor="mentee-academicLevel">{form.academicLevel}</label>
            <select id="mentee-academicLevel" name="academicLevel" defaultValue="" required>
              <option value="" disabled>{form.selectAcademicLevel}</option>
              {academicLevels.map((level) => (
                <option key={level.value} value={level.value}>{level.label[lang]}</option>
              ))}
            </select>
            <label htmlFor="mentee-goals">{form.goals}</label>
            <textarea id="mentee-goals" name="goals" minLength={8} maxLength={500} rows={5} required />
            <label htmlFor="mentee-language">{form.language}</label>
            <select id="mentee-language" name="language" defaultValue="" required>
              <option value="" disabled>{form.selectLanguage}</option>
              {languages.map((language) => (
                <option key={language.value} value={language.value}>{language.label[lang]}</option>
              ))}
            </select>
            <label htmlFor="mentee-region">{form.region}</label>
            <input id="mentee-region" name="region" minLength={2} maxLength={120} required />
            <label htmlFor="mentee-availability">{form.availability}</label>
            <input id="mentee-availability" name="availability" minLength={2} maxLength={160} required />
            <label htmlFor="mentee-targetSpecialty">{form.targetSpecialty}</label>
            <input id="mentee-targetSpecialty" name="targetSpecialty" minLength={2} maxLength={160} required />
            <button className="btn" type="submit" disabled={loading}>{loading ? form.submitting : form.submitMentee}</button>
          </form>
        )}
        {message ? <p>{message}</p> : null}
      </section>
    </div>
  );
}
