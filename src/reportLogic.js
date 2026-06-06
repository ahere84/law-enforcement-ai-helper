(function attachReportLogic(root, factory) {
  const api = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.ReportLogic = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : null, function createReportLogic() {
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

  const emptyIntelligenceNotes = {
    peopleOfInterest: "",
    knownAssociates: "",
    locations: "",
    evidenceStatus: "",
    timelineNotes: "",
    observedIdentifiers: "",
    openQuestions: "",
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

  const sampleIntelligenceNotes = {
    peopleOfInterest: "Unknown person seen near office area",
    knownAssociates: "No known associates confirmed",
    locations: "100 Main Street\nOffice area\nNearby hallway",
    evidenceStatus: "Security footage requested but not yet reviewed\nWitness statement pending full detail",
    timelineNotes: "12:00 - Laptop last seen\n13:15 - Unknown person seen near office\n14:30 - Report documented",
    observedIdentifiers: "Witness mentioned unknown person's clothing but no confirmed description yet",
    openQuestions: "Can the witness provide a more detailed description?\nDoes security footage show the office area?",
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
    const lines = splitLines(value);

    if (!lines.length) {
      return `- ${fallback}`;
    }

    return lines.map((line) => `- ${line}`).join("\n");
  }

  function splitLines(value) {
    return String(value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }

  function includesAny(source, terms) {
    const normalized = String(source || "").toLowerCase();
    return terms.some((term) => normalized.includes(term));
  }

  function buildMissingItems(caseData) {
    return requiredFields
      .filter(([key]) => !String(caseData[key] || "").trim())
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

  function buildCaseReview(caseData, intelligenceNotes, missingItems) {
    const notes = intelligenceNotes || emptyIntelligenceNotes;
    const combinedText = [
      caseData.incidentType,
      caseData.peopleInvolved,
      caseData.narrativeNotes,
      caseData.evidenceItems,
      caseData.actionsTaken,
      notes.peopleOfInterest,
      notes.knownAssociates,
      notes.locations,
      notes.evidenceStatus,
      notes.timelineNotes,
      notes.observedIdentifiers,
      notes.openQuestions,
    ].join(" ");

    const people = splitLines(caseData.peopleInvolved);
    const evidence = splitLines(caseData.evidenceItems);
    const actions = splitLines(caseData.actionsTaken);
    const peopleOfInterest = splitLines(notes.peopleOfInterest);
    const knownAssociates = splitLines(notes.knownAssociates);
    const relatedLocations = splitLines(notes.locations);
    const evidenceStatus = splitLines(notes.evidenceStatus);
    const timelineNotes = splitLines(notes.timelineNotes);
    const observedIdentifiers = splitLines(notes.observedIdentifiers);
    const openQuestions = splitLines(notes.openQuestions);

    const suggestedQuestions = followUpRules
      .filter((rule) => includesAny(combinedText, rule.terms))
      .map((rule) => rule.question);

    if (!String(caseData.evidenceItems || "").trim()) {
      suggestedQuestions.push("Is there physical, digital, photo, or video evidence that should be documented?");
    }

    if (!String(caseData.peopleInvolved || "").trim()) {
      suggestedQuestions.push("Who are the reporting party, witnesses, involved persons, or responding officers?");
    }

    if (!String(caseData.narrativeNotes || "").trim()) {
      suggestedQuestions.push("What is the basic timeline of what happened before, during, and after the incident?");
    }

    if (timelineNotes.length) {
      suggestedQuestions.push("Are there timeline gaps or conflicts that need to be resolved?");
    }

    if (openQuestions.length) {
      suggestedQuestions.push("Which open questions should be assigned for follow-up before final review?");
    }

    const intelligenceSignalCount =
      peopleOfInterest.length +
      knownAssociates.length +
      relatedLocations.length +
      evidenceStatus.length +
      timelineNotes.length +
      observedIdentifiers.length;
    const signalCount = suggestedQuestions.length + evidence.length + actions.length + intelligenceSignalCount;
    const reviewPriority = missingItems.length >= 4 ? "High" : signalCount >= 5 ? "Medium" : "Low";

    return {
      reviewPriority,
      summary: String(caseData.narrativeNotes || "").trim()
        ? `This case review is based on a ${caseData.incidentType || "reported incident"} at ${
            caseData.location || "an unspecified location"
          }. The current notes include ${people.length || "no listed"} report people, ${evidence.length || "no listed"} evidence item(s), ${
            actions.length || "no listed"
          } action(s), and ${intelligenceSignalCount || "no"} intelligence note(s).`
        : "Add narrative notes to generate a more useful case review summary.",
      keyDetails: [
        `Incident type: ${caseData.incidentType || "Missing"}`,
        `Location: ${caseData.location || "Missing"}`,
        `Report people listed: ${people.length || 0}`,
        `People of interest listed: ${peopleOfInterest.length || 0}`,
        `Known associates listed: ${knownAssociates.length || 0}`,
        `Related locations listed: ${relatedLocations.length || 0}`,
        `Evidence/status notes listed: ${evidence.length + evidenceStatus.length || 0}`,
        `Timeline notes listed: ${timelineNotes.length || 0}`,
        `Observed identifiers listed: ${observedIdentifiers.length || 0}`,
      ],
      suggestedQuestions: [...new Set(suggestedQuestions)],
      missingItems,
    };
  }

  return {
    emptyCase,
    emptyIntelligenceNotes,
    sampleCase,
    sampleIntelligenceNotes,
    requiredFields,
    followUpRules,
    formatList,
    splitLines,
    includesAny,
    buildMissingItems,
    buildReport,
    buildCaseReview,
  };
});

