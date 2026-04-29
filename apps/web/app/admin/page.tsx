 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { dict, type Lang } from "../i18n";

const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const contentTypes = ["NEWS", "EVENT", "PHOTO", "PAGE", "FAQ", "PARTNER", "HOMEPAGE_BANNER"] as const;
type ContentType = (typeof contentTypes)[number];
const contentTypeLabels = {
  fr: {
    NEWS: "Actualités",
    EVENT: "Événement",
    PHOTO: "Photo",
    PAGE: "Page",
    FAQ: "FAQ",
    PARTNER: "Partenaire",
    HOMEPAGE_BANNER: "Bannière"
  },
  en: {
    NEWS: "News",
    EVENT: "Event",
    PHOTO: "Photo",
    PAGE: "Page",
    FAQ: "FAQ",
    PARTNER: "Partner",
    HOMEPAGE_BANNER: "Homepage banner"
  }
} as const;
const publishStatusLabels = {
  fr: { DRAFT: "Brouillon", PUBLISHED: "Publié", ARCHIVED: "Archivé" },
  en: { DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived" }
} as const;
const editablePages = [
  { value: "home", label: { fr: "Accueil", en: "Home" } },
  { value: "team", label: { fr: "Équipe", en: "Team" } },
  { value: "registration", label: { fr: "Rejoindre", en: "Join" } },
  { value: "gallery", label: { fr: "Galerie", en: "Gallery" } },
  { value: "about", label: { fr: "À propos", en: "About" } },
  { value: "program", label: { fr: "Programme", en: "Program" } },
  { value: "events", label: { fr: "Événements", en: "Events" } },
  { value: "admin", label: { fr: "Admin", en: "Admin" } }
] as const;
const displayAreas = [
  { value: "hero", label: { fr: "Héro / haut de page", en: "Hero / top of page" } },
  { value: "main", label: { fr: "Section principale", en: "Main section" } },
  { value: "cards", label: { fr: "Cartes de contenu", en: "Content cards" } },
  { value: "testimonials", label: { fr: "Témoignages", en: "Testimonials" } },
  { value: "gallery", label: { fr: "Galerie", en: "Gallery" } },
  { value: "cta", label: { fr: "Appel à l'action", en: "Call to action" } },
  { value: "footer", label: { fr: "Pied de page", en: "Footer" } }
] as const;
const menuPositions = Array.from({ length: 12 }, (_, index) => index + 1);
type EditablePageKey = (typeof editablePages)[number]["value"];
type DisplayAreaKey = (typeof displayAreas)[number]["value"];
type PublishStatus = keyof typeof publishStatusLabels.fr;
type ContentMetadata = Record<string, unknown>;
type ContentItem = {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  summary?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  externalUrl?: string | null;
  metadata?: ContentMetadata | null;
  publishStatus: PublishStatus;
  createdAt?: string;
  updatedAt?: string;
  isTemplate?: boolean;
};
type BaseContentField = "title" | "slug" | "summary" | "body" | "mediaUrl" | "externalUrl";

const zoneFields: Record<DisplayAreaKey, BaseContentField[]> = {
  hero: ["title", "slug", "summary", "body", "mediaUrl", "externalUrl"],
  main: ["title", "slug", "summary", "body", "mediaUrl", "externalUrl"],
  cards: ["title", "slug", "summary", "body", "mediaUrl"],
  testimonials: ["title", "slug", "summary", "body"],
  gallery: ["title", "slug", "summary", "mediaUrl"],
  cta: ["title", "slug", "summary", "body", "externalUrl"],
  footer: ["title", "slug", "summary", "externalUrl"]
};
const zoneSupportsExtra: Record<DisplayAreaKey, boolean> = {
  hero: true,
  main: true,
  cards: true,
  testimonials: false,
  gallery: true,
  cta: true,
  footer: false
};

const hasZoneField = (area: DisplayAreaKey, field: BaseContentField) => zoneFields[area].includes(field);

const contentEditorCopy = {
  fr: {
    pageEditor: "Éditeur de page",
    pageToLoad: "Page à charger",
    loadedBlocks: "éléments chargés",
    createBlock: "Ajouter un élément à cette page",
    editBlocks: "Éléments de la page",
    pageHelp: "Choisissez une page pour charger tous ses éléments, puis modifiez chaque bloc séparément.",
    empty: "Aucun élément n'est encore associé à cette page.",
    loading: "Chargement de la page...",
    save: "Enregistrer l'élément",
    delete: "Supprimer",
    created: "Élément ajouté à la page.",
    saved: "Élément mis à jour.",
    deleted: "Élément supprimé.",
    closeAdd: "Masquer le formulaire d'ajout",
    saveError: "Impossible d'enregistrer cet élément.",
    loadError: "Impossible de charger le contenu de cette page.",
    networkError: "Connexion API impossible. Vérifiez que l'API est lancée et accessible.",
    deleteConfirm: "Supprimer cet élément de contenu ?",
    blockType: "Type d'élément",
    page: "Page",
    area: "Zone d'affichage",
    position: "Position",
    orderLabel: "Ordre de chargement",
    topToBottom: "Haut vers bas",
    bottomToTop: "Bas vers haut",
    translationTitle: "Version anglaise",
    translateWithGoogle: "Traduire avec Google Translate",
    translating: "Traduction...",
    translationHint: "La version traduite apparaît ici sans remplacer le contenu original.",
    translationError: "La traduction n'a pas pu être générée.",
    singleLoad: "Un seul élément est chargé à la fois, dans l'ordre choisi.",
    previousBlock: "Élément précédent",
    nextBlock: "Élément suivant",
    addSimilar: "Ajouter un élément similaire",
    previewTitle: "Aperçu de l'affichage",
    selectedZone: "Zone sélectionnée",
    noZoneElement: "Aucun élément disponible pour cette zone sur la page choisie."
  },
  en: {
    pageEditor: "Page editor",
    pageToLoad: "Page to load",
    loadedBlocks: "loaded items",
    createBlock: "Add an item to this page",
    editBlocks: "Page items",
    pageHelp: "Choose a page to load all of its items, then edit each block separately.",
    empty: "No item is associated with this page yet.",
    loading: "Loading page...",
    save: "Save item",
    delete: "Delete",
    created: "Item added to the page.",
    saved: "Item updated.",
    deleted: "Item deleted.",
    closeAdd: "Hide add form",
    saveError: "Could not save this item.",
    loadError: "Could not load this page content.",
    networkError: "API connection failed. Ensure the API is running and reachable.",
    deleteConfirm: "Delete this content item?",
    blockType: "Item type",
    page: "Page",
    area: "Display area",
    position: "Position",
    orderLabel: "Load order",
    topToBottom: "Top to bottom",
    bottomToTop: "Bottom to top",
    translationTitle: "French version",
    translateWithGoogle: "Translate with Google Translate",
    translating: "Translating...",
    translationHint: "The translated version appears here without replacing the original content.",
    translationError: "The translation could not be generated.",
    singleLoad: "Only one item is loaded at a time, in the selected order.",
    previousBlock: "Previous item",
    nextBlock: "Next item",
    addSimilar: "Add similar item",
    previewTitle: "Display preview",
    selectedZone: "Selected zone",
    noZoneElement: "No item is available for this zone on the selected page."
  }
} as const;

type ContentGuideField = {
  name: string;
  label: string;
  type: "input" | "textarea";
  inputType?: "text" | "date" | "url";
};
type ContentGuide = {
  helper: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  media: string;
  external: string;
  extra: ContentGuideField[];
};
const contentGuides: Record<Lang, Record<ContentType, ContentGuide>> = {
  fr: {
    NEWS: {
      helper: "Actualité affichée comme carte ou article court.",
      title: "Titre de l'actualité",
      slug: "Slug de l'actualité",
      summary: "Résumé affiché",
      body: "Texte complet",
      media: "Image de couverture",
      external: "Lien source",
      extra: [{ name: "author", label: "Auteur / source", type: "input" }]
    },
    EVENT: {
      helper: "Événement avec date, lieu et informations pratiques.",
      title: "Nom de l'événement",
      slug: "Slug de l'événement",
      summary: "Résumé affiché",
      body: "Description",
      media: "Image de l'événement",
      external: "Lien d'inscription",
      extra: [
        { name: "eventDate", label: "Date", type: "input", inputType: "date" },
        { name: "location", label: "Lieu", type: "input" },
        { name: "host", label: "Organisateur", type: "input" }
      ]
    },
    PHOTO: {
      helper: "Image destinée à la galerie ou à une section visuelle.",
      title: "Titre de la photo",
      slug: "Slug de la photo",
      summary: "Légende",
      body: "Description longue",
      media: "URL de l'image",
      external: "Lien externe",
      extra: [{ name: "altText", label: "Texte alternatif", type: "input" }]
    },
    PAGE: {
      helper: "Bloc de page: héro, mission, section, CTA ou élément de navigation.",
      title: "Titre affiché",
      slug: "Identifiant / slug",
      summary: "Sous-titre affiché",
      body: "Texte de section",
      media: "Image de section",
      external: "Lien du bouton",
      extra: [
        { name: "ctaLabel", label: "Texte du bouton", type: "input" },
        { name: "secondaryCtaLabel", label: "Texte du bouton secondaire", type: "input" },
        { name: "secondaryCtaUrl", label: "Lien du bouton secondaire", type: "input", inputType: "url" }
      ]
    },
    FAQ: {
      helper: "Question-réponse affichée dans une page ou une section FAQ.",
      title: "Question",
      slug: "Slug de la question",
      summary: "Résumé court",
      body: "Réponse",
      media: "Image optionnelle",
      external: "Lien utile",
      extra: [{ name: "category", label: "Catégorie", type: "input" }]
    },
    PARTNER: {
      helper: "Partenaire affiché avec logo, description et lien.",
      title: "Nom du partenaire",
      slug: "Slug du partenaire",
      summary: "Description courte",
      body: "Description complète",
      media: "URL du logo",
      external: "Site web",
      extra: [{ name: "partnerType", label: "Type de partenaire", type: "input" }]
    },
    HOMEPAGE_BANNER: {
      helper: "Bannière principale de l'accueil avec image, message et bouton.",
      title: "Grand titre",
      slug: "Identifiant de bannière",
      summary: "Sous-titre",
      body: "Texte complémentaire",
      media: "Image de fond",
      external: "Lien du bouton principal",
      extra: [{ name: "ctaLabel", label: "Texte du bouton principal", type: "input" }]
    }
  },
  en: {
    NEWS: {
      helper: "News item displayed as a card or short article.",
      title: "News title",
      slug: "News slug",
      summary: "Displayed summary",
      body: "Full text",
      media: "Cover image",
      external: "Source link",
      extra: [{ name: "author", label: "Author / source", type: "input" }]
    },
    EVENT: {
      helper: "Event with date, location, and practical details.",
      title: "Event name",
      slug: "Event slug",
      summary: "Displayed summary",
      body: "Description",
      media: "Event image",
      external: "Registration link",
      extra: [
        { name: "eventDate", label: "Date", type: "input", inputType: "date" },
        { name: "location", label: "Location", type: "input" },
        { name: "host", label: "Host", type: "input" }
      ]
    },
    PHOTO: {
      helper: "Image used in the gallery or a visual section.",
      title: "Photo title",
      slug: "Photo slug",
      summary: "Caption",
      body: "Long description",
      media: "Image URL",
      external: "External link",
      extra: [{ name: "altText", label: "Alt text", type: "input" }]
    },
    PAGE: {
      helper: "Page block: hero, mission, section, CTA, or navigation item.",
      title: "Displayed title",
      slug: "Identifier / slug",
      summary: "Displayed subtitle",
      body: "Section text",
      media: "Section image",
      external: "Button link",
      extra: [
        { name: "ctaLabel", label: "Button text", type: "input" },
        { name: "secondaryCtaLabel", label: "Secondary button text", type: "input" },
        { name: "secondaryCtaUrl", label: "Secondary button link", type: "input", inputType: "url" }
      ]
    },
    FAQ: {
      helper: "Question and answer displayed on a page or FAQ section.",
      title: "Question",
      slug: "Question slug",
      summary: "Short summary",
      body: "Answer",
      media: "Optional image",
      external: "Helpful link",
      extra: [{ name: "category", label: "Category", type: "input" }]
    },
    PARTNER: {
      helper: "Partner displayed with logo, description, and link.",
      title: "Partner name",
      slug: "Partner slug",
      summary: "Short description",
      body: "Full description",
      media: "Logo URL",
      external: "Website",
      extra: [{ name: "partnerType", label: "Partner type", type: "input" }]
    },
    HOMEPAGE_BANNER: {
      helper: "Homepage banner with image, message, and button.",
      title: "Main headline",
      slug: "Banner identifier",
      summary: "Subtitle",
      body: "Supporting text",
      media: "Background image",
      external: "Primary button link",
      extra: [{ name: "ctaLabel", label: "Primary button text", type: "input" }]
    }
  }
} as const;

const displayAreaRank = displayAreas.reduce<Record<string, number>>((acc, area, index) => {
  acc[area.value] = index;
  return acc;
}, {});

const normalizeMetadata = (metadata?: ContentMetadata | null): ContentMetadata => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  return metadata;
};

