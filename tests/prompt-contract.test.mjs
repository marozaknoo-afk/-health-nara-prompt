import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
