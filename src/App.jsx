const emptyCase = {
  officerName: "",
  badgeNumber: "",
  reportNumber: "",
  date: "",
  time: "",
  location: "",
  incidentType: "",
  peopleInvolved: "",
  narrativeNotes: "",
  evidenceItems: "",
  actionsTaken: "",
};

const sampleCase = {
  officerName: "Jane Doe",
  badgeNumber: "1042",
  reportNumber: "2026-0517-001",
  date: "2026-05-17",
  time: "14:30",
  location: "100 Main Street",
  incidentType: "Theft Report",
  peopleInvolved: "Reporting party: John Smith\nWitness: Maria Lopez",
  narrativeNotes:
    "The reporting party stated that a laptop was missing from an office desk. The item was last seen around 12:00. A witness reported seeing an unknown person near the office area around 13:15.",
  evidenceItems: "Missing laptop\nPossible security camera footage",
  actionsTaken:
    "Took statement from reporting party\nIdentified possible witness\nRequested security footage review",
};

const requiredFields = [
  ["officerName", "Officer name"],
  ["date", "Date"],
  ["time", "Time"],
  ["location", "Location"],
  ["incidentType", "Incident type"],
  ["peopleInvolved", "People involved"],
  ["narrativeNotes", "Narrative notes"],
  ["actionsTaken", "Actions taken"],
];

const followUpRules = [
  {
    terms: ["witness", "statement"],
    question: "Has the full witness statement been collected and verified?",
  },
  {
    terms: ["camera", "video", "footage"],
    question: "Has available video or camera footage been requested and reviewed?",
  },
  {
    terms: ["associate", "group", "known"],
    question: "Are the named associates connected to any prior reports or open cases?",
  },
  {
    terms: ["tattoo", "symbol", "insignia", "clothing", "jewelry"],
    question: "Were visible identifiers documented with neutral descriptions and reviewed by a detective?",
  },
  {
    terms: ["weapon", "threat", "assault"],
    question: "Was officer safety risk documented and were required notifications completed?",
  },
];

function formatList(value, fallback) {
  const lines = value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return `- ${fallback}`;
  }

  return lines.map((line) => `- ${line}`).join("\n");
}

function splitLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function includesAny(source, terms) {
  const normalized = source.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function buildCaseReview(caseData, missingItems) {
  const combinedText = [
    caseData.incidentType,
    caseData.peopleInvolved,
    caseData.narrativeNotes,
    caseData.evidenceItems,
    caseData.actionsTaken,
  ].join(" ");

  const people = splitLines(caseData.peopleInvolved);
  const evidence = splitLines(caseData.evidenceItems);
  const actions = splitLines(caseData.actionsTaken);
  const suggestedQuestions = followUpRules
    .filter((rule) => includesAny(combinedText, rule.terms))
    .map((rule) => rule.question);

  if (!caseData.evidenceItems.trim()) {
    suggestedQuestions.push("Is there physical, digital, photo, or video evidence that should be documented?");
  }

  if (!caseData.peopleInvolved.trim()) {
    suggestedQuestions.push("Who are the reporting party, witnesses, involved persons, or responding officers?");
  }

  if (!caseData.narrativeNotes.trim()) {
    suggestedQuestions.push("What is the basic timeline of what happened before, during, and after the incident?");
  }

  const signalCount = suggestedQuestions.length + evidence.length + actions.length;
  const reviewPriority = missingItems.length >= 4 ? "High" : signalCount >= 5 ? "Medium" : "Low";

  return {
    reviewPriority,
    summary: caseData.narrativeNotes.trim()
      ? `This case review is based on a ${caseData.incidentType || "reported incident"} at ${
          caseData.location || "an unspecified location"
        }. The current notes include ${people.length || "no listed"} people, ${evidence.length || "no listed"} evidence item(s), and ${
          actions.length || "no listed"
        } action(s).`
      : "Add narrative notes to generate a more useful case review summary.",
    keyDetails: [
      `Incident type: ${caseData.incidentType || "Missing"}`,
      `Location: ${caseData.location || "Missing"}`,
      `People listed: ${people.length || 0}`,
      `Evidence/items listed: ${evidence.length || 0}`,
      `Actions listed: ${actions.length || 0}`,
    ],
    suggestedQuestions: [...new Set(suggestedQuestions)],
    missingItems,
  };
}

function buildMissingItems(caseData) {
  return requiredFields
    .filter(([key]) => !caseData[key].trim())
    .map(([, label]) => label);
}

function buildReport(caseData) {
  const officer = caseData.officerName || "Missing";
  const date = caseData.date || "Missing";
  const time = caseData.time || "Missing";
  const location = caseData.location || "Missing";
  const incidentType = caseData.incidentType || "Missing";
  const reportNumber = caseData.reportNumber || "Not assigned";
  const badgeNumber = caseData.badgeNumber || "Not provided";

  return `INCIDENT REPORT DRAFT

Report Number: ${reportNumber}
Officer: ${officer}
Badge Number: ${badgeNumber}
Date: ${date}
Time: ${time}
Location: ${location}
Incident Type: ${incidentType}

INCIDENT SUMMARY
On ${date} at approximately ${time}, ${officer} documented a ${incidentType.toLowerCase()} at ${location}. This draft report is based on the information entered by the user and should be reviewed before final submission.

PEOPLE INVOLVED
${formatList(caseData.peopleInvolved, "No people listed.")}

NARRATIVE
${caseData.narrativeNotes || "No narrative notes provided."}

EVIDENCE OR ITEMS
${formatList(caseData.evidenceItems, "No evidence or items listed.")}

ACTIONS TAKEN
${formatList(caseData.actionsTaken, "No actions listed.")}

REVIEW NOTE
This document is an assisted draft. A qualified human reviewer should verify accuracy, completeness, policy compliance, and required approvals before use.`;
}

function Field({ id, label, value, onChange, type = "text", required = false, placeholder }) {
  return (
    <label className="field" htmlFor={id}>
      <span>
        {label}
        {required && <strong> Required</strong>}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(id, event.target.value)}
      />
    </label>
  );
}