const metadataString = (metadata: ContentMetadata | undefined | null, key: string) => {
  const value = normalizeMetadata(metadata)[key];
  return value === undefined || value === null ? "" : String(value);
};

const metadataNumber = (metadata: ContentMetadata | undefined | null, key: string, fallback: number) => {
  const value = Number(normalizeMetadata(metadata)[key]);
  return Number.isFinite(value) ? value : fallback;
};

const pageKeyFromMetadata = (metadata?: ContentMetadata | null) => metadataString(metadata, "pageKey") || "home";
const displayAreaFromMetadata = (metadata?: ContentMetadata | null) => metadataString(metadata, "displayArea") || "main";
const displayPositionFromMetadata = (metadata?: ContentMetadata | null) => metadataNumber(metadata, "displayPosition", 1);

const sortPageItems = (items: ContentItem[], pageKey: EditablePageKey) =>
  items
    .filter((item) => pageKeyFromMetadata(item.metadata) === pageKey)
    .sort((a, b) => {
      const areaA = displayAreaRank[displayAreaFromMetadata(a.metadata)] ?? displayAreas.length;
      const areaB = displayAreaRank[displayAreaFromMetadata(b.metadata)] ?? displayAreas.length;
      if (areaA !== areaB) return areaA - areaB;
      const positionA = displayPositionFromMetadata(a.metadata);
      const positionB = displayPositionFromMetadata(b.metadata);
      if (positionA !== positionB) return positionA - positionB;
      return a.title.localeCompare(b.title);
    });

const makeTemplateItem = (
  pageKey: EditablePageKey,
  displayArea: DisplayAreaKey,
  displayPosition: number,
  type: ContentType,
  slug: string,
  title: string,
  summary = "",
  body = "",
  metadata: ContentMetadata = {}
): ContentItem => ({
  id: `template-${pageKey}-${slug}`,
  type,
  title,
  slug,
  summary,
  body,
  mediaUrl: "",
  externalUrl: "",
  publishStatus: "DRAFT",
  isTemplate: true,
  metadata: {
    pageKey,
    displayArea,
    displayPosition,
    menuPosition: displayPosition,
    ...metadata
  }
});

