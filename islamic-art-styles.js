(function (root) {
  "use strict";

  const SACRED_TEXT_POLICY = "Use no sacred Arabic or Jawi text unless the exact verified wording is explicitly supplied by the user; preserve supplied text exactly without invention or ornamentation.";
  const MODESTY_STANDARD = "Respectful, non-sexualized presentation; modest opaque clothing; culturally appropriate coverage, posture, and interpersonal distance.";
  const COMMON_CONSTRAINTS = [
    "Do not fabricate Qur'anic verses, Hadith, Shahada, the names of Allah or Prophet Muhammad, Arabic calligraphy, religious seals, or sacred inscriptions.",
    "No pseudo-Arabic/Jawi gibberish or decorative marks presented as meaningful religious writing.",
    "Never place sacred text or religious names on the floor, footwear, clothing, disposable items, or medical waste.",
    "Do not use a crescent, dome, minaret, or mosque silhouette as a mandatory generic symbol of every Muslim subject.",
    "Avoid exoticizing, caricaturing, or treating Muslim communities as a single Arab culture.",
  ];

  function defineStyle(config) {
    return Object.freeze({
      modestyStandard: MODESTY_STANDARD,
      sacredTextPolicy: SACRED_TEXT_POLICY,
      ...config,
      motifs: Object.freeze(config.motifs),
      constraints: Object.freeze(config.constraints),
    });
  }

  const ISLAMIC_ART_STYLES = Object.freeze([
    defineStyle({
      id: "contemporary-islamic-editorial",
      value: "Contemporary Islamic Editorial",
      label: "Contemporary Islamic Editorial — อิสลามร่วมสมัยแบบ Editorial",
      culturalContext: "Contemporary Muslim public communication with a clean, modern, internationally legible design language",
      motifs: ["restrained eight-point geometry", "subtle mashrabiya-inspired grids", "controlled negative space"],
      figurePolicy: "Human figures are permitted when relevant and must appear authentic, dignified, and naturally posed.",
      visualDirection: "Blend contemporary editorial structure with subtle Islamic geometry; keep religious cues refined, contextual, and secondary to the communication goal.",
      constraints: ["Do not turn every composition into a mosque scene.", "Avoid costume-like styling and ornamental overload."],
    }),
    defineStyle({
      id: "malay-muslim-narathiwat",
      value: "Malay-Muslim Narathiwat Heritage",
      label: "Malay-Muslim Narathiwat Heritage — มลายูมุสลิมนราธิวาส",
      culturalContext: "Thai Malay-Muslim communities of Narathiwat and the culturally connected Southern Thailand border provinces",
      motifs: ["Malay floral geometry", "local woven-textile rhythm", "Southern Thai-Malay architectural details", "restrained Islamic arabesque"],
      figurePolicy: "Represent local Thai Malay-Muslim people with authentic everyday dignity, natural features, and context-appropriate clothing.",
      visualDirection: "Express the lived Malay-Muslim identity of Narathiwat and Southern Thailand through locally grounded attire, architecture, craft rhythm, and community warmth rather than imported Middle Eastern spectacle.",
      constraints: ["Do not replace Southern Thai-Malay identity with generic Gulf or Arab stereotypes.", "Do not invent official local emblems, Jawi text, ceremonial clothing, or architectural claims."],
    }),
    defineStyle({
      id: "islamic-geometric-arabesque",
      value: "Islamic Geometric & Arabesque",
      label: "Islamic Geometric & Arabesque — เรขาคณิตและอาราเบสก์",
      culturalContext: "Non-sectarian Islamic decorative geometry used as a respectful visual system",
      motifs: ["eight-point and twelve-point geometry", "girih-like interlacing", "arabesque linework", "tessellated grids"],
      figurePolicy: "Figures may appear only when the content requires them; geometry remains the primary visual language.",
      visualDirection: "Build precise, mathematically coherent geometric structures with controlled repetition, symmetry, and tonal depth derived from the selected palette.",
      constraints: ["Do not mix unrelated geometric systems into visual noise.", "Do not present invented symbols as religiously authoritative."],
    }),
    defineStyle({
      id: "islamic-botanical-garden",
      value: "Islamic Botanical & Garden",
      label: "Islamic Botanical & Garden — พฤกษาและสวนอิสลาม",
      culturalContext: "Islamic garden-inspired visual calm centered on balance, water, shade, growth, and restorative nature",
      motifs: ["stylized vines", "balanced floral arabesque", "water channels", "courtyard garden symmetry"],
      figurePolicy: "Figures are optional and must remain secondary to the restorative botanical environment.",
      visualDirection: "Create a serene, health-appropriate botanical composition with ordered garden symmetry, gentle water cues, and elegant plant forms without depicting a sacred paradise claim.",
      constraints: ["Do not label the scene as Jannah or claim a sacred representation.", "Avoid botanically chaotic or excessively ornate backgrounds."],
    }),
    defineStyle({
      id: "islamic-architectural-minimalism",
      value: "Islamic Architectural Minimalism",
      label: "Islamic Architectural Minimalism — สถาปัตยกรรมอิสลามมินิมอล",
      culturalContext: "Contemporary civic and healthcare design informed by Islamic architectural proportion, light, screens, arches, and courtyards",
      motifs: ["restrained arches", "perforated screens", "courtyard light", "repeating structural bays"],
      figurePolicy: "People may appear at a realistic architectural scale and must not be used as decorative props.",
      visualDirection: "Use architectural light, proportion, shadow, and restrained screen patterns to create credible calm; favor locally plausible materials and public-service usability.",
      constraints: ["Do not fabricate a specific real mosque or heritage building.", "Avoid oversized domes and minarets used only as visual shorthand."],
    }),
    defineStyle({
      id: "islamic-luxury-gold",
      value: "Islamic Luxury Gold",
      label: "Islamic Luxury Gold — อิสลามหรูหราทองร่วมสมัย",
      culturalContext: "Formal premium Islamic visual design for official ceremonies, reports, and high-end institutional communication",
      motifs: ["fine geometric borders", "restrained metallic filigree", "symmetrical medallion structure", "premium paper texture"],
      figurePolicy: "Figures are optional; when used, formal dignity and natural realism take priority over glamour.",
      visualDirection: "Apply metallic details sparingly to borders and focal accents while preserving formal hierarchy, readability, and the selected palette as the controlling color system.",
      constraints: ["Do not equate Islamic identity with excessive gold or palace imagery.", "Avoid casino-like shine, jeweled clutter, and ornamental text distortion."],
    }),
    defineStyle({
      id: "muslim-healthcare-editorial",
      value: "Muslim Healthcare Editorial",
      label: "Muslim Healthcare Editorial — บุคลากรและชุมชนสุขภาพมุสลิม",
      culturalContext: "Thai public-health communication serving Muslim patients, families, healthcare workers, and local communities",
      motifs: ["human-centered healthcare scenes", "subtle geometric framing", "clean clinical environments", "community-care cues"],
      figurePolicy: "Show authentic Muslim healthcare professionals and community members only when relevant, with accurate uniforms, PPE, modest attire, and respectful care interactions.",
      visualDirection: "Prioritize credible healthcare practice, trust, dignity, and culturally responsive service; Islamic cues must support the human story without overwhelming it.",
      constraints: ["Do not imply that all Muslim women dress identically.", "Do not invent clinical procedures, religious rulings, medical claims, or patient details."],
    }),
    defineStyle({
      id: "ramadan-eid-celebration",
      value: "Ramadan & Eid Celebration",
      label: "Ramadan & Eid Celebration — รอมฎอนและอีดอย่างสุภาพ",
      culturalContext: "Respectful community communication for Ramadan and Eid in a Thai Malay-Muslim context",
      motifs: ["warm evening light", "community gathering", "subtle lantern geometry", "local festive textile rhythm"],
      figurePolicy: "Family and community figures may appear in respectful, natural activities without staged exoticism.",
      visualDirection: "Create warm, communal, hopeful imagery grounded in local practice, using festive light and restrained motifs without turning worship into spectacle.",
      constraints: ["Do not invent prayer actions, religious rulings, dates, greetings, or ceremonial details.", "Avoid food excess, commercialized stereotypes, and inaccurate worship scenes."],
    }),
    defineStyle({
      id: "non-figurative-islamic-safe",
      value: "Non-Figurative Islamic Sacred-Safe",
      label: "Non-Figurative Islamic Sacred-Safe — อิสลามแบบไม่ใช้ภาพบุคคล",
      culturalContext: "Strictly non-figurative Islamic visual communication using geometry, light, architecture, botanical abstraction, and material texture",
      motifs: ["precise geometry", "abstract botanical forms", "architectural light", "textile and paper texture"],
      figurePolicy: "No human or animal figures under any circumstance, even when the general people option is enabled.",
      visualDirection: "Communicate entirely through geometry, abstract botanical structure, light, material, typography zones, and environmental symbolism.",
      constraints: ["No human silhouettes, faces, hands, animals, statues, or figurative shadows.", "Do not substitute figurative icons for prohibited figures."],
    }),
  ]);

  const ISLAMIC_ART_STYLE_GROUP = Object.freeze({
    label: "8. กลุ่มอิสลามและมลายูมุสลิม (Islamic & Malay-Muslim)",
    styles: ISLAMIC_ART_STYLES,
  });

  function getIslamicArtStyleProfile(value) {
    return ISLAMIC_ART_STYLES.find((style) => style.value === value) || null;
  }

  function buildIslamicArtStyleGuidance(value, includePeople) {
    const profile = getIslamicArtStyleProfile(value);
    if (!profile) return null;

    const isNonFigurative = profile.id === "non-figurative-islamic-safe";
    const peopleDirection = isNonFigurative
      ? profile.figurePolicy
      : includePeople
        ? `${profile.figurePolicy} For Thai Malay-Muslim women who choose head covering, render culturally plausible hijab or tudung with correct drape, opaque fabric, and no hair exposure caused by rendering errors; do not force identical attire on every person.`
        : "No human figures — use only architecture, geometry, botanical abstraction, objects, and environmental details permitted by this style.";

    return {
      profile,
      configuration: `CULTURAL_STYLE = "${profile.value}"\nCULTURAL_CONTEXT = "${profile.culturalContext}"\nISLAMIC_MOTIFS = "${profile.motifs.join(" / ")}"\nMODESTY_STANDARD = "${profile.modestyStandard}"\nFIGURE_POLICY = "${profile.figurePolicy}"\nSACRED_TEXT_POLICY = "${profile.sacredTextPolicy}"`,
      peopleDirection,
      visualDirection: profile.visualDirection,
      constraints: [...COMMON_CONSTRAINTS, ...profile.constraints].join(" "),
    };
  }

  const api = Object.freeze({
    ISLAMIC_ART_STYLE_GROUP,
    ISLAMIC_ART_STYLES,
    getIslamicArtStyleProfile,
    buildIslamicArtStyleGuidance,
  });

  root.HealthPromptIslamicArtStyles = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