function TextAreaField({ id, label, value, onChange, required = false, placeholder }) {
  return (
    <label className="field field-wide" htmlFor={id}>
      <span>
        {label}
        {required && <strong> Required</strong>}
      </span>
      <textarea
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(id, event.target.value)}
      />
    </label>
  );
}

function App() {
  const [caseData, setCaseData] = React.useState(emptyCase);
  const [report, setReport] = React.useState(buildReport(emptyCase));
  const [caseReview, setCaseReview] = React.useState(null);
  const [aiReview, setAiReview] = React.useState(null);
  const [aiStatus, setAiStatus] = React.useState("idle");
  const [copied, setCopied] = React.useState(false);

  const missingItems = buildMissingItems(caseData);

  function updateField(field, value) {
    setCaseData((current) => ({ ...current, [field]: value }));
    setCaseReview(null);
    setAiReview(null);
    setAiStatus("idle");
    setCopied(false);
  }

  function generateReport() {
    setReport(buildReport(caseData));
    setCopied(false);
  }

  async function analyzeCase() {
    const localReview = buildCaseReview(caseData, missingItems);
    const currentReport = buildReport(caseData);
    setCaseReview(localReview);
    setAiReview(null);
    setAiStatus("loading");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          caseData,
          report: currentReport,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "AI review is unavailable.");
      }

      setAiReview(data);
      setAiStatus("ready");
    } catch (error) {
      setAiStatus("fallback");
    }
  }

  function loadSample() {
    setCaseData(sampleCase);
    setReport(buildReport(sampleCase));
    setCaseReview(buildCaseReview(sampleCase, buildMissingItems(sampleCase)));
    setAiReview(null);
    setAiStatus("idle");
    setCopied(false);
  }

  function resetForm() {
    setCaseData(emptyCase);
    setReport(buildReport(emptyCase));
    setCaseReview(null);
    setAiReview(null);
    setAiStatus("idle");
    setCopied(false);
  }

  async function copyReport() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Team 5 Prototype</p>
          <h1>Law Enforcement AI Helper</h1>
        </div>
        <div className="status-pill">Human review required</div>
      </section>

      <section className="workspace">
        <form className="intake-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="panel-heading">
            <div>
              <h2>Incident Intake</h2>
              <p>Enter case details, then generate a structured draft.</p>
            </div>
            <button type="button" className="ghost-button" onClick={loadSample}>
              Load Sample
            </button>
          </div>

          <div className="field-grid">
            <Field id="officerName" label="Officer Name" value={caseData.officerName} onChange={updateField} required />
            <Field id="badgeNumber" label="Badge Number" value={caseData.badgeNumber} onChange={updateField} />
            <Field id="reportNumber" label="Report Number" value={caseData.reportNumber} onChange={updateField} />
            <Field id="date" label="Date" type="date" value={caseData.date} onChange={updateField} required />
            <Field id="time" label="Time" type="time" value={caseData.time} onChange={updateField} required />
            <Field id="location" label="Location" value={caseData.location} onChange={updateField} required />
            <Field id="incidentType" label="Incident Type" value={caseData.incidentType} onChange={updateField} required />
            <TextAreaField
              id="peopleInvolved"
              label="People Involved"
              value={caseData.peopleInvolved}
              onChange={updateField}
              required
              placeholder="Reporting party, witnesses, involved parties"
            />
            <TextAreaField
              id="narrativeNotes"
              label="Narrative Notes"
              value={caseData.narrativeNotes}
              onChange={updateField}
              required
              placeholder="Paste or type the officer's rough notes here"
            />
            <TextAreaField
              id="evidenceItems"
              label="Evidence Or Items"
              value={caseData.evidenceItems}
              onChange={updateField}
              placeholder="Photos, property, video footage, documents"
            />
            <TextAreaField
              id="actionsTaken"
              label="Actions Taken"
              value={caseData.actionsTaken}
              onChange={updateField}
              required
              placeholder="Statements taken, notifications made, next steps"
            />
          </div>

          <div className="actions">
            <button type="button" className="primary-button" onClick={generateReport}>
              Generate Draft
            </button>
            <button type="button" className="secondary-button" onClick={analyzeCase}>
              Analyze Case
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              Reset
            </button>
          </div>
        </form>

        <aside className="review-panel">
          <div className="panel-heading">
            <div>
              <h2>Review Checklist</h2>
              <p>{missingItems.length ? "Complete these fields before final review." : "Required fields are complete."}</p>
            </div>
          </div>

          <div className={missingItems.length ? "checklist warning" : "checklist complete"}>
            {missingItems.length ? (
              missingItems.map((item) => <div key={item}>Missing: {item}</div>)
            ) : (
              <div>Ready for draft review</div>
            )}
          </div>

          <div className="policy-note">
            <h3>Prototype Boundary</h3>
            <p>
              This tool assists with case review only. It does not identify suspects, classify gang affiliation, make legal conclusions, recommend charges, or replace official review.
            </p>
          </div>
        </aside>

        <section className="copilot-panel">
          <div className="panel-heading">
            <div>
              <h2>Detective Copilot Review</h2>
              <p>Analyze the draft for key details and follow-up questions.</p>
            </div>
            <button type="button" className="ghost-button" onClick={analyzeCase}>
              Analyze
            </button>
          </div>

          {caseReview ? (
            <div className="copilot-content">
              <div className={`priority priority-${caseReview.reviewPriority.toLowerCase()}`}>
                Review Priority: {caseReview.reviewPriority}
              </div>

              {aiStatus === "loading" && <div className="ai-status">Checking AI review endpoint...</div>}
              {aiStatus === "fallback" && (
                <div className="ai-status">
                  Local demo review shown. Add a local API key to enable AI-assisted review.
                </div>
              )}
              {aiReview && (
                <div className="ai-review">
                  <h3>AI-Assisted Review</h3>
                  <pre>{aiReview.reviewText}</pre>
                </div>
              )}

              <div>
                <h3>Case Summary</h3>
                <p>{caseReview.summary}</p>
              </div>

              <div>
                <h3>Key Details</h3>
                <ul>
                  {caseReview.keyDetails.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3>Suggested Follow-Up Questions</h3>
                <ul>
                  {caseReview.suggestedQuestions.length ? (
                    caseReview.suggestedQuestions.map((question) => <li key={question}>{question}</li>)
                  ) : (
                    <li>No specific follow-up questions yet. Add more case notes to improve the review.</li>
                  )}
                </ul>
              </div>

              <p className="review-disclaimer">
                Prototype note: this is rule-based demo logic that simulates an AI assistant. A future version can connect this workflow to an AI API.
              </p>
            </div>
          ) : (
            <div className="empty-state">
              Generate or enter report details, then select Analyze Case to simulate an AI-assisted detective review.
            </div>
          )}
        </section>

        <section className="report-panel">
          <div className="panel-heading">
            <div>
              <h2>Draft Report</h2>
              <p>Edit the generated output before copying it.</p>
            </div>
            <button type="button" className="ghost-button" onClick={copyReport}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            className="report-output"
            value={report}
            onChange={(event) => {
              setReport(event.target.value);
              setCopied(false);
            }}
          />
        </section>
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
