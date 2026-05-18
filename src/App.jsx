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
  const [copied, setCopied] = React.useState(false);

  const missingItems = buildMissingItems(caseData);

  function updateField(field, value) {
    setCaseData((current) => ({ ...current, [field]: value }));
    setCopied(false);
  }

  function generateReport() {
    setReport(buildReport(caseData));
    setCopied(false);
  }

  function loadSample() {
    setCaseData(sampleCase);
    setReport(buildReport(sampleCase));
    setCopied(false);
  }

  function resetForm() {
    setCaseData(emptyCase);
    setReport(buildReport(emptyCase));
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
              This tool assists with documentation only. It does not identify suspects, make legal conclusions, recommend charges, or replace official review.
            </p>
          </div>
        </aside>

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
