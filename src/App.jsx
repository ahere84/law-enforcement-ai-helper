const {
  emptyCase,
  emptyIntelligenceNotes,
  sampleCase,
  sampleIntelligenceNotes,
  buildMissingItems,
  buildReport,
  buildCaseReview,
} = ReportLogic;

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

function IntelligenceNotesPanel({ notes, onChange, onLoadSample }) {
  return (
    <section className="intelligence-panel">
      <div className="panel-heading">
        <div>
          <h2>Case Intelligence Notes</h2>
          <p>Add structured notes for human-reviewed case follow-up.</p>
        </div>
        <button type="button" className="ghost-button" onClick={onLoadSample}>
          Load Notes
        </button>
      </div>

      <div className="field-grid">
        <TextAreaField
          id="peopleOfInterest"
          label="People Of Interest"
          value={notes.peopleOfInterest}
          onChange={onChange}
          placeholder="People mentioned in the investigation, not conclusions"
        />
        <TextAreaField
          id="knownAssociates"
          label="Known Associates"
          value={notes.knownAssociates}
          onChange={onChange}
          placeholder="Associates or links that need human verification"
        />
        <TextAreaField
          id="locations"
          label="Related Locations"
          value={notes.locations}
          onChange={onChange}
          placeholder="Addresses, areas, routes, or places connected to the case"
        />
        <TextAreaField
          id="evidenceStatus"
          label="Evidence Status"
          value={notes.evidenceStatus}
          onChange={onChange}
          placeholder="Requested, pending, reviewed, missing, or disputed evidence"
        />
        <TextAreaField
          id="timelineNotes"
          label="Timeline Notes"
          value={notes.timelineNotes}
          onChange={onChange}
          placeholder="Important times, sequence of events, or gaps"
        />
        <TextAreaField
          id="observedIdentifiers"
          label="Observed Identifiers"
          value={notes.observedIdentifiers}
          onChange={onChange}
          placeholder="Neutral descriptions of visible clothing, language, markings, or other observations"
        />
        <TextAreaField
          id="openQuestions"
          label="Open Questions"
          value={notes.openQuestions}
          onChange={onChange}
          placeholder="Questions that still need detective review"
        />
      </div>
    </section>
  );
}

function App() {
  const [caseData, setCaseData] = React.useState(emptyCase);
  const [intelligenceNotes, setIntelligenceNotes] = React.useState(emptyIntelligenceNotes);
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

  function updateIntelligenceNote(field, value) {
    setIntelligenceNotes((current) => ({ ...current, [field]: value }));
    setCaseReview(null);
    setAiReview(null);
    setAiStatus("idle");
  }

  function generateReport() {
    setReport(buildReport(caseData));
    setCopied(false);
  }

  async function analyzeCase() {
    const localReview = buildCaseReview(caseData, intelligenceNotes, missingItems);
    const currentReport = buildReport(caseData);
    setReport(currentReport);
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
          intelligenceNotes,
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
    setIntelligenceNotes(sampleIntelligenceNotes);
    setReport(buildReport(sampleCase));
    setCaseReview(buildCaseReview(sampleCase, sampleIntelligenceNotes, buildMissingItems(sampleCase)));
    setAiReview(null);
    setAiStatus("idle");
    setCopied(false);
  }

  function loadSampleNotes() {
    setIntelligenceNotes(sampleIntelligenceNotes);
    setCaseReview(null);
    setAiReview(null);
    setAiStatus("idle");
  }

  function resetForm() {
    setCaseData(emptyCase);
    setIntelligenceNotes(emptyIntelligenceNotes);
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
              This tool assists with documentation and case review only. It does not identify suspects, classify gang affiliation, make legal conclusions,
              recommend charges, or replace official review.
            </p>
          </div>
        </aside>

        <IntelligenceNotesPanel notes={intelligenceNotes} onChange={updateIntelligenceNote} onLoadSample={loadSampleNotes} />

        <section className="copilot-panel">
          <div className="panel-heading">
            <div>
              <h2>Detective Copilot Review</h2>
              <p>Review the draft and notes for missing information and follow-up questions.</p>
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

              {aiStatus === "loading" && <div className="ai-status">Checking optional AI review endpoint...</div>}
              {aiStatus === "fallback" && (
                <div className="ai-status">
                  Local rule-based review shown. Add a local API key to enable optional AI-assisted review.
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
                <h3>Missing Information</h3>
                <ul>
                  {caseReview.missingItems.length ? (
                    caseReview.missingItems.map((item) => <li key={item}>{item}</li>)
                  ) : (
                    <li>No required intake fields are missing.</li>
                  )}
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
                Prototype note: review output is draft support for a qualified human reviewer. It is not a finding, accusation, legal conclusion, or charging recommendation.
              </p>
            </div>
          ) : (
            <div className="empty-state">
              Generate or enter report details, then select Analyze Case to review the draft and case intelligence notes.
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

