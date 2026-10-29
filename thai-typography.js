(function (root) {
  "use strict";

  /* ------------------------------------------------------------------
   * Thai typography for generated images.
   *
   * Image models draw letters as shapes, they do not typeset from a font,
   * so Thai tone marks, stacked vowels and word breaks can go wrong. Two
   * layers are provided:
   *   RENDER  - the model writes the text; the prompt pins the exact strings,
   *             the orthography rules and an official-looking letterform.
   *   RESERVE - the model draws no text at all and leaves clean zones; the
   *             text is added afterwards in a design tool with a real font.
   *             This is the only mode that can guarantee correct Thai.
   *
   * All prompt-side text below is English on purpose (the Master Prompt is
   * written in English); Thai appears only in UI labels.
   * ------------------------------------------------------------------ */

  const FONT_STYLES = Object.freeze([
    Object.freeze({
      id: "auto", label: "อัตโนมัติ — เลือกตามประเภทงาน",
    }),
    Object.freeze({
      id: "official", label: "ราชการสารบรรณ — ไม่มีหัว สะอาด อ่านง่าย (สไตล์ TH Sarabun New)",
      fonts: "TH Sarabun New (TH SarabunPSK) หรือ Sarabun (Google Fonts)",
      heading: "TH Sarabun New / Sarabun Bold",
      body: "TH Sarabun New / Sarabun Regular",
      prompt: {
        heading: "bold loopless Thai sans-serif in the style of TH Sarabun New (TH SarabunPSK), the typeface used in Thai government correspondence",
        body: "regular-weight loopless Thai sans-serif in the same family",
        feel: "clean, formal, and authoritative, with even stroke weight and open counters",
      },
    }),
    Object.freeze({
      id: "formal", label: "พิธีการ — หัวเรื่องแบบมีหัว สง่างาม (สไตล์ Noto Serif Thai)",
      fonts: "หัวเรื่อง Noto Serif Thai · เนื้อความ TH Sarabun New (TH SarabunPSK) หรือ Sarabun",
      heading: "Noto Serif Thai Bold",
      body: "TH Sarabun New / Sarabun Regular",
      prompt: {
        heading: "refined traditional Thai serif (looped, Noto Serif Thai style) in bold for headings only",
        body: "regular loopless Thai sans-serif in the style of TH Sarabun New for all supporting text",
        feel: "dignified, ceremonial, and premium, with elegant stroke contrast",
      },
    }),
    Object.freeze({
      id: "data", label: "ข้อมูลและตัวชี้วัด — ทันสมัย ตัวเลขเรียงตรง (สไตล์ IBM Plex Sans Thai)",
      fonts: "IBM Plex Sans Thai หรือ Noto Sans Thai",
      heading: "IBM Plex Sans Thai SemiBold",
      body: "IBM Plex Sans Thai Regular",
      prompt: {
        heading: "semibold modern loopless Thai sans-serif in the style of IBM Plex Sans Thai",
        body: "regular-weight modern loopless Thai sans-serif in the same family, with tabular, evenly spaced numerals",
        feel: "precise, modern, and trustworthy, optimized for numbers and compact labels",
      },
    }),
  ]);
  const DEFAULT_FONT_STYLE = "auto";

  const TEXT_MODES = Object.freeze([
    Object.freeze({
      id: "render", label: "ให้ AI เขียนข้อความไทยในภาพ",
      hint: "สะดวกที่สุด แต่โมเดลอาจเขียนวรรณยุกต์/สระเพี้ยน ต้องตรวจทีละตัวอักษรก่อนเผยแพร่",
    }),
    Object.freeze({
      id: "reserve", label: "เว้นพื้นที่ว่าง แล้ววางข้อความเอง",
      hint: "AI ไม่วาดตัวอักษรเลย ได้ภาพสวยพร้อมกรอบข้อความ แล้ววางข้อความด้วยฟอนต์ราชการ — ตัวอักษรถูกต้อง 100%",
    }),
  ]);
  const DEFAULT_TEXT_MODE = "render";

  const FORMAL_TYPES = ["Certificate", "Book / Report Cover", "Annual Report Cover", "Manual / Guideline Cover"];
  const DATA_TYPES = [
    "Dashboard / Data Visual", "KPI Scorecard", "Geographic Map / Disease Map", "Infographic",
    "Process Flowchart", "Patient Journey / Service Journey", "Fact Sheet / One-page Brief",
  ];

  const MAX_ITEMS = 20;
  const MAX_ITEM_LENGTH = 300;

  function normalizeFontStyle(value) {
    return FONT_STYLES.some((f) => f.id === value) ? value : DEFAULT_FONT_STYLE;
  }
  function normalizeTextMode(value) {
    return TEXT_MODES.some((m) => m.id === value) ? value : DEFAULT_TEXT_MODE;
  }

  function resolveFontStyle(styleId, contentType) {
    const id = normalizeFontStyle(styleId);
    if (id !== "auto") return FONT_STYLES.find((f) => f.id === id);
    if (FORMAL_TYPES.includes(contentType)) return FONT_STYLES.find((f) => f.id === "formal");
    if (DATA_TYPES.includes(contentType)) return FONT_STYLES.find((f) => f.id === "data");
    return FONT_STYLES.find((f) => f.id === "official");
  }

  /** One entry per non-empty line of the user's content, exactly as written. */
  function extractTextItems(content) {
    const items = [];
    for (const raw of String(content || "").split(/\r\n|\r|\n/)) {
      const line = raw.replace(/<\/?USER_CONTENT>/gi, "").replace(/\s+/g, " ").trim();
      if (line && /[^\s\-_=*#.·•|]/.test(line)) items.push(line);
    }
    return items;
  }

  const ORTHOGRAPHY =
    "Thai orthography is mandatory: every tone mark (mai ek, mai tho, mai tri, mai chattawa), upper vowel, lower vowel, mai han-akat, mai taikhu, and thanthakhat must sit on its own consonant in the correct stacking order, with clear space above and below, and must never collide, merge, drift, detach, or disappear. Keep every consonant head, loop, and tail, and the sara am, fully formed. Never swap Thai letters for Latin or Lao look-alikes, never mirror or invent glyphs, never add pseudo-text. Thai has no spaces between words, so break lines only between words or phrases, never inside a word.";

  const LEGIBILITY =
    "Typesetting: use at most two typefaces, headings bold and body regular, a title at least twice the body size, generous letter and line spacing (line height of at least 1.4 so tone marks do not touch the line above), and left or centered alignment without justified gaps. Place every text block on a flat or softly overlaid panel with a contrast ratio of at least 4.5:1, never over busy imagery, and keep all text inside the safe area.";

  /**
   * Returns the lines for the [05] TYPOGRAPHY section.
   * `requiredZones` comes from the content-type profile.
   */
  function buildThaiTypographyGuidance(options) {
    const { contentType, fontStyle, textMode, content, requiredZones } = options;
    const style = resolveFontStyle(fontStyle, contentType);
    const mode = normalizeTextMode(textMode);
    const items = extractTextItems(content);
    const lines = [];

    if (mode === "reserve") {
      const zones = (requiredZones || []).join(", ");
      lines.push(
        "TEXT MODE: RESERVE — Do not render any readable text, letters, numbers, logos, or pseudo-text anywhere in the image. Use USER_CONTENT only to understand the subject and to choose imagery.",
        `Text Zones: Reserve clean, evenly lit, uncluttered, low-detail zones for ${zones || "the title, supporting text, and source"}. The real text will be added afterwards in a design tool with the official government typeface, so draw no placeholder lines, no dummy letters, and no lorem-ipsum glyphs.`,
      );
    } else {
      lines.push(
        "TEXT MODE: RENDER — Render only the TEXT_ITEM strings listed below, each exactly once, character by character in the original Thai spelling, with no additions, translation, transliteration, abbreviation, or paraphrase. If a string cannot be rendered perfectly, leave its zone clean instead of rendering distorted letters.",
      );
    }

    lines.push(
      `FONT STYLE: Headings in ${style.prompt.heading}; body text in ${style.prompt.body}. Overall feel: ${style.prompt.feel}. Avoid decorative, handwritten, script, outlined, or novelty typefaces for any Thai text.`,
    );

    if (mode === "render") {
      lines.push(`Thai Orthography: ${ORTHOGRAPHY}`, `Legibility: ${LEGIBILITY}`);
      items.slice(0, MAX_ITEMS).forEach((item, i) => {
        lines.push(`TEXT_ITEM ${i + 1}: ${item.slice(0, MAX_ITEM_LENGTH)}`);
      });
      if (items.length > MAX_ITEMS) {
        lines.push(`TEXT_ITEM_OVERFLOW: ${items.length - MAX_ITEMS} further lines of the source are intentionally not rendered; leave no placeholder for them.`);
      }
    } else {
      lines.push(`Legibility: ${LEGIBILITY}`);
    }
    return { style, mode, items, lines: lines.join("\n") };
  }

  const api = Object.freeze({
    FONT_STYLES,
    DEFAULT_FONT_STYLE,
    TEXT_MODES,
    DEFAULT_TEXT_MODE,
    MAX_ITEMS,
    normalizeFontStyle,
    normalizeTextMode,
    resolveFontStyle,
    extractTextItems,
    buildThaiTypographyGuidance,
  });

  root.HealthPromptThaiTypography = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
