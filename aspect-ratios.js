(function (root) {
  "use strict";

  function defineRatio(config) {
    return Object.freeze({
      ...config,
      safeArea: Object.freeze(config.safeArea),
      recommendedFor: Object.freeze(config.recommendedFor),
    });
  }

  const socialCore = ["Social Media Post", "Social Media Carousel", "Emergency Alert / Disease Advisory"];
  const printCore = ["Book / Report Cover", "Annual Report Cover", "Manual / Guideline Cover"];

  const ASPECT_RATIO_GROUPS = [
    {
      label: "Social Media",
      ratios: [
        defineRatio({
          id: "square-social", value: "1:1 (Square Social)", label: "1:1 — โพสต์สี่เหลี่ยม",
          resolution: "1080 × 1080 px", orientation: "square",
          safeArea: { top: "8%", right: "8%", bottom: "8%", left: "8%" }, bleed: "None",
          focalZone: "Center 72%", textScale: "Large mobile-first typography", cropStrategy: "Center-safe thumbnail crop",
          exportProfile: "sRGB, screen-ready PNG/JPEG", recommendedFor: [...socialCore, "Campaign Key Visual"],
        }),
        defineRatio({
          id: "portrait-feed", value: "4:5 (Portrait Feed)", label: "4:5 — โพสต์แนวตั้ง Feed",
          resolution: "1080 × 1350 px", orientation: "portrait",
          safeArea: { top: "8%", right: "8%", bottom: "10%", left: "8%" }, bleed: "None",
          focalZone: "Center 74%", textScale: "Large mobile-first typography", cropStrategy: "Protect center for square grid preview",
          exportProfile: "sRGB, screen-ready PNG/JPEG", recommendedFor: [...socialCore, "Public Health Poster", "Infographic"],
        }),
        defineRatio({
          id: "story-reel", value: "9:16 (Story / Reel)", label: "9:16 — Story / Reel / Shorts",
          resolution: "1080 × 1920 px", orientation: "portrait",
          safeArea: { top: "14%", right: "8%", bottom: "18%", left: "8%" }, bleed: "None",
          focalZone: "Center 70%", textScale: "Extra-large mobile typography", cropStrategy: "Protect content from captions, buttons, and progress overlays",
          exportProfile: "sRGB, screen-ready PNG/JPEG", recommendedFor: ["Emergency Alert / Disease Advisory", "Social Media Post", "Step-by-step Guide"],
        }),
        defineRatio({
          id: "social-link", value: "1.91:1 (Social Link Preview)", label: "1.91:1 — ภาพแชร์ลิงก์ / Open Graph",
          resolution: "1200 × 628 px", orientation: "landscape",
          safeArea: { top: "10%", right: "12%", bottom: "10%", left: "12%" }, bleed: "None",
          focalZone: "Center 68%", textScale: "Short headline typography", cropStrategy: "Protect center for platform-dependent preview crops",
          exportProfile: "sRGB, web-optimized JPEG/PNG", recommendedFor: ["Website Hero Banner", "Campaign Key Visual", "Public Health Poster"],
        }),
      ],
    },
    {
      label: "ทั่วไปและงาน Editorial",
      ratios: [
        defineRatio({
          id: "portrait-cover", value: "3:4 (Portrait Cover)", label: "3:4 — ปกแนวตั้ง",
          resolution: "4080 × 5440 px", orientation: "portrait",
          safeArea: { top: "10%", right: "10%", bottom: "10%", left: "10%" }, bleed: "3 mm when printed",
          focalZone: "Center 80%", textScale: "Editorial cover hierarchy", cropStrategy: "Protect title and organization lockup",
          exportProfile: "300 DPI, print-ready RGB/CMYK-ready", recommendedFor: [...printCore, "Fact Sheet / One-page Brief", "Infographic"],
        }),
        defineRatio({
          id: "standard-poster", value: "2:3 (Standard Poster)", label: "2:3 — โปสเตอร์มาตรฐาน",
          resolution: "4000 × 6000 px", orientation: "portrait",
          safeArea: { top: "8%", right: "8%", bottom: "10%", left: "8%" }, bleed: "3 mm when printed",
          focalZone: "Upper-center 72%", textScale: "Distance-readable poster typography", cropStrategy: "Preserve headline and call-to-action zones",
          exportProfile: "300 DPI, print-ready RGB/CMYK-ready", recommendedFor: ["Public Health Poster", "Event Poster", "Campaign Key Visual"],
        }),
        defineRatio({
          id: "photo-editorial", value: "3:2 (Photo / Editorial)", label: "3:2 — ภาพข่าว / Editorial",
          resolution: "6000 × 4000 px", orientation: "landscape",
          safeArea: { top: "7%", right: "7%", bottom: "7%", left: "7%" }, bleed: "3 mm when printed",
          focalZone: "Rule-of-thirds focal grid", textScale: "Minimal caption-safe typography", cropStrategy: "Maintain subject headroom and editorial crop flexibility",
          exportProfile: "300 DPI, high-quality editorial JPEG/TIFF", recommendedFor: ["Campaign Key Visual", "Website Hero Banner", "Presentation Slide"],
        }),
      ],
    },
    {
      label: "Presentation และหน้าจอ",
      ratios: [
        defineRatio({
          id: "widescreen", value: "16:9 (Widescreen)", label: "16:9 — สไลด์ / จอกว้าง",
          resolution: "7680 × 4320 px (8K UHD)", orientation: "landscape",
          safeArea: { top: "6%", right: "8%", bottom: "6%", left: "8%" }, bleed: "None",
          focalZone: "Center 84%", textScale: "Projection-readable typography", cropStrategy: "Protect outer edges from projector overscan",
          exportProfile: "sRGB, 4K screen-ready PNG/JPEG", recommendedFor: ["Presentation Slide", "Dashboard / Data Visual", "KPI Scorecard", "Process Flowchart"],
        }),
        defineRatio({
          id: "classic-presentation", value: "4:3 (Classic Presentation)", label: "4:3 — โปรเจกเตอร์แบบดั้งเดิม",
          resolution: "4000 × 3000 px", orientation: "landscape",
          safeArea: { top: "7%", right: "8%", bottom: "7%", left: "8%" }, bleed: "None",
          focalZone: "Center 82%", textScale: "Projection-readable typography", cropStrategy: "Protect content from projector overscan",
          exportProfile: "sRGB, presentation-ready PNG/JPEG", recommendedFor: ["Presentation Slide", "Training Material"],
        }),
        defineRatio({
          id: "ultrawide", value: "21:9 (Ultrawide)", label: "21:9 — จอ Ultrawide / Hero",
          resolution: "5120 × 2160 px", orientation: "ultrawide landscape",
          safeArea: { top: "8%", right: "12%", bottom: "8%", left: "12%" }, bleed: "None",
          focalZone: "Center 70% with wide environmental context", textScale: "Short large-format typography", cropStrategy: "Protect central content for 16:9 fallback crop",
          exportProfile: "sRGB, ultrawide screen-ready PNG/JPEG", recommendedFor: ["Website Hero Banner", "Backdrop / Stage Screen", "Campaign Key Visual"],
        }),
      ],
    },
    {
      label: "สิ่งพิมพ์",
      ratios: [
        defineRatio({
          id: "a4-portrait", value: "A4 Portrait (210:297)", label: "A4 — แนวตั้งเอกสาร",
          resolution: "2480 × 3508 px (A4 @ 300 DPI)", orientation: "portrait",
          safeArea: { top: "15 mm", right: "15 mm", bottom: "15 mm", left: "15 mm" }, bleed: "3 mm on all sides",
          focalZone: "Trim-safe content frame", textScale: "Document-readable typography", cropStrategy: "Keep all essential content inside trim-safe margins",
          exportProfile: "300 DPI, CMYK-ready PDF/TIFF", recommendedFor: ["Policy Brief / Executive Summary", "Fact Sheet / One-page Brief", ...printCore],
        }),
        defineRatio({
          id: "a4-landscape", value: "A4 Landscape (297:210)", label: "A4 — แนวนอน",
          resolution: "3508 × 2480 px (A4 @ 300 DPI)", orientation: "landscape",
          safeArea: { top: "15 mm", right: "15 mm", bottom: "15 mm", left: "15 mm" }, bleed: "3 mm on all sides",
          focalZone: "Trim-safe horizontal frame", textScale: "Document-readable typography", cropStrategy: "Protect signatures, legends, and edge labels",
          exportProfile: "300 DPI, CMYK-ready PDF/TIFF", recommendedFor: ["Certificate", "Process Flowchart", "Patient Journey / Service Journey", "Dashboard / Data Visual"],
        }),
        defineRatio({
          id: "a3-portrait", value: "A3 Portrait (297:420)", label: "A3 — โปสเตอร์แนวตั้ง",
          resolution: "3508 × 4961 px (A3 @ 300 DPI)", orientation: "portrait",
          safeArea: { top: "15 mm", right: "15 mm", bottom: "18 mm", left: "15 mm" }, bleed: "3 mm on all sides",
          focalZone: "Upper-center poster frame", textScale: "Medium-distance typography", cropStrategy: "Keep headline and source inside trim-safe frame",
          exportProfile: "300 DPI, CMYK-ready PDF/TIFF", recommendedFor: ["Public Health Poster", "Infographic", "Step-by-step Guide", "Fact Sheet / One-page Brief"],
        }),
        defineRatio({
          id: "a3-landscape", value: "A3 Landscape (420:297)", label: "A3 — แผนผังแนวนอน",
          resolution: "4961 × 3508 px (A3 @ 300 DPI)", orientation: "landscape",
          safeArea: { top: "15 mm", right: "15 mm", bottom: "18 mm", left: "15 mm" }, bleed: "3 mm on all sides",
          focalZone: "Wide trim-safe information grid", textScale: "Medium-distance typography", cropStrategy: "Protect legends and process endpoints",
          exportProfile: "300 DPI, CMYK-ready PDF/TIFF", recommendedFor: ["Dashboard / Data Visual", "Process Flowchart", "Patient Journey / Service Journey", "Geographic Map / Disease Map"],
        }),
        defineRatio({
          id: "a1-portrait", value: "A1 Portrait (594:841)", label: "A1 — โปสเตอร์วิชาการ",
          resolution: "7016 × 9933 px (A1 @ 300 DPI)", orientation: "portrait",
          safeArea: { top: "25 mm", right: "25 mm", bottom: "30 mm", left: "25 mm" }, bleed: "5 mm on all sides",
          focalZone: "Multi-column poster grid", textScale: "1–2 meter viewing-distance typography", cropStrategy: "Keep title, findings, and sources inside print-safe grid",
          exportProfile: "300 DPI, CMYK-ready PDF/X", recommendedFor: ["Research Poster", "Infographic", "Geographic Map / Disease Map"],
        }),
        defineRatio({
          id: "a0-portrait", value: "A0 Portrait (841:1189)", label: "A0 — Research Poster ขนาดใหญ่",
          resolution: "9933 × 14043 px (A0 @ 300 DPI)", orientation: "portrait",
          safeArea: { top: "30 mm", right: "30 mm", bottom: "35 mm", left: "30 mm" }, bleed: "5 mm on all sides",
          focalZone: "Large multi-column academic grid", textScale: "2–3 meter viewing-distance typography", cropStrategy: "Protect title, principal finding, and institutional footer",
          exportProfile: "300 DPI, CMYK-ready PDF/X", recommendedFor: ["Research Poster", "Geographic Map / Disease Map"],
        }),
        defineRatio({
          id: "trifold-a4", value: "Tri-fold A4 Landscape (297:210)", label: "A4 แนวนอน — โบรชัวร์สามพับ",
          resolution: "3508 × 2480 px (A4 @ 300 DPI)", orientation: "landscape three-panel",
          safeArea: { top: "12 mm", right: "12 mm", bottom: "12 mm", left: "12 mm" }, bleed: "3 mm outer bleed; 5 mm fold-safe gutters",
          focalZone: "Three coordinated vertical panels", textScale: "Handheld brochure typography", cropStrategy: "Keep text and faces clear of both fold lines",
          exportProfile: "300 DPI, CMYK-ready imposed PDF", recommendedFor: ["Brochure / Leaflet"],
        }),
      ],
    },
    {
      label: "ป้ายและงานอีเวนต์",
      ratios: [
        defineRatio({
          id: "event-backdrop", value: "2:1 (Event Backdrop)", label: "2:1 — ฉากหลังเวที",
          resolution: "6000 × 3000 px", orientation: "wide landscape",
          safeArea: { top: "10%", right: "10%", bottom: "14%", left: "10%" }, bleed: "50 mm when physically printed",
          focalZone: "Upper and outer zones with center-stage clearance", textScale: "Long-distance event typography", cropStrategy: "Keep critical text outside the speaker zone",
          exportProfile: "Large-format 150–300 DPI equivalent, CMYK-ready", recommendedFor: ["Backdrop / Stage Screen", "Conference Backdrop"],
        }),
        defineRatio({
          id: "wide-banner", value: "3:1 (Wide Banner)", label: "3:1 — ป้ายยาว / Website Banner",
          resolution: "6000 × 2000 px", orientation: "panoramic landscape",
          safeArea: { top: "12%", right: "10%", bottom: "12%", left: "10%" }, bleed: "50 mm for print; none for screen",
          focalZone: "Center 64% with short headline", textScale: "Long-distance headline typography", cropStrategy: "Protect center for responsive and installation crops",
          exportProfile: "Large-format CMYK-ready or sRGB web-ready", recommendedFor: ["Backdrop / Stage Screen", "Website Hero Banner", "Campaign Key Visual"],
        }),
        defineRatio({
          id: "rollup-85x200", value: "17:40 (85 × 200 cm Roll-up)", label: "85 × 200 ซม. — โรลอัปมาตรฐาน",
          resolution: "4016 × 9449 px (85 × 200 cm @ 120 DPI)", orientation: "tall portrait",
          safeArea: { top: "8%", right: "7%", bottom: "16%", left: "7%" }, bleed: "10 mm; reserve 150 mm at bottom for cassette hardware",
          focalZone: "Upper two-thirds vertical path", textScale: "1–3 meter viewing-distance typography", cropStrategy: "Protect headline at top and keep critical content above hardware zone",
          exportProfile: "Large-format CMYK-ready PDF/TIFF", recommendedFor: ["Roll-up Banner / Standee", "Public Health Poster"],
        }),
      ],
    },
  ];

  const ASPECT_RATIOS = Object.freeze(ASPECT_RATIO_GROUPS.flatMap((group) => group.ratios));
  const DEFAULT_ASPECT_RATIO = "16:9 (Widescreen)";
  const LEGACY_ASPECT_RATIOS = Object.freeze({
    "1:1 (Square)": "1:1 (Square Social)",
    "9:16 (Vertical Social)": "9:16 (Story / Reel)",
  });

  function normalizeAspectRatio(value) {
    const migrated = LEGACY_ASPECT_RATIOS[value] || value;
    return ASPECT_RATIOS.some((ratio) => ratio.value === migrated) ? migrated : DEFAULT_ASPECT_RATIO;
  }

  function getAspectRatioProfile(value) {
    const normalized = normalizeAspectRatio(value);
    return ASPECT_RATIOS.find((ratio) => ratio.value === normalized) || ASPECT_RATIOS[0];
  }

  function getAspectRatioCompatibility(contentType, ratioValue) {
    const selected = getAspectRatioProfile(ratioValue);
    const recommended = ASPECT_RATIOS.filter((ratio) => ratio.recommendedFor.includes(contentType));
    const recommendedValues = recommended.map((ratio) => ratio.value);
    if (!recommended.length) {
      return { isRecommended: true, message: "ใช้ได้กับชิ้นงานนี้", recommendedValues: [] };
    }
    if (recommendedValues.includes(selected.value)) {
      return { isRecommended: true, message: `✓ แนะนำสำหรับ ${contentType}`, recommendedValues };
    }
    return {
      isRecommended: false,
      message: `แนะนำสำหรับ ${contentType}: ${recommended.map((ratio) => ratio.value).join(" · ")}`,
      recommendedValues,
    };
  }

  function buildAspectRatioGuidance(value) {
    const profile = getAspectRatioProfile(value);
    const safeArea = `Top ${profile.safeArea.top}, Right ${profile.safeArea.right}, Bottom ${profile.safeArea.bottom}, Left ${profile.safeArea.left}`;
    return {
      profile,
      configuration: `CANVAS_SIZE = "${profile.resolution}"\nORIENTATION = "${profile.orientation}"\nSAFE_AREA = "${safeArea}"\nBLEED = "${profile.bleed}"\nFOCAL_ZONE = "${profile.focalZone}"\nTEXT_SCALE = "${profile.textScale}"\nCROP_STRATEGY = "${profile.cropStrategy}"\nEXPORT_PROFILE = "${profile.exportProfile}"`,
      output: `Compose for ${profile.value} at ${profile.resolution}. Preserve ${safeArea}. ${profile.cropStrategy}. Export as ${profile.exportProfile}.`,
    };
  }

  const api = Object.freeze({
    ASPECT_RATIO_GROUPS: Object.freeze(ASPECT_RATIO_GROUPS),
    ASPECT_RATIOS,
    DEFAULT_ASPECT_RATIO,
    normalizeAspectRatio,
    getAspectRatioProfile,
    getAspectRatioCompatibility,
    buildAspectRatioGuidance,
  });

  root.HealthPromptAspectRatios = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
