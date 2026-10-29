(function (root) {
  "use strict";

  /* ------------------------------------------------------------------
   * Target models
   * ------------------------------------------------------------------ */
  const TARGETS = Object.freeze([
    Object.freeze({
      id: "universal", label: "ทั่วไป",
      summary: "ข้อความเต็มรูปแบบ [01]–[08] ใช้ได้กับทุกเครื่องมือ",
      notes: [],
    }),
    Object.freeze({
      id: "chat", label: "ChatGPT / Gemini",
      summary: "โมเดลภาพแบบสนทนา — ข้อห้ามถูกเขียนเป็นคำสั่ง “Do not include”",
      notes: [
        "โมเดลกลุ่มนี้ไม่มีช่อง negative prompt แยก จึงรวมข้อห้ามไว้ท้ายคำสั่ง",
        "ตรวจตัวอักษรไทย ชื่อ และตัวเลขในภาพทุกครั้งก่อนนำไปเผยแพร่",
      ],
    }),
    Object.freeze({
      id: "midjourney", label: "Midjourney",
      summary: "ย่อเป็นย่อหน้าเดียว พร้อมพารามิเตอร์ --ar และ --no",
      notes: [
        "Midjourney วางข้อความไทยยาว ๆ ได้ไม่แม่นยำ — แนะนำให้สร้างภาพพื้นหลัง/องค์ประกอบ แล้วใส่ข้อความไทยด้วยโปรแกรมออกแบบ",
        "เนื้อหาที่มี “--” จะถูกปรับเป็น “-” เพื่อไม่ให้ไปแก้พารามิเตอร์ของคำสั่ง",
      ],
    }),
    Object.freeze({
      id: "sd", label: "Stable Diffusion",
      summary: "คำสั่งแบบย่อ + ช่อง Negative prompt แยก",
      notes: [
        "โมเดลรุ่นเก่ารับ prompt ได้จำกัด จึงใช้แบบย่อเสมอ",
        "บางรุ่น (เช่น Flux) ไม่ใช้ negative prompt — ถ้าไม่มีช่องนี้ ให้เลือกเป้าหมาย ChatGPT / Gemini แทน",
      ],
    }),
  ]);
  const DEFAULT_TARGET = "universal";
  const LENGTHS = Object.freeze(["full", "compact"]);
  const DEFAULT_LENGTH = "full";
  const MAX_CONTENT_LENGTH = 20000;

  function normalizeTarget(value) {
    return TARGETS.some((t) => t.id === value) ? value : DEFAULT_TARGET;
  }
  function normalizeLength(value) {
    return LENGTHS.includes(value) ? value : DEFAULT_LENGTH;
  }
  function getTarget(value) {
    return TARGETS.find((t) => t.id === normalizeTarget(value));
  }

  /* ------------------------------------------------------------------
   * Master Prompt parsing
   * The Master Prompt has a fixed contract: "## title ##" then sections
   * "[NN] HEADING". Text between <USER_CONTENT> tags is opaque so that
   * user-supplied lines can never be mistaken for structure.
   * ------------------------------------------------------------------ */
  const NEGATIVE_PREFIX = "Negative Prompt:";

  function parseMasterPrompt(text) {
    const lines = String(text).split(/\r\n|\r|\n/);
    const result = { title: "", sections: [], negative: "" };
    let current = null;
    let inUserContent = false;

    for (const line of lines) {
      if (inUserContent) {
        current.lines.push(line);
        if (line === "</USER_CONTENT>") inUserContent = false;
        continue;
      }
      const header = /^\[(\d{2})\] (.+)$/.exec(line);
      if (header) {
        current = { id: header[1], heading: header[2], lines: [] };
        result.sections.push(current);
        continue;
      }
      if (!current) {
        if (line.startsWith("## ")) result.title = line;
        continue;
      }
      if (line.startsWith(NEGATIVE_PREFIX)) {
        result.negative = line.slice(NEGATIVE_PREFIX.length).trim();
        continue;
      }
      current.lines.push(line);
      if (line === "<USER_CONTENT>") inUserContent = true;
    }
    return result;
  }

  function cleanLines(lines) {
    const out = [];
    let blank = false;
    for (const line of lines) {
      if (line.trim() === "") { blank = out.length > 0; continue; }
      if (blank) { out.push(""); blank = false; }
      out.push(line);
    }
    return out;
  }

  function renderSections(parsed, sections) {
    const parts = [];
    if (parsed.title) parts.push(parsed.title);
    for (const section of sections) {
      parts.push([`[${section.id}] ${section.heading}`, ...cleanLines(section.lines)].join("\n"));
    }
    return parts.join("\n\n");
  }

  /* ------------------------------------------------------------------
   * Compact mode: keep what changes the picture, drop restatements.
   * Lines inside <USER_CONTENT> are never touched.
   * ------------------------------------------------------------------ */
  const COMPACT_QUALITY =
    "Visual Quality: highly detailed, sharp typography, perfect alignment, balanced composition, high contrast, print-ready professional quality.";
  const COMPACT_RULES = Object.freeze({
    "01": { keep: ["COLOR MODE", "COLOR THEME", "REFERENCE PALETTE", "Color Logic", "Color Fidelity", "Selected Accent Tone"] },
    "02": { drop: ["FORMAT_NOTE", "SAFE_AREA", "DEPARTMENT: Not specified."] },
    "03": { drop: ["Style:", "Mood:", "Quality Standard:", "CULTURAL_CONTEXT", "ISLAMIC_MOTIFS"] },
    "04": { keep: ["Deliverable Layout", "Background Treatment", "Imagery"] },
    "05": {
      keep: ["Text Rendering", "Structure", "Quality Control", "TEXT MODE", "Text Zones", "FONT STYLE",
        "Thai Orthography", "Legibility", "TEXT_ITEM"],
    },
    "06": { keep: ["Rendering Direction", "Theme-linked Lighting"], append: COMPACT_QUALITY },
    "07": {
      drop: ["CANVAS_SIZE", "ORIENTATION", "SAFE_AREA", "BLEED", "FOCAL_ZONE", "TEXT_SCALE", "CROP_STRATEGY",
        "EXPORT_PROFILE", "Target Resolution", "Print Specification", "Framing", "Final Deliverable"],
    },
    "08": { first: true },
  });

  function compactSection(section) {
    const rule = COMPACT_RULES[section.id];
    if (!rule) return section;
    let kept = [];
    let inUser = false;
    for (const line of section.lines) {
      if (inUser) { kept.push(line); if (line === "</USER_CONTENT>") inUser = false; continue; }
      if (line === "<USER_CONTENT>") { inUser = true; kept.push(line); continue; }
      if (rule.keep && !rule.keep.some((p) => line.startsWith(p))) continue;
      if (rule.drop && rule.drop.some((p) => line.startsWith(p) || line === p)) continue;
      kept.push(line);
    }
    if (rule.first) kept = kept.filter((l) => l.trim() !== "").slice(0, 1);
    if (rule.append) kept.push(rule.append);
    return { ...section, lines: kept };
  }

  /* ------------------------------------------------------------------
   * Midjourney helpers
   * ------------------------------------------------------------------ */
  const SHORT_NEGATIVES = Object.freeze([
    "distorted text", "misspelled words", "garbled letters", "extra logos", "watermark", "signature",
    "fake charts", "cluttered layout", "low resolution", "blurry", "pixelated", "malformed hands",
    "duplicate people", "altered logo", "poor contrast", "decorative script fonts",
  ]);
  const NO_TEXT_NEGATIVES = Object.freeze(["text", "letters", "words", "numbers", "typography", "pseudo-text"]);

  function aspectParam(ratioValue) {
    const text = String(ratioValue || "");
    let match = /\((\d+(?:\.\d+)?):(\d+(?:\.\d+)?)\)/.exec(text) || /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)/.exec(text);
    if (!match) return "16:9";
    let [w, h] = [Number(match[1]), Number(match[2])];
    if (!Number.isInteger(w) || !Number.isInteger(h)) {
      const scale = 100;
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    return `${w}:${h}`;
  }

  function neutralizeParams(text) {
    return String(text).replace(/-{2,}/g, "-").replace(/::+/g, ":");
  }

  function pickLine(section, prefix) {
    if (!section) return "";
    const line = section.lines.find((l) => l.startsWith(prefix));
    return line ? line.slice(prefix.length).trim().replace(/\.$/, "") : "";
  }

  function userContentOf(section) {
    if (!section) return "";
    const start = section.lines.indexOf("<USER_CONTENT>");
    const end = section.lines.lastIndexOf("</USER_CONTENT>");
    if (start === -1 || end === -1 || end <= start) return "";
    return section.lines.slice(start + 1, end).join(" ").replace(/\s+/g, " ").trim();
  }

  function buildMidjourney(parsed) {
    const byId = (id) => parsed.sections.find((s) => s.id === id);
    const s01 = byId("01"); const s02 = byId("02"); const s03 = byId("03");
    const s04 = byId("04"); const s05 = byId("05"); const s07 = byId("07");
    const reserveText = Boolean(s05 && s05.lines.some((l) => l.startsWith("TEXT MODE: RESERVE")));
    const fontStyle = pickLine(s05, "FONT STYLE:").split(". Overall feel")[0];
    const type = pickLine(s02, "CONTENT TYPE:") || "Infographic";
    const content = neutralizeParams(userContentOf(s02)).slice(0, 400);
    const art = pickLine(s03, "ART STYLE:");
    const theme = pickLine(s01, "COLOR THEME:");
    const palette = pickLine(s01, "REFERENCE PALETTE:");
    const background = neutralizeParams(pickLine(s04, "Background Treatment:").split(". Keep it compatible")[0]).slice(0, 220);
    const ratio = aspectParam(pickLine(s07, "ASPECT RATIO:"));

    const color = theme
      ? `${theme} color theme (${palette})`
      : "source-authentic colors, natural and unaltered";
    const typography = reserveText
      ? "no text, no letters, no numbers, clean empty text zones reserved for title, subtitle and body"
      : `crisp legible Thai typography, ${neutralizeParams(fontStyle).slice(0, 260)}`;
    const body = [
      `${type} for Thai public-health and government communication`,
      content && (reserveText ? `subject: ${content}` : `about: ${content}`),
      art && `${art} style`,
      color,
      background && background !== "None — clean flat background" && `background: ${background}`,
      `premium official publication design, professional grid layout, balanced white space, ${typography}, high contrast`,
    ].filter(Boolean).join(", ");
    const negatives = reserveText ? [...NO_TEXT_NEGATIVES, ...SHORT_NEGATIVES] : SHORT_NEGATIVES;
    return `${neutralizeParams(body)} --ar ${ratio} --no ${negatives.join(", ")} --style raw`;
  }

  /* ------------------------------------------------------------------
   * Target formatting
   * ------------------------------------------------------------------ */
  function formatForTarget(targetId, length, masterPrompt) {
    const target = getTarget(targetId);
    const mode = normalizeLength(length);
    const parsed = parseMasterPrompt(masterPrompt);
    const result = { target: target.id, length: mode, positive: "", negative: "", notes: target.notes.slice() };

    if (!parsed.sections.length) {
      result.positive = String(masterPrompt);
      return result;
    }

    if (target.id === "universal" && mode === "full") {
      result.positive = String(masterPrompt);
      return result;
    }

    if (target.id === "midjourney") {
      result.length = "compact";
      result.positive = buildMidjourney(parsed);
      return result;
    }

    const compact = mode === "compact" || target.id === "sd";
    if (compact) result.length = "compact";
    const sections = compact ? parsed.sections.map(compactSection) : parsed.sections;
    const body = renderSections(parsed, sections);

    if (target.id === "sd") {
      result.positive = body;
      result.negative = parsed.negative;
    } else if (target.id === "chat") {
      result.positive = parsed.negative
        ? `${body}\n\nDo not include any of the following: ${parsed.negative}.`
        : body;
    } else {
      result.positive = parsed.negative ? `${body}\n\n${NEGATIVE_PREFIX} ${parsed.negative}` : body;
    }
    return result;
  }

  /* ------------------------------------------------------------------
   * Content checks (all advisory, never blocking)
   * ------------------------------------------------------------------ */
  function isValidThaiNationalId(digits) {
    if (!/^\d{13}$/.test(digits)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i += 1) sum += Number(digits[i]) * (13 - i);
    return (11 - (sum % 11)) % 10 === Number(digits[12]);
  }

  function findPersonalData(text) {
    const found = { nationalIds: 0, phones: 0 };
    // No look-behind: older mobile Safari versions reject it at parse time.
    const idPattern = /(^|[^\d-])(\d(?:[- ]?\d){12})(?![\d-])/g;
    for (const match of String(text).matchAll(idPattern)) {
      if (isValidThaiNationalId(match[2].replace(/\D/g, ""))) found.nationalIds += 1;
    }
    // Thai numbers are 9 digits (landline) or 10 digits (mobile), always starting with 0.
    const phonePattern = /(^|[^\d-])(0[2-9]\d?[- ]?\d{3}[- ]?\d{3,4})(?![\d-])/g;
    for (const match of String(text).matchAll(phonePattern)) {
      const length = match[2].replace(/\D/g, "").length;
      if (length >= 9 && length <= 10) found.phones += 1;
    }
    return found;
  }

  const NUMBER_DRIVEN_TYPES = Object.freeze([
    "Dashboard / Data Visual", "KPI Scorecard", "Infographic", "Fact Sheet / One-page Brief", "Geographic Map / Disease Map",
  ]);

  function assessSettings(settings, helpers) {
    const items = [];
    const content = String(settings.content || "").trim();
    const hasDigit = /[0-9๐-๙]/.test(content);
    const profile = helpers.getContentTypeProfile(settings.contentType);

    if (!content) {
      items.push({ level: "warn", id: "empty", message: "ยังไม่ได้ใส่เนื้อหา — AI จะคิดข้อความเอง ซึ่งขัดกับกติกาห้ามแต่งข้อมูล" });
    } else if (content.length < 8) {
      items.push({ level: "info", id: "short", message: "เนื้อหาสั้นมาก ลองเพิ่มหัวข้อ ข้อความหลัก และแหล่งข้อมูล" });
    }

    if (content && NUMBER_DRIVEN_TYPES.includes(settings.contentType) && !hasDigit) {
      items.push({ level: "warn", id: "no-numbers", message: `ชิ้นงานประเภท “${profile.label}” ต้องมีตัวเลขจริง แต่ไม่พบตัวเลขในเนื้อหา — ภาพจะระบุ N/A หรือไม่ครบ` });
    }
    if (content && settings.contentType === "Emergency Alert / Disease Advisory" && !hasDigit) {
      items.push({ level: "warn", id: "no-period", message: "ประกาศเตือนภัยควรระบุวันที่หรือช่วงเวลาที่มีผล แต่ไม่พบตัวเลขวันที่ในเนื้อหา" });
    }

    const limits = { low: 400, "low-medium": 600, medium: 1200, "medium-high": 1800, high: 3000 };
    const limit = limits[profile.textDensity];
    if (content && limit && content.length > limit) {
      items.push({ level: "warn", id: "too-long", message: `เนื้อหายาว ${content.length.toLocaleString("th-TH")} ตัวอักษร เกินที่ “${profile.label}” รับได้ดี (~${limit.toLocaleString("th-TH")}) — ข้อความไทยในภาพมักเพี้ยนเมื่อยาวเกิน ควรสรุปให้สั้นลง` });
    }

    const compat = helpers.getAspectRatioCompatibility(settings.contentType, settings.aspectRatio);
    if (!compat.isRecommended) {
      items.push({ level: "info", id: "ratio", message: `อัตราส่วนที่เลือกไม่ใช่ที่แนะนำสำหรับชิ้นงานนี้ — ${compat.message}` });
    }

    if (settings.textMode === "render" && content) {
      const textItems = helpers.extractTextItems ? helpers.extractTextItems(content) : [];
      const longest = textItems.reduce((max, item) => Math.max(max, item.length), 0);
      if (settings.target === "midjourney" || settings.target === "sd") {
        const name = settings.target === "sd" ? "Stable Diffusion" : "Midjourney";
        items.push({ level: "warn", id: "text-weak-model", message: `${name} เขียนข้อความไทยได้ไม่แม่นยำ — เลือกโหมด “เว้นพื้นที่ว่าง แล้ววางข้อความเอง” เพื่อให้ตัวอักษรถูกต้อง` });
      } else if (textItems.length > 12 || longest > 120) {
        items.push({ level: "warn", id: "text-heavy", message: "ข้อความไทยในภาพมีหลายบรรทัดหรือยาวมาก ซึ่งเพี้ยนง่าย — สรุปให้สั้นลง หรือเลือกโหมด “เว้นพื้นที่ว่าง แล้ววางข้อความเอง”" });
      } else {
        items.push({ level: "info", id: "text-verify", message: "AI อาจเขียนวรรณยุกต์หรือสระเพี้ยน — ตรวจข้อความในภาพทีละตัวอักษรก่อนเผยแพร่ หรือใช้โหมด “เว้นพื้นที่ว่าง”" });
      }
    }

    const pii = findPersonalData(content);
    if (pii.nationalIds) {
      items.push({ level: "warn", id: "pii-id", message: `พบเลขบัตรประชาชน 13 หลัก ${pii.nationalIds} รายการ — ข้อมูลส่วนบุคคลไม่ควรส่งเข้าเครื่องมือ AI ภายนอก (PDPA) ควรลบก่อน` });
    }
    if (pii.phones) {
      items.push({ level: "info", id: "pii-phone", message: `พบเบอร์โทรศัพท์ ${pii.phones} รายการ — ตรวจว่าเป็นเบอร์ของหน่วยงานที่เผยแพร่ได้ ไม่ใช่เบอร์ส่วนตัว` });
    }

    if (!items.length) items.push({ level: "ok", id: "ready", message: "เนื้อหาและการตั้งค่าพร้อมใช้งาน" });
    return items;
  }

  /* ------------------------------------------------------------------
   * Settings: sanitising + share-link codec
   * Everything that enters the prompt from a link, an imported file or
   * saved storage is checked against the options the page itself offers.
   * ------------------------------------------------------------------ */
  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  function sanitizeSettings(raw, catalog, options) {
    const allowContent = Boolean(options && options.allowContent);
    const out = {};
    if (!isPlainObject(raw)) return out;

    let paletteId = has(raw, "paletteId") ? raw.paletteId : undefined;
    if (paletteId === undefined && isPlainObject(raw.palette) && has(raw.palette, "id")) paletteId = raw.palette.id;
    if (typeof paletteId === "string" && catalog.paletteIds.includes(paletteId)) out.paletteId = paletteId;

    if (has(raw, "toneIndex")) {
      if (raw.toneIndex === null) out.toneIndex = null;
      else if (Number.isInteger(raw.toneIndex) && raw.toneIndex >= 0 && raw.toneIndex <= 3) out.toneIndex = raw.toneIndex;
    }
    if (typeof raw.contentType === "string") out.contentType = catalog.normalizeContentType(raw.contentType);
    if (typeof raw.aspectRatio === "string") out.aspectRatio = catalog.normalizeAspectRatio(raw.aspectRatio);
    if (typeof raw.backgroundPattern === "string" && catalog.backgroundPatterns.includes(raw.backgroundPattern)) {
      out.backgroundPattern = raw.backgroundPattern;
    }
    if (typeof raw.artStyle === "string" && catalog.artStyles.includes(raw.artStyle)) out.artStyle = raw.artStyle;
    if (typeof raw.department === "string" && catalog.departments.includes(raw.department)) out.department = raw.department;
    if (typeof raw.includePeople === "boolean") out.includePeople = raw.includePeople;
    if (typeof raw.includeMetallic === "boolean") out.includeMetallic = raw.includeMetallic;
    if (typeof raw.target === "string") out.target = normalizeTarget(raw.target);
    if (typeof raw.length === "string") out.length = normalizeLength(raw.length);
    if (typeof raw.fontStyle === "string" && Array.isArray(catalog.fontStyles) && catalog.fontStyles.includes(raw.fontStyle)) {
      out.fontStyle = raw.fontStyle;
    }
    if (typeof raw.textMode === "string" && Array.isArray(catalog.textModes) && catalog.textModes.includes(raw.textMode)) {
      out.textMode = raw.textMode;
    }
    if (allowContent && typeof raw.content === "string") out.content = raw.content.slice(0, MAX_CONTENT_LENGTH);
    return out;
  }

  const SHARE_PREFIX = "v1.";
  const MAX_SHARE_LENGTH = 4096;

  function toBase64Url(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromBase64Url(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  }

  function encodeShare(settings) {
    return SHARE_PREFIX + toBase64Url(JSON.stringify(settings));
  }
  function decodeShare(value) {
    if (typeof value !== "string" || value.length > MAX_SHARE_LENGTH || !value.startsWith(SHARE_PREFIX)) return null;
    const body = value.slice(SHARE_PREFIX.length);
    if (!/^[A-Za-z0-9_-]*$/.test(body)) return null;
    try {
      const parsed = JSON.parse(fromBase64Url(body));
      return isPlainObject(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  const api = Object.freeze({
    TARGETS,
    DEFAULT_TARGET,
    DEFAULT_LENGTH,
    LENGTHS,
    MAX_CONTENT_LENGTH,
    SHORT_NEGATIVES,
    normalizeTarget,
    normalizeLength,
    getTarget,
    parseMasterPrompt,
    formatForTarget,
    aspectParam,
    isValidThaiNationalId,
    findPersonalData,
    assessSettings,
    sanitizeSettings,
    encodeShare,
    decodeShare,
  });

  root.HealthPromptTools = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
