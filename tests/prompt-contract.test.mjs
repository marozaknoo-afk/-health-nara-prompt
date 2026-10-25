import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import test from "node:test";

const require = createRequire(import.meta.url);
const { buildContentTypeGuidance, getContentTypeProfile } = require("../content-types.js");

const scriptUrl = new URL("../script.js", import.meta.url);
const indexUrl = new URL("../index.html", import.meta.url);
const ratioUrl = new URL("../aspect-ratios.js", import.meta.url);

const [script, index, ratios] = await Promise.all([
  readFile(scriptUrl, "utf8"),
  readFile(indexUrl, "utf8"),
  readFile(ratioUrl, "utf8"),
]);

const requiredSections = [
  "[01] SINGLE-POINT COLOR CONTROL",
  "[02] SUBJECT & CONTENT",
  "[03] DESIGN CONCEPT",
  "[04] VISUAL COMPOSITION",
  "[05] TYPOGRAPHY",
  "[06] LIGHTING & RENDER QUALITY",
  "[07] OUTPUT SPECIFICATIONS",
  "[08] COLOR CONSISTENCY RULE",
];

test("Master Prompt follows the attached eight-section contract", () => {
  let previousIndex = -1;
  for (const section of requiredSections) {
    const sectionIndex = script.indexOf(section);
    assert.notEqual(sectionIndex, -1, `missing ${section}`);
    assert.ok(sectionIndex > previousIndex, `${section} is out of order`);
    previousIndex = sectionIndex;
  }
});

test("default output is 16:9 at 8K UHD", () => {
  assert.match(ratios, /DEFAULT_ASPECT_RATIO = "16:9 \(Widescreen\)"/);
  assert.match(ratios, /7680 × 4320 px \(8K UHD\)/);
  assert.match(script, /300 DPI/);
});

test("the interface explains all eight sections", () => {
  assert.match(index, /หลักเกณฑ์ \[01\]–\[08\]/);
  assert.match(index, /<li><b>08<\/b>/);
});

test("uploaded-file report renders untrusted values as text", () => {
  const reportStart = script.indexOf("function renderAttachFileReport");
  const reportEnd = script.indexOf("function applyTheme", reportStart);
  const reportFunction = script.slice(reportStart, reportEnd);
  assert.match(reportFunction, /detail\.textContent = value/);
  assert.match(reportFunction, /previewElement\.textContent = preview/);
  assert.doesNotMatch(reportFunction, /innerHTML/);
});

test("user content preview uses textContent", () => {
  assert.match(script, /els\.previewTitle\.textContent = state\.content/);
});

test("popular palette shortcuts search across every category", () => {
  const quickStart = script.indexOf("function renderQuick");
  const quickEnd = script.indexOf("function setQuery", quickStart);
  const quickFunction = script.slice(quickStart, quickEnd);
  assert.match(quickFunction, /state\.category = "All"/);
  assert.ok(
    quickFunction.indexOf('state.category = "All"') < quickFunction.indexOf("setQuery(btn.dataset.name)"),
    "category must reset before the shortcut search runs",
  );
});

test("dashboard content type follows an executive KPI decision model", () => {
  const profile = getContentTypeProfile("Dashboard / Data Visual");
  const guidance = buildContentTypeGuidance("Dashboard / Data Visual");
  assert.equal(profile.label, "แดชบอร์ด KPI สำหรับผู้บริหาร");
  assert.equal(profile.hierarchy, "executive-decision-first");
  assert.ok(profile.requiredZones.includes("KPI cards with actual and target"));
  assert.ok(profile.requiredZones.includes("priority exceptions and actions"));
  assert.match(guidance.composition, /current status/i);
  assert.match(guidance.composition, /off target/i);
  assert.match(guidance.composition, /needs action/i);
  assert.match(guidance.visualDirection, /actual-versus-target/i);
  assert.match(guidance.constraints, /N\/A or not provided/);
  assert.match(guidance.constraints, /Do not rely on color alone/);
});

test("Master Prompt emits one consolidated quality block and one negative block", () => {
  const buildStart = script.indexOf("function buildPrompt");
  const buildEnd = script.indexOf("function renderPrompt", buildStart);
  const buildFunction = script.slice(buildStart, buildEnd);
  assert.equal(buildFunction.split("${VISUAL_QUALITY_BLOCK}").length - 1, 1);
  assert.equal(buildFunction.split("${NEGATIVE_PROMPT_BLOCK}").length - 1, 1);
  assert.doesNotMatch(buildFunction, /Style Standards:/);
  assert.doesNotMatch(buildFunction, /Mandatory Quality Directive:/);
  assert.doesNotMatch(buildFunction, /NEGATIVE PROMPT:/);
});

test("Master Prompt includes every requested visual quality and negative rule", () => {
  const visualQualityRules = [
    "Visual Quality:",
    "Ultra Realistic",
    "Highly Detailed",
    "8K Quality",
    "Premium Government Banner",
    "Modern Healthcare Dashboard",
    "Luxury Blue Gold Theme",
    "Clean Professional Design",
    "Sharp Typography and Focus",
    "Perfect Alignment",
    "Symmetrical Layout",
    "Balanced Composition",
    "HDR Lighting",
    "Cinematic Depth of Field",
    "Realistic Light, Shadow, Skin, and Fabric Rendering",
    "Professional Photoshop Composite",
    "3D Data Visualization",
    "Glassmorphism Dashboard",
    "High Contrast",
    "High-end Editorial Quality",
    "No AI Generated Look",
    "Print Ready at Professional Print Quality",
  ];
  const negativeRules = [
    "Negative Prompt:",
    "distorted Thai characters",
    "misspelled words",
    "missing Thai tone marks or vowels",
    "broken or malformed glyphs",
    "scattered or fragmented text",
    "unreadable or illegible typography",
    "obscured key information",
    "long paragraphs",
    "added quotations",
    "slogans",
    "extra taglines or unauthorized text",
    "hallucinated, fabricated, or unprovided information",
    "fashion imagery",
    "idols",
    "unrelated people",
    "altered faces",
    "distorted uniforms",
    "duplicate people",
    "malformed hands or fingers",
    "overly sweet or informal visual tone",
    "excessive colors",
    "mismatched palettes",
    "poor contrast",
    "maps overlapping charts",
    "charts overlapping text",
    "fake charts",
    "deformed maps",
    "blurred numbers",
    "cluttered composition",
    "low-quality icons",
    "excessive lens flare",
    "watermarks",
    "signatures",
    "extra logos",
    "random lettering",
    "low resolution",
    "visual noise",
    "grain or compression artifacts",
    "uncontrolled gradients",
  ];
  for (const rule of [...visualQualityRules, ...negativeRules]) {
    assert.ok(script.includes(rule), `missing prompt rule: ${rule}`);
  }
});

test("system-authored Master Prompt instructions contain no Thai text", () => {
  const negativeStart = script.indexOf("const NEGATIVE_PROMPT_BLOCK");
  const negativeEnd = script.indexOf("const POPULAR", negativeStart);
  const buildStart = script.indexOf("function buildPrompt");
  const buildEnd = script.indexOf("function renderPrompt", buildStart);
  assert.doesNotMatch(script.slice(negativeStart, negativeEnd), /[ก-๙]/);
  assert.doesNotMatch(script.slice(buildStart, buildEnd), /[ก-๙]/);
});