const buildPageBlueprints = (lang: Lang): Record<EditablePageKey, ContentItem[]> => {
  const t = dict[lang];
  return {
    home: [
      makeTemplateItem("home", "hero", 1, "HOMEPAGE_BANNER", "home-hero", t.home.title, t.home.subtitle, "Black Med Collective", { ctaLabel: t.home.cta1 }),
      makeTemplateItem(
        "home",
        "main",
        2,
        "PAGE",
        "home-mission",
        lang === "fr" ? "Représentation, mentorat et soutien aux candidatures" : "Representation, mentorship, and application support",
        lang === "fr" ? "Section mission de la page d'accueil" : "Homepage mission section",
        lang === "fr"
          ? "Une communauté structurée pour accompagner les candidats, les mentors et les organisateurs."
          : "A structured community for applicants, mentors, and organizers.",
        { ctaLabel: t.home.cta2 }
      ),
      makeTemplateItem("home", "cards", 3, "PAGE", "home-community-events", "Community Events", "Spaces for students, mentors, and physicians.", "Spaces for students, mentors, and physicians to meet, learn, and build confidence."),
      makeTemplateItem("home", "cards", 4, "PAGE", "home-mentorship", "Mentorship", "Guided connections.", "Guided connections between aspiring physicians and people already walking the path."),
      makeTemplateItem("home", "cards", 5, "PAGE", "home-application-support", "Application Support", "Structured application support.", "Structured help for applications, MCAT planning, interviews, and next steps."),
      makeTemplateItem("home", "testimonials", 6, "PAGE", "home-testimonial", "Testimonials", "Built around encouragement, visibility, and practical support.", "A radiant community that uplifts Black students and nurtures their passion for medicine."),
      makeTemplateItem("home", "cta", 7, "PAGE", "home-join", "Join our movement", "Take the next step in your medical journey.", "Take the next step in your medical journey with a community designed to support you.", { ctaLabel: "Fill the platform form" })
    ],
    team: [
      makeTemplateItem("team", "hero", 1, "PAGE", "team-hero", t.team.title, t.team.subtitle),
      makeTemplateItem("team", "cards", 2, "PAGE", "team-physician-mentors", "Physician mentors", "Mentors", "Critical care, internal medicine, surgery, neuroscience, endocrinology, and community care perspectives."),
      makeTemplateItem("team", "cards", 3, "PAGE", "team-community-builders", "Community builders", "Founders", "Leaders who combine clinical excellence, representation, and long-term support for Black students."),
      makeTemplateItem("team", "cards", 4, "PAGE", "team-students-trainees", "Students and trainees", "Members", "Aspiring physicians learning through events, coaching, mentorship, and shared accountability."),
      makeTemplateItem("team", "cta", 5, "PAGE", "team-community", lang === "fr" ? "Une communauté qui rend le parcours visible." : "A community that makes the path visible.", "", lang === "fr" ? "Le rôle de l'équipe est de relier inspiration, conseils concrets et occasions de leadership." : "The team's role is to connect inspiration, practical guidance, and leadership opportunities.")
    ],
    registration: [
      makeTemplateItem("registration", "hero", 1, "PAGE", "registration-hero", t.registration.title, t.registration.subtitle),
      makeTemplateItem("registration", "main", 2, "PAGE", "registration-mentor-form", lang === "fr" ? "Formulaire mentor" : "Mentor form", t.registration.form.submitMentor, lang === "fr" ? "Champs: nom, courriel, niveau, expertise, langue, ville, région, disponibilités, spécialité et capacité." : "Fields: name, email, level, expertise, language, city, region, availability, specialty, and capacity."),
      makeTemplateItem("registration", "main", 3, "PAGE", "registration-mentee-form", lang === "fr" ? "Formulaire mentoré" : "Mentee form", t.registration.form.submitMentee, lang === "fr" ? "Champs: nom, courriel, niveau scolaire, objectifs, langue, région, disponibilités et spécialité visée." : "Fields: name, email, academic level, goals, language, region, availability, and target specialty.")
    ],
    gallery: [
      makeTemplateItem("gallery", "hero", 1, "PAGE", "gallery-hero", t.gallery.title, t.gallery.subtitle),
      ...["Community event", "Mentorship circle", "Application workshop", "Educational talk", "Interview practice", "Medicine in colour"].map((title, index) =>
        makeTemplateItem("gallery", "gallery", index + 2, "PHOTO", `gallery-${index + 1}`, title, lang === "fr" ? "Légende de galerie" : "Gallery caption", "", { altText: title })
      )
    ],
    about: [
      makeTemplateItem("about", "hero", 1, "PAGE", "about-hero", t.about.title, t.about.subtitle),
      makeTemplateItem("about", "cards", 2, "PAGE", "about-mission", "Excellence équitable", "Mission", "Drive equitable excellence in healthcare leadership and training."),
      makeTemplateItem("about", "cards", 3, "PAGE", "about-vision", "Standard moderne", "Vision", "Set a modern institutional standard for professional development at scale."),
      makeTemplateItem("about", "cards", 4, "PAGE", "about-values", "Confiance durable", "Values", "Integrity, measurable impact, cultural stewardship, and collaboration.")
    ],
    program: [
      makeTemplateItem("program", "hero", 1, "PAGE", "program-hero", t.program.title, t.program.subtitle),
      makeTemplateItem("program", "cards", 2, "PAGE", "program-foundation", "Foundation", "Track 1", "Career strategy, leadership mindset, and network positioning."),
      makeTemplateItem("program", "cards", 3, "PAGE", "program-advancement", "Advancement", "Track 2", "Operational leadership, institutional navigation, and governance."),
      makeTemplateItem("program", "cards", 4, "PAGE", "program-executive", "Executive", "Track 3", "Board readiness, policy impact, and multi-site systems thinking."),
      makeTemplateItem("program", "cards", 5, "PAGE", "program-mentor-labs", "Mentor Labs", "Lab", "Small-group sessions with senior practitioners and institutional advisors.")
    ],
    events: [
      makeTemplateItem("events", "hero", 1, "PAGE", "events-hero", t.events.title, t.events.subtitle),
      makeTemplateItem("events", "cards", 2, "EVENT", "annual-summit", "Annual Summit", "Toronto • September 2026", "", { eventDate: "2026-09-01", location: "Toronto", host: "Black Med Collective" }),
      makeTemplateItem("events", "cards", 3, "EVENT", "policy-roundtable", "Policy Roundtable", "Ottawa • October 2026", "", { eventDate: "2026-10-01", location: "Ottawa", host: "Black Med Collective" }),
      makeTemplateItem("events", "cards", 4, "EVENT", "innovation-session", "Innovation Session", "Montreal • November 2026", "", { eventDate: "2026-11-01", location: "Montreal", host: "Black Med Collective" })
    ],
    admin: [
      makeTemplateItem("admin", "hero", 1, "PAGE", "admin-hero", t.admin.title, t.admin.subtitle),
      makeTemplateItem("admin", "cards", 2, "PAGE", "admin-overview", t.admin.menu.overview, t.admin.totalMentors, t.admin.subtitle),
      makeTemplateItem("admin", "cards", 3, "PAGE", "admin-registrations", t.admin.menu.registrations, t.admin.recentRegistrations),
      makeTemplateItem("admin", "cards", 4, "PAGE", "admin-analytics", t.admin.menu.analytics, t.admin.monthlyActivity),
      makeTemplateItem("admin", "cards", 5, "PAGE", "admin-content", t.admin.menu.content, t.admin.contentManagement)
    ]
  };
};

const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("adminAccessToken") || localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const buildTranslationText = (item: ContentItem, guide: ContentGuide) => {
  const rows = [
    { label: guide.title, value: item.title },
    { label: guide.summary, value: item.summary || "" },
    { label: guide.body, value: item.body || "" },
    { label: guide.external, value: item.externalUrl || "" }
  ];
  guide.extra.forEach((field) => {
    rows.push({ label: field.label, value: metadataString(item.metadata, field.name) });
  });
  return rows
    .filter((row) => row.value.trim().length > 0)
    .map((row) => `${row.label}: ${row.value}`)
    .join("\n");
};

type DashboardData = {
  totals: { totalMentors: number; totalMentees: number; activeMatches: number };
  recentRegistrations: {
    mentors: { id?: string; name: string; email: string; createdAt: string; region?: string; language?: string }[];
    mentees: { id?: string; name: string; email: string; createdAt: string; region?: string; language?: string }[];
  };
  monthlyActivity: { month: string; mentors: number; mentees: number }[];
};
type AdminView = "overview" | "registrations" | "analytics" | "content";
type LoadDirection = "top-to-bottom" | "bottom-to-top";
type TranslationState = Record<string, { status: "idle" | "loading" | "done" | "error"; text: string }>;

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toString = (value: unknown): string => (typeof value === "string" ? value : "");

const normalizePersonRows = (value: unknown): { id?: string; name: string; email: string; createdAt: string; region?: string; language?: string }[] => {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const record = toRecord(row);
    return {
      id: toString(record?.id),
      name: toString(record?.name),
      email: toString(record?.email),
      createdAt: toString(record?.createdAt),
      region: toString(record?.region),
      language: toString(record?.language)
    };
  });
};

const normalizeMonthlyActivity = (value: unknown): { month: string; mentors: number; mentees: number }[] => {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const record = toRecord(row);
    return {
      month: toString(record?.month),
      mentors: toNumber(record?.mentors),
      mentees: toNumber(record?.mentees)
    };
  });
};

