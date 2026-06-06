const test = require("node:test");
const assert = require("node:assert/strict");
const logic = require("../src/reportLogic.js");

test("buildMissingItems returns all required labels for a blank case", () => {
  const missing = logic.buildMissingItems(logic.emptyCase);

  assert.deepEqual(missing, [
    "Officer name",
    "Date",
    "Time",
    "Location",
    "Incident type",
    "People involved",
    "Narrative notes",
    "Actions taken",
  ]);
});

test("buildMissingItems clears when sample case is complete", () => {
  assert.deepEqual(logic.buildMissingItems(logic.sampleCase), []);
});

test("formatList preserves trimmed multiline entries", () => {
  const formatted = logic.formatList(" Witness one \n\n Evidence photo ", "None listed");

  assert.equal(formatted, "- Witness one\n- Evidence photo");
});

test("formatList uses fallback for blank input", () => {
  assert.equal(logic.formatList("   ", "No evidence listed."), "- No evidence listed.");
});

test("buildReport includes entered report details and human review note", () => {
  const report = logic.buildReport(logic.sampleCase);

  assert.match(report, /Report Number: 2026-0517-001/);
  assert.match(report, /Incident Type: Theft Report/);
  assert.match(report, /qualified human reviewer/i);
});

test("buildCaseReview creates follow-up questions from report and intelligence notes", () => {
  const review = logic.buildCaseReview(
    logic.sampleCase,
    logic.sampleIntelligenceNotes,
    logic.buildMissingItems(logic.sampleCase)
  );

  assert.equal(review.reviewPriority, "Medium");
  assert.ok(review.suggestedQuestions.some((question) => question.includes("witness statement")));
  assert.ok(review.suggestedQuestions.some((question) => question.includes("video or camera footage")));
  assert.ok(review.keyDetails.some((detail) => detail.includes("People of interest listed: 1")));
});

test("buildCaseReview marks sparse cases as high priority when required fields are missing", () => {
  const review = logic.buildCaseReview(logic.emptyCase, logic.emptyIntelligenceNotes, logic.buildMissingItems(logic.emptyCase));

  assert.equal(review.reviewPriority, "High");
  assert.ok(review.suggestedQuestions.length >= 3);
});