const normalizeDashboardData = (value: unknown): DashboardData | null => {
  const root = toRecord(value);
  if (!root) return null;
  const totals = toRecord(root.totals);
  const recent = toRecord(root.recentRegistrations);

  return {
    totals: {
      totalMentors: toNumber(totals?.totalMentors),
      totalMentees: toNumber(totals?.totalMentees),
      activeMatches: toNumber(totals?.activeMatches)
    },
    recentRegistrations: {
      mentors: normalizePersonRows(recent?.mentors),
      mentees: normalizePersonRows(recent?.mentees)
    },
    monthlyActivity: normalizeMonthlyActivity(root.monthlyActivity)
  };
};

export default function AdminPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("fr");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState("admin@blackmedcollective.com");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [activeView, setActiveView] = useState<AdminView>("overview");
  const [data, setData] = useState<DashboardData | null>(null);
  const [contentType, setContentType] = useState<ContentType>("NEWS");
  const [selectedPage, setSelectedPage] = useState<EditablePageKey>("home");
  const [selectedArea, setSelectedArea] = useState<DisplayAreaKey>(displayAreas[0].value);
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [contentNotice, setContentNotice] = useState("");
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [loadDirection, setLoadDirection] = useState<LoadDirection>("top-to-bottom");
  const [translations, setTranslations] = useState<TranslationState>({});
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [similarSource, setSimilarSource] = useState<ContentItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState<"mentor" | "mentee">("mentor");
  const [modalRecordId, setModalRecordId] = useState("");
  const [modalName, setModalName] = useState("");
  const [modalEmail, setModalEmail] = useState("");
  const [modalBusy, setModalBusy] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCategory, setDeleteCategory] = useState<"mentor" | "mentee">("mentor");
  const [deleteId, setDeleteId] = useState<string>("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addCategory, setAddCategory] = useState<"mentor" | "mentee">("mentor");
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [mentorRowsVisible, setMentorRowsVisible] = useState(5);
  const [menteeRowsVisible, setMenteeRowsVisible] = useState(5);
  const mentorTotal = data?.recentRegistrations.mentors?.length || 0;
  const menteeTotal = data?.recentRegistrations.mentees?.length || 0;
  const mentorStep = mentorRowsVisible >= 10 ? 20 : 10;
  const menteeStep = menteeRowsVisible >= 10 ? 20 : 10;
  const t = dict[lang].admin;
  const guide = contentGuides[lang][contentType];
  const editorText = contentEditorCopy[lang];
  const selectedPageLabel = editablePages.find((page) => page.value === selectedPage)?.label[lang] || selectedPage;
  const translationTarget: Lang = lang === "fr" ? "en" : "fr";
  const visibleContentItems = useMemo(() => {
    const existingSlugs = new Set(contentItems.map((item) => item.slug));
    const templates = buildPageBlueprints(lang)[selectedPage].filter((item) => !existingSlugs.has(item.slug));
    return sortPageItems([...contentItems, ...templates], selectedPage);
  }, [contentItems, lang, selectedPage]);
  const zoneContentItems = useMemo(
    () => visibleContentItems.filter((item) => displayAreaFromMetadata(item.metadata) === selectedArea),
    [selectedArea, visibleContentItems]
  );
  const orderedContentItems = useMemo(
    () => (loadDirection === "top-to-bottom" ? zoneContentItems : [...zoneContentItems].reverse()),
    [loadDirection, zoneContentItems]
  );
  const activeContentItem = orderedContentItems[activeBlockIndex];
  const similarDisplayArea = similarSource ? displayAreaFromMetadata(similarSource.metadata) : selectedArea;
  const similarDisplayPosition = similarSource
    ? Math.min(displayPositionFromMetadata(similarSource.metadata) + 1, menuPositions.length)
    : 1;
  const menuItems: { id: AdminView; label: string }[] = [
    { id: "overview", label: t.menu.overview },
    { id: "registrations", label: t.menu.registrations },
    { id: "analytics", label: t.menu.analytics },
    { id: "content", label: t.menu.content }
  ];

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem("lang");
      setLang(saved === "en" ? "en" : "fr");
      const token = localStorage.getItem("adminAccessToken") || localStorage.getItem("accessToken");
      setIsAuthenticated(Boolean(token));
    };
    sync();
    window.addEventListener("lang-change", sync);
    return () => window.removeEventListener("lang-change", sync);
  }, []);

  useEffect(() => {
    fetch(`${apiBase}/api/v1/admin/dashboard`)
      .then((r) => r.json())
      .then((payload) => setData(normalizeDashboardData(payload)))
      .catch(() => setData(null));
  }, []);

  const refreshDashboard = useCallback(async () => {
    const response = await fetch(`${apiBase}/api/v1/admin/dashboard`);
    const payload = await response.json();
    setData(normalizeDashboardData(payload));
  }, []);

  const refreshContentItems = useCallback(async (pageKey: EditablePageKey = selectedPage) => {
    setIsContentLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/v1/content`);
      if (!response.ok) throw new Error("Content request failed");
      const result = await response.json();
      setContentItems(sortPageItems(Array.isArray(result) ? result : [], pageKey));
      setContentNotice("");
    } catch {
      setContentItems([]);
      setContentNotice(`${editorText.loadError} (${apiBase})`);
    } finally {
      setIsContentLoading(false);
    }
  }, [editorText.loadError, selectedPage]);

  useEffect(() => {
    refreshContentItems(selectedPage);
  }, [refreshContentItems, selectedPage]);

  useEffect(() => {
    setActiveBlockIndex(0);
    setSimilarSource(null);
    setIsCreateFormOpen(false);
  }, [selectedPage, selectedArea, loadDirection]);

  useEffect(() => {
    if (activeBlockIndex >= orderedContentItems.length) {
      setActiveBlockIndex(Math.max(orderedContentItems.length - 1, 0));
    }
  }, [activeBlockIndex, orderedContentItems.length]);

  const graph = useMemo(() => {
    if (!data || !Array.isArray(data.monthlyActivity) || data.monthlyActivity.length === 0) return null;
    const max = Math.max(...data.monthlyActivity.map((m) => Math.max(m.mentors, m.mentees)), 1);
    return data.monthlyActivity.map((m) => ({
      ...m,
      mentorHeight: Math.round((m.mentors / max) * 120),
      menteeHeight: Math.round((m.mentees / max) * 120)
    }));
  }, [data]);

  const downloadExcel = () => {
    window.open(`${apiBase}/api/v1/admin/export`, "_blank");
  };

  const loginAdmin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginBusy(true);
    setLoginError("");
    try {
      const response = await fetch(`${apiBase}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      if (!response.ok) throw new Error(lang === "fr" ? "Identifiants invalides." : "Invalid credentials.");
      const payload = await response.json();
      if (!payload?.accessToken) throw new Error(lang === "fr" ? "Connexion impossible." : "Login failed.");
      localStorage.setItem("adminAccessToken", payload.accessToken);
      if (payload.refreshToken) localStorage.setItem("adminRefreshToken", payload.refreshToken);
      setIsAuthenticated(true);
      setLoginPassword("");
      setContentNotice(lang === "fr" ? "Connecté." : "Signed in.");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : lang === "fr" ? "Erreur réseau." : "Network error.");
    } finally {
      setLoginBusy(false);
    }
  };

  const logoutAdmin = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("bmc_admin_token");
    localStorage.removeItem("bmc_admin_refresh_token");
    setIsAuthenticated(false);
    setContentNotice(lang === "fr" ? "Déconnecté." : "Signed out.");
    router.push("/");
  };

  const openRegistrationModal = (category: "mentor" | "mentee", row: { id?: string; name: string; email: string }) => {
    if (!row.id) return;
    setModalCategory(category);
    setModalRecordId(row.id);
    setModalName(row.name);
    setModalEmail(row.email);
    setModalError("");
    setModalOpen(true);
  };

  const saveRegistrationModal = async () => {
    if (!modalRecordId) return;
    setModalBusy(true);
    setModalError("");
    try {
      const response = await fetch(`${apiBase}/api/v1/admin/registrations/${modalCategory}/${modalRecordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ fullName: modalName, email: modalEmail })
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error(lang === "fr" ? "Session expirée. Reconnectez-vous." : "Session expired. Please sign in again.");
        throw new Error(lang === "fr" ? "Échec de la mise à jour." : "Update failed.");
      }
      setModalOpen(false);
      await refreshDashboard();
    } catch (error) {
      setModalError(error instanceof Error ? error.message : lang === "fr" ? "Erreur réseau." : "Network error.");
    } finally {
      setModalBusy(false);
    }
  };

  const askDeleteRegistration = (category: "mentor" | "mentee", id?: string) => {
    if (!id) return;
    setDeleteCategory(category);
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const confirmDeleteRegistration = async () => {
    if (!deleteId) return;
    setContentNotice("");
    try {
      const response = await fetch(`${apiBase}/api/v1/admin/registrations/${deleteCategory}/${deleteId}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        if (response.status === 401) throw new Error(lang === "fr" ? "Session expirée. Reconnectez-vous." : "Session expired. Please sign in again.");
        throw new Error(lang === "fr" ? "Suppression impossible." : "Delete failed.");
      }
      setDeleteModalOpen(false);
      await refreshDashboard();
    } catch (error) {
      setContentNotice(error instanceof Error ? error.message : lang === "fr" ? "Erreur réseau." : "Network error.");
    }
  };

  const openAddModal = (category: "mentor" | "mentee") => {
    setAddCategory(category);
    setAddName("");
    setAddEmail("");
    setAddModalOpen(true);
  };

  const confirmAddRegistration = async () => {
    if (!addName || !addEmail) return;
    const basePayload =
      addCategory === "mentor"
        ? {
            fullName: addName,
            email: addEmail,
            level: "12e année",
            expertise: "Mentorat",
            language: "fr",
            city: "Montreal",
            region: "QC",
            availability: "Soirs",
            targetSpecialty: "Médecine générale",
            mentorCapacity: 3
          }
        : {
            fullName: addName,
            email: addEmail,
            academicLevel: "12e année",
            goals: "Orientation",
            language: "fr",
            region: "QC",
            availability: "Soirs",
            targetSpecialty: "Médecine générale"
          };
    try {
      const response = await fetch(`${apiBase}/api/v1/admin/registrations/${addCategory}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(basePayload)
      });
      if (!response.ok) throw new Error(lang === "fr" ? "Ajout impossible." : "Create failed.");
      setAddModalOpen(false);
      await refreshDashboard();
    } catch (error) {
      setContentNotice(error instanceof Error ? error.message : lang === "fr" ? "Erreur réseau." : "Network error.");
    }
  };

  const buildContentPayload = (fd: FormData, type: ContentType, existingMetadata?: ContentMetadata | null) => {
    const metadata = normalizeMetadata(existingMetadata);
    const payloadGuide = contentGuides[lang][type];
    const extraMetadata = payloadGuide.extra.reduce<ContentMetadata>((acc, field) => {
      acc[field.name] = fd.has(field.name) ? String(fd.get(field.name) || "") : metadataString(metadata, field.name);
      return acc;
    }, {});
    const nextPageKey = String(fd.get("pageKey") || selectedPage) as EditablePageKey;
    const nextDisplayPosition = Number(fd.get("displayPosition") || 1);

    return {
      type,
      title: String(fd.get("title") || ""),
      slug: String(fd.get("slug") || ""),
      summary: String(fd.get("summary") || ""),
      body: String(fd.get("body") || ""),
      mediaUrl: String(fd.get("mediaUrl") || ""),
      externalUrl: String(fd.get("externalUrl") || ""),
      publishStatus: String(fd.get("publishStatus") || "DRAFT") as PublishStatus,
      metadata: {
        ...metadata,
        pageKey: nextPageKey,
        displayArea: String(fd.get("displayArea") || "main") as DisplayAreaKey,
        displayPosition: nextDisplayPosition,
        menuPosition: nextDisplayPosition,
        ...extraMetadata
      }
    };
  };

  const createContent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextPageKey = String(fd.get("pageKey") || selectedPage) as EditablePageKey;
    let response: Response;
    try {
      response = await fetch(`${apiBase}/api/v1/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(buildContentPayload(fd, contentType))
      });
    } catch {
      setContentNotice(`${editorText.networkError} (${apiBase})`);
      return;
    }
    if (!response.ok) {
      setContentNotice(editorText.saveError);
      return;
    }
    e.currentTarget.reset();
    setSelectedPage(nextPageKey);
    setIsCreateFormOpen(false);
    setSimilarSource(null);
    setContentNotice(editorText.created);
    await refreshContentItems(nextPageKey);
  };

  const updateContent = async (item: ContentItem, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const nextType = String(fd.get("type") || item.type) as ContentType;
    const nextPageKey = String(fd.get("pageKey") || selectedPage) as EditablePageKey;
    let response: Response;
    try {
      response = await fetch(item.isTemplate ? `${apiBase}/api/v1/content` : `${apiBase}/api/v1/content/${item.id}`, {
        method: item.isTemplate ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(buildContentPayload(fd, nextType, item.metadata))
      });
    } catch {
      setContentNotice(`${editorText.networkError} (${apiBase})`);
      return;
    }
    if (!response.ok) {
      setContentNotice(editorText.saveError);
      return;
    }
    setSelectedPage(nextPageKey);
    setContentNotice(item.isTemplate ? editorText.created : editorText.saved);
    await refreshContentItems(nextPageKey);
  };

  const deleteContent = async (item: ContentItem) => {
    if (!window.confirm(editorText.deleteConfirm)) return;
    let response: Response;
    try {
      response = await fetch(`${apiBase}/api/v1/content/${item.id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
      });
    } catch {
      setContentNotice(`${editorText.networkError} (${apiBase})`);
      return;
    }
    if (!response.ok) {
      setContentNotice(editorText.saveError);
      return;
    }
    setContentNotice(editorText.deleted);
    await refreshContentItems(selectedPage);
  };

  const startSimilarContent = (item: ContentItem) => {
    setContentType(item.type);
    setSimilarSource(item);
    setIsCreateFormOpen(true);
  };

  const translateContent = async (item: ContentItem, itemGuide: ContentGuide) => {
    const sourceText = buildTranslationText(item, itemGuide);
    if (!sourceText) return;

    setTranslations((current) => ({
      ...current,
      [item.id]: { status: "loading", text: current[item.id]?.text || "" }
    }));

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: lang, target: translationTarget, text: sourceText })
      });
      if (!response.ok) throw new Error("Translation failed");
      const result = await response.json();
      setTranslations((current) => ({
        ...current,
        [item.id]: { status: "done", text: String(result.translatedText || "") }
      }));
    } catch {
      setTranslations((current) => ({
        ...current,
        [item.id]: { status: "error", text: editorText.translationError }
      }));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page shell admin-page admin-login-page">
        <section className="hero hero-compact admin-hero admin-login-hero">
          <h1>{lang === "fr" ? "Connexion Admin" : "Admin Login"}</h1>
          <form className="admin-login-form" onSubmit={loginAdmin}>
            <label htmlFor="admin-email">{lang === "fr" ? "Email" : "Email"}</label>
            <input id="admin-email" type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
            <label htmlFor="admin-password">{lang === "fr" ? "Mot de passe" : "Password"}</label>
            <input id="admin-password" type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
            {loginError ? <p className="form-help" role="alert">{loginError}</p> : null}
            <button className="btn" type="submit" disabled={loginBusy}>
              {loginBusy ? (lang === "fr" ? "Connexion..." : "Signing in...") : (lang === "fr" ? "Se connecter" : "Sign in")}
            </button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="page shell admin-page">
      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label={lang === "fr" ? "Menu du tableau de bord" : "Dashboard menu"}>
          <div className="admin-sidebar-header">
            <span className="brand-mark" aria-hidden="true">AD</span>
            <div>
              <strong>{t.title}</strong>
              <span>{t.eyebrow}</span>
            </div>
          </div>
          <nav className="admin-menu" aria-label={lang === "fr" ? "Sections du tableau de bord" : "Dashboard sections"}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={activeView === item.id ? "active" : undefined}
                aria-current={activeView === item.id ? "page" : undefined}
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <button className="btn admin-export" onClick={downloadExcel} type="button">{t.export}</button>
          <div className="admin-auth-box">
            <p className="form-help">{isAuthenticated ? (lang === "fr" ? "Session active" : "Session active") : (lang === "fr" ? "Session inactive" : "Session inactive")}</p>
            <button className="btn alt" type="button" onClick={logoutAdmin}>
              {lang === "fr" ? "Déconnexion" : "Sign out"}
            </button>
          </div>
        </aside>

        <div className="admin-main">
          {activeView === "overview" ? (
            <div className="admin-view">
              <section className="hero hero-compact admin-hero">
                <span className="eyebrow">{t.eyebrow}</span>
                <h1>{t.title}</h1>
                <p>{t.subtitle}</p>
              </section>

              <section className="section grid cols-3 admin-kpis" aria-label={t.menu.overview}>
                <article className="card"><div className="kpi">{data?.totals.totalMentors ?? "--"}</div><p>{t.totalMentors}</p></article>
                <article className="card"><div className="kpi">{data?.totals.totalMentees ?? "--"}</div><p>{t.totalMentees}</p></article>
                <article className="card"><div className="kpi">{data?.totals.activeMatches ?? "--"}</div><p>{t.activeMatches}</p></article>
              </section>
            </div>
          ) : null}

          {activeView === "registrations" ? (
            <section className="admin-view">
              <section className="grid cols-3 admin-kpis" aria-label={t.recentRegistrations}>
                <article className="card"><div className="kpi">{data?.totals.totalMentors ?? "--"}</div><p>{t.totalMentors}</p></article>
                <article className="card"><div className="kpi">{data?.totals.totalMentees ?? "--"}</div><p>{t.totalMentees}</p></article>
                <article className="card"><div className="kpi">{data?.totals.activeMatches ?? "--"}</div><p>{t.activeMatches}</p></article>
              </section>
              <h2 style={{ marginTop: 18 }}>{t.recentRegistrations}</h2>
              <div className="grid cols-2">
              <div className="registration-column">
              <article className="card">
                <p>{t.mentors}</p>
                <div className="content-list">
                  {(data?.recentRegistrations.mentors || []).slice(0, mentorRowsVisible).map((x) => (
                    <div className="content-row" key={`${x.id || x.email}-${x.createdAt}`}>
                      <span>{x.name} - {x.email}</span>
                      <button className="btn alt" type="button" onClick={() => openRegistrationModal("mentor", x)}>{lang === "fr" ? "Modifier" : "Edit"}</button>
                      <button className="btn alt" type="button" onClick={() => askDeleteRegistration("mentor", x.id)}>{lang === "fr" ? "Supprimer" : "Delete"}</button>
                    </div>
                  ))}
                </div>
                <div className="editor-actions">
                  <button
                    className="btn admin-more-btn"
                    type="button"
                    onClick={() => setMentorRowsVisible((v) => v + mentorStep)}
                    disabled={mentorTotal <= mentorRowsVisible}
                  >
                    {lang === "fr" ? `Afficher +${mentorStep}` : `Show +${mentorStep}`}
                  </button>
                  <button
                    className="btn alt admin-less-btn"
                    type="button"
                    onClick={() => setMentorRowsVisible(5)}
                    disabled={mentorRowsVisible <= 5}
                  >
                    {lang === "fr" ? "Afficher moins" : "Show less"}
                  </button>
                </div>
              </article>
              <div className="registration-add-row">
                <button className="btn" type="button" onClick={() => openAddModal("mentor")}>
                  {lang === "fr" ? "Ajouter mentor" : "Add mentor"}
                </button>
              </div>
              </div>
              <div className="registration-column">
              <article className="card">
                <p>{t.mentees}</p>
                <div className="content-list">
                  {(data?.recentRegistrations.mentees || []).slice(0, menteeRowsVisible).map((x) => (
                    <div className="content-row" key={`${x.id || x.email}-${x.createdAt}`}>
                      <span>{x.name} - {x.email}</span>
                      <button className="btn alt" type="button" onClick={() => openRegistrationModal("mentee", x)}>{lang === "fr" ? "Modifier" : "Edit"}</button>
                      <button className="btn alt" type="button" onClick={() => askDeleteRegistration("mentee", x.id)}>{lang === "fr" ? "Supprimer" : "Delete"}</button>
                    </div>
                  ))}
                </div>
                <div className="editor-actions">
                  <button
                    className="btn admin-more-btn"
                    type="button"
                    onClick={() => setMenteeRowsVisible((v) => v + menteeStep)}
                    disabled={menteeTotal <= menteeRowsVisible}
                  >
                    {lang === "fr" ? `Afficher +${menteeStep}` : `Show +${menteeStep}`}
                  </button>
                  <button
                    className="btn alt admin-less-btn"
                    type="button"
                    onClick={() => setMenteeRowsVisible(5)}
                    disabled={menteeRowsVisible <= 5}
                  >
                    {lang === "fr" ? "Afficher moins" : "Show less"}
                  </button>
                </div>
              </article>
              <div className="registration-add-row">
                <button className="btn" type="button" onClick={() => openAddModal("mentee")}>
                  {lang === "fr" ? "Ajouter mentoré" : "Add mentee"}
                </button>
              </div>
              </div>
              </div>
            </section>
          ) : null}

          {modalOpen ? (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal-card">
                <div className="modal-card-head">
                  <h3>{lang === "fr" ? "Modifier l'inscription" : "Edit registration"}</h3>
                  <span className="modal-chip">{modalCategory}</span>
                </div>
                <div className="modal-card-body">
                  <label>{lang === "fr" ? "Nom complet" : "Full name"}</label>
                  <input value={modalName} onChange={(e) => setModalName(e.target.value)} />
                  <label>Email</label>
                  <input value={modalEmail} onChange={(e) => setModalEmail(e.target.value)} />
                  {modalError ? <p className="form-help" role="alert">{modalError}</p> : null}
                  <div className="editor-actions">
                    <button className="btn" type="button" onClick={saveRegistrationModal} disabled={modalBusy}>{modalBusy ? (lang === "fr" ? "Enregistrement..." : "Saving...") : (lang === "fr" ? "Enregistrer" : "Save")}</button>
                    <button className="btn alt" type="button" onClick={() => setModalOpen(false)} disabled={modalBusy}>{lang === "fr" ? "Annuler" : "Cancel"}</button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {deleteModalOpen ? (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal-card">
                <div className="modal-card-head">
                  <h3>{lang === "fr" ? "Confirmer la suppression" : "Confirm deletion"}</h3>
                </div>
                <div className="modal-card-body">
                  <p>{lang === "fr" ? "Voulez-vous vraiment supprimer cette inscription ?" : "Do you really want to delete this registration?"}</p>
                  <div className="editor-actions">
                    <button className="btn alt" type="button" onClick={() => setDeleteModalOpen(false)}>
                      {lang === "fr" ? "Annuler" : "Cancel"}
                    </button>
                    <button className="btn" type="button" onClick={confirmDeleteRegistration}>
                      {lang === "fr" ? "Confirmer" : "Confirm"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {addModalOpen ? (
            <div className="modal-backdrop" role="dialog" aria-modal="true">
              <div className="modal-card">
                <div className="modal-card-head">
                  <h3>{lang === "fr" ? "Ajouter une inscription" : "Add registration"}</h3>
                  <span className="modal-chip">{addCategory}</span>
                </div>
                <div className="modal-card-body">
                  <label>{lang === "fr" ? "Nom complet" : "Full name"}</label>
                  <input value={addName} onChange={(e) => setAddName(e.target.value)} />
                  <label>Email</label>
                  <input value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
                  <div className="editor-actions">
                    <button className="btn alt" type="button" onClick={() => setAddModalOpen(false)}>
                      {lang === "fr" ? "Annuler" : "Cancel"}
                    </button>
                    <button className="btn" type="button" onClick={confirmAddRegistration}>
                      {lang === "fr" ? "Ajouter" : "Add"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeView === "analytics" ? (
            <div className="admin-view">
              <section className="grid cols-2">
                <article className="card analytics-card">
                  <h2>{t.chartTitle}</h2>
                  <div className="analytics-chart">
                    {graph?.map((m) => (
                      <div key={m.month} className="analytics-chart-col">
                        <div title={`${t.mentors} ${m.month}`} className="analytics-bar mentors" style={{ height: m.mentorHeight }} />
                        <div title={`${t.mentees} ${m.month}`} className="analytics-bar mentees" style={{ height: m.menteeHeight }} />
                        <small>{m.month.slice(5)}</small>
                      </div>
                    ))}
                  </div>
                  <p className="analytics-legend">{t.chartLegend}</p>
                </article>
                <article className="card analytics-card">
                  <h2>{t.monthlyActivity}</h2>
                  <div className="analytics-list">
                    {(data?.monthlyActivity || []).map((m) => (
                      <div className="analytics-list-row" key={m.month}>
                        <strong>{m.month}</strong>
                        <span>{t.mentors}: {m.mentors}</span>
                        <span>{t.mentees}: {m.mentees}</span>
                      </div>
                    ))}
                  </div>
                </article>
              </section>
            </div>
          ) : null}

          {activeView === "content" ? (
            <section className="admin-view content-admin">
              <div className="content-admin-header">
                <div>
                  <span className="eyebrow">{editorText.pageEditor}</span>
                  <h2>{t.contentManagement}</h2>
                  <p>{editorText.pageHelp}</p>
                </div>
                <div className="page-editor-toolbar">
                  <div>
                    <label htmlFor="page-loader">{editorText.pageToLoad}</label>
                    <select
                      id="page-loader"
                      value={selectedPage}
                      onChange={(event) => setSelectedPage(event.target.value as EditablePageKey)}
                    >
                      {editablePages.map((page) => (
                        <option key={page.value} value={page.value}>{page.label[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="content-load-order">{editorText.orderLabel}</label>
                    <select
                      id="content-load-order"
                      value={loadDirection}
                      onChange={(event) => setLoadDirection(event.target.value as LoadDirection)}
                    >
                      <option value="top-to-bottom">{editorText.topToBottom}</option>
                      <option value="bottom-to-top">{editorText.bottomToTop}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="page-area-loader">{editorText.selectedZone}</label>
                    <select
                      id="page-area-loader"
                      value={selectedArea}
                      onChange={(event) => setSelectedArea(event.target.value as DisplayAreaKey)}
                    >
                      {displayAreas.map((area) => (
                        <option key={area.value} value={area.value}>{area.label[lang]}</option>
                      ))}
                    </select>
                  </div>
                  <div className="page-editor-summary">
                    <strong>{zoneContentItems.length}</strong>
                    <span>{editorText.loadedBlocks}</span>
                  </div>
                </div>
              </div>

              {contentNotice ? <p className="form-help" role="status">{contentNotice}</p> : null}

              {isCreateFormOpen ? (
              <form
                className="form-shell content-builder"
                key={`${contentType}-${similarSource?.id || "blank"}`}
                onSubmit={createContent}
              >
                <h3>{similarSource ? editorText.addSimilar : editorText.createBlock}</h3>
                <p className="form-help">{guide.helper}</p>
                <p className="zone-lock">
                  {selectedPageLabel} · {displayAreas.find((area) => area.value === selectedArea)?.label[lang]}
                </p>
                <div className="form-grid">
                  <div>
                    <label htmlFor="content-type">{t.contentType}</label>
                    <select
                      id="content-type"
                      value={contentType}
                      onChange={(event) => setContentType(event.target.value as ContentType)}
                    >
                      {contentTypes.map((type) => (
                        <option key={type} value={type}>{contentTypeLabels[lang][type]}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="display-position">{editorText.position}</label>
                    <select id="display-position" name="displayPosition" defaultValue={String(similarDisplayPosition)}>
                      {menuPositions.map((position) => (
                        <option key={position} value={position}>
                          {String(position).padStart(2, "0")}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label>{editorText.selectedZone}</label>
                    <input value={displayAreas.find((area) => area.value === selectedArea)?.label[lang]} readOnly />
                  </div>
                </div>
                <input type="hidden" name="pageKey" value={selectedPage} />
                <input type="hidden" name="displayArea" value={selectedArea} />
                {hasZoneField(selectedArea, "title") ? (
                  <>
                    <label htmlFor="new-title">{guide.title}</label>
                    <input
                      id="new-title"
                      name="title"
                      defaultValue={similarSource ? `${lang === "fr" ? "Copie de " : "Copy of "}${similarSource.title}` : ""}
                      required
                    />
                  </>
                ) : null}
                {hasZoneField(selectedArea, "slug") ? (
                  <>
                    <label htmlFor="new-slug">{guide.slug}</label>
                    <input id="new-slug" name="slug" defaultValue={similarSource ? `${similarSource.slug}-copy` : ""} required />
                  </>
                ) : null}
                {hasZoneField(selectedArea, "summary") ? (
                  <>
                    <label htmlFor="new-summary">{guide.summary}</label>
                    <input id="new-summary" name="summary" defaultValue={similarSource?.summary || ""} />
                  </>
                ) : null}
                {hasZoneField(selectedArea, "body") ? (
                  <>
                    <label htmlFor="new-body">{guide.body}</label>
                    <textarea id="new-body" name="body" rows={5} defaultValue={similarSource?.body || ""} />
                  </>
                ) : null}
                {hasZoneField(selectedArea, "mediaUrl") ? (
                  <>
                    <label htmlFor="new-media">{guide.media}</label>
                    <input id="new-media" name="mediaUrl" defaultValue={similarSource?.mediaUrl || ""} />
                  </>
                ) : null}
                {hasZoneField(selectedArea, "externalUrl") ? (
                  <>
                    <label htmlFor="new-external">{guide.external}</label>
                    <input id="new-external" name="externalUrl" defaultValue={similarSource?.externalUrl || ""} />
                  </>
                ) : null}
                {zoneSupportsExtra[selectedArea] ? (
                  <div className="form-grid">
                    {guide.extra.map((field) => (
                      <div key={field.name}>
                        <label htmlFor={`new-content-${field.name}`}>{field.label}</label>
                        {field.type === "textarea" ? (
                          <textarea
                            id={`new-content-${field.name}`}
                            name={field.name}
                            rows={3}
                            defaultValue={metadataString(similarSource?.metadata, field.name)}
                          />
                        ) : (
                          <input
                            id={`new-content-${field.name}`}
                            name={field.name}
                            type={field.inputType || "text"}
                            defaultValue={metadataString(similarSource?.metadata, field.name).slice(0, field.inputType === "date" ? 10 : undefined)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
                <label htmlFor="new-status">{t.status}</label>
                <select id="new-status" name="publishStatus" defaultValue={similarSource?.publishStatus || "DRAFT"}>
                  <option value="DRAFT">{publishStatusLabels[lang].DRAFT}</option>
                  <option value="PUBLISHED">{publishStatusLabels[lang].PUBLISHED}</option>
                  <option value="ARCHIVED">{publishStatusLabels[lang].ARCHIVED}</option>
                </select>
                <button className="btn" type="submit">{t.publish}</button>
              </form>
              ) : null}

              <div className="page-editor-heading">
                <div>
                  <h3>{editorText.editBlocks}: {selectedPageLabel}</h3>
                  <p>
                    {isContentLoading
                      ? editorText.loading
                      : activeContentItem
                        ? `${editorText.singleLoad} ${activeBlockIndex + 1}/${orderedContentItems.length}`
                        : `${zoneContentItems.length} ${editorText.loadedBlocks}`}
                  </p>
                </div>
                <div className="block-stepper">
                  <button
                    className="btn alt"
                    type="button"
                    disabled={activeBlockIndex === 0}
                    onClick={() => setActiveBlockIndex((index) => Math.max(index - 1, 0))}
                  >
                    {editorText.previousBlock}
                  </button>
                  <button
                    className="btn"
                    type="button"
                    disabled={activeBlockIndex >= orderedContentItems.length - 1}
                    onClick={() => setActiveBlockIndex((index) => Math.min(index + 1, orderedContentItems.length - 1))}
                  >
                    {editorText.nextBlock}
                  </button>
                </div>
              </div>

              {!isContentLoading && zoneContentItems.length === 0 ? (
                <p className="content-empty">{editorText.noZoneElement}</p>
              ) : null}

              {zoneContentItems.length > 0 ? (
                <section className="content-table-card" aria-label={lang === "fr" ? "Données de contenu" : "Content data"}>
                  <div className="content-table-head">
                    <h3>{lang === "fr" ? "Données de la zone" : "Zone data"}</h3>
                    <small>
                      {zoneContentItems.length} {lang === "fr" ? "éléments" : "items"}
                    </small>
                  </div>
                  <div className="content-table-wrap">
                    <table className="content-table">
                      <thead>
                        <tr>
                          <th>{lang === "fr" ? "Position" : "Position"}</th>
                          <th>{lang === "fr" ? "Type" : "Type"}</th>
                          <th>{lang === "fr" ? "Titre" : "Title"}</th>
                          <th>{lang === "fr" ? "Statut" : "Status"}</th>
                          <th>{lang === "fr" ? "Actions" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderedContentItems.map((item, index) => (
                          <tr key={`row-${item.id}`} className={index === activeBlockIndex ? "active" : ""}>
                            <td>{String(displayPositionFromMetadata(item.metadata)).padStart(2, "0")}</td>
                            <td>{contentTypeLabels[lang][item.type]}</td>
                            <td>{item.title}</td>
                            <td>{publishStatusLabels[lang][item.publishStatus]}</td>
                            <td>
                              <div className="content-row-actions">
                                <button
                                  className="btn alt"
                                  type="button"
                                  onClick={() => setActiveBlockIndex(index)}
                                >
                                  {lang === "fr" ? "Modifier" : "Edit"}
                                </button>
                                {item.isTemplate ? null : (
                                  <button className="btn alt" type="button" onClick={() => deleteContent(item)}>
                                    {lang === "fr" ? "Supprimer" : "Delete"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}

              <div className="page-block-list">
                {activeContentItem ? [activeContentItem].map((item) => {
                  const itemGuide = contentGuides[lang][item.type];
                  const areaValue = displayAreaFromMetadata(item.metadata);
                  const itemArea = areaValue as DisplayAreaKey;
                  const areaLabel = displayAreas.find((area) => area.value === areaValue)?.label[lang] || areaValue;
                  const position = displayPositionFromMetadata(item.metadata);
                  const itemTranslation = translations[item.id];

                  return (
                    <form className="page-block-card" key={item.id} onSubmit={(event) => updateContent(item, event)}>
                      <div className="page-block-header">
                        <div>
                          <span className="page-block-meta">{areaLabel} · {String(position).padStart(2, "0")}</span>
                          <h3>{item.title || itemGuide.title}</h3>
                          {item.isTemplate ? <small>{lang === "fr" ? "Bloc modèle à enregistrer" : "Template block to save"}</small> : null}
                        </div>
                        <strong>{contentTypeLabels[lang][item.type]}</strong>
                      </div>

                      <div className={`content-display-preview preview-${areaValue}`}>
                        <div className="preview-copy">
                          <span>{editorText.previewTitle} · {areaLabel}</span>
                          <h4>{item.title}</h4>
                          {item.summary ? <p>{item.summary}</p> : null}
                          {item.body ? <p>{item.body}</p> : null}
                          {metadataString(item.metadata, "ctaLabel") || item.externalUrl ? (
                            <strong>{metadataString(item.metadata, "ctaLabel") || item.externalUrl}</strong>
                          ) : null}
                        </div>
                        {item.mediaUrl ? (
                          <img src={item.mediaUrl} alt="" />
                        ) : (
                          <div className="preview-media-placeholder">{contentTypeLabels[lang][item.type]}</div>
                        )}
                      </div>

                      <div className="translation-panel">
                        <div>
                          <strong>{editorText.translationTitle}</strong>
                          <span>{editorText.translationHint}</span>
                        </div>
                        <button
                          className="btn alt"
                          type="button"
                          onClick={() => translateContent(item, itemGuide)}
                          disabled={itemTranslation?.status === "loading"}
                        >
                          {itemTranslation?.status === "loading" ? editorText.translating : editorText.translateWithGoogle}
                        </button>
                        {itemTranslation?.text ? <pre>{itemTranslation.text}</pre> : null}
                      </div>

                      <div className="form-grid">
                        <div>
                          <label htmlFor={`edit-position-${item.id}`}>{editorText.position}</label>
                          <select id={`edit-position-${item.id}`} name="displayPosition" defaultValue={String(position)}>
                            {menuPositions.map((itemPosition) => (
                              <option key={itemPosition} value={itemPosition}>
                                {String(itemPosition).padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label>{editorText.selectedZone}</label>
                          <input value={areaLabel} readOnly />
                        </div>
                      </div>
                      <input type="hidden" name="type" value={item.type} />
                      <input type="hidden" name="pageKey" value={selectedPage} />
                      <input type="hidden" name="displayArea" value={selectedArea} />

                      {hasZoneField(itemArea, "title") ? (
                        <>
                          <label htmlFor={`edit-title-${item.id}`}>{itemGuide.title}</label>
                          <input id={`edit-title-${item.id}`} name="title" defaultValue={item.title} required />
                        </>
                      ) : null}
                      {hasZoneField(itemArea, "slug") ? (
                        <>
                          <label htmlFor={`edit-slug-${item.id}`}>{itemGuide.slug}</label>
                          <input id={`edit-slug-${item.id}`} name="slug" defaultValue={item.slug} required />
                        </>
                      ) : null}
                      {hasZoneField(itemArea, "summary") ? (
                        <>
                          <label htmlFor={`edit-summary-${item.id}`}>{itemGuide.summary}</label>
                          <input id={`edit-summary-${item.id}`} name="summary" defaultValue={item.summary || ""} />
                        </>
                      ) : null}
                      {hasZoneField(itemArea, "body") ? (
                        <>
                          <label htmlFor={`edit-body-${item.id}`}>{itemGuide.body}</label>
                          <textarea id={`edit-body-${item.id}`} name="body" rows={5} defaultValue={item.body || ""} />
                        </>
                      ) : null}
                      {hasZoneField(itemArea, "mediaUrl") ? (
                        <>
                          <label htmlFor={`edit-media-${item.id}`}>{itemGuide.media}</label>
                          <input id={`edit-media-${item.id}`} name="mediaUrl" defaultValue={item.mediaUrl || ""} />
                        </>
                      ) : null}
                      {hasZoneField(itemArea, "externalUrl") ? (
                        <>
                          <label htmlFor={`edit-external-${item.id}`}>{itemGuide.external}</label>
                          <input id={`edit-external-${item.id}`} name="externalUrl" defaultValue={item.externalUrl || ""} />
                        </>
                      ) : null}

                      {zoneSupportsExtra[itemArea] ? (
                        <div className="form-grid">
                          {itemGuide.extra.map((field) => (
                            <div key={field.name}>
                              <label htmlFor={`edit-${item.id}-${field.name}`}>{field.label}</label>
                              {field.type === "textarea" ? (
                                <textarea
                                  id={`edit-${item.id}-${field.name}`}
                                  name={field.name}
                                  rows={3}
                                  defaultValue={metadataString(item.metadata, field.name)}
                                />
                              ) : (
                                <input
                                  id={`edit-${item.id}-${field.name}`}
                                  name={field.name}
                                  type={field.inputType || "text"}
                                  defaultValue={metadataString(item.metadata, field.name).slice(0, field.inputType === "date" ? 10 : undefined)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      <label htmlFor={`edit-status-${item.id}`}>{t.status}</label>
                      <select id={`edit-status-${item.id}`} name="publishStatus" defaultValue={item.publishStatus}>
                        <option value="DRAFT">{publishStatusLabels[lang].DRAFT}</option>
                        <option value="PUBLISHED">{publishStatusLabels[lang].PUBLISHED}</option>
                        <option value="ARCHIVED">{publishStatusLabels[lang].ARCHIVED}</option>
                      </select>

                      <div className="editor-actions">
                        <button className="btn" type="submit">{editorText.save}</button>
                        <button className="btn alt" type="button" onClick={() => startSimilarContent(item)}>{editorText.addSimilar}</button>
                        {item.isTemplate ? null : <button className="btn alt" type="button" onClick={() => deleteContent(item)}>{editorText.delete}</button>}
                      </div>
                    </form>
                  );
                }) : null}
              </div>

              <div className="content-add-footer">
                <button
                  className="btn"
                  type="button"
                  aria-expanded={isCreateFormOpen}
                  onClick={() => {
                    setSimilarSource(null);
                    setIsCreateFormOpen((open) => !open);
                  }}
                >
                  {isCreateFormOpen ? editorText.closeAdd : editorText.createBlock}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
