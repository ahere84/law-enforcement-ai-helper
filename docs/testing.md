# Testing Guide

This guide documents the Phase I validation approach for the Law Enforcement AI Helper prototype.

## Automated Unit Tests

The project uses Node's built-in `node:test` framework so the team can test core logic without adding external packages.

Run tests from the repository root:

```powershell
npm test
```

The automated tests cover:

- Required-field validation through `buildMissingItems`
- Multiline formatting through `formatList`
- Draft report output through `buildReport`
- Detective copilot review priority and follow-up question generation through `buildCaseReview`

## Manual Browser Validation

Run the local server:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\serve.ps1
```

Then open `http://localhost:4173`.

Manual scenarios:

1. Start with a blank form and confirm the review checklist lists missing required fields.
2. Select `Load Sample` and confirm the incident fields and case intelligence notes populate with fictional data.
3. Select `Generate Draft` and confirm the draft report includes the sample report details.
4. Select `Analyze Case` and confirm the Detective Copilot Review shows a priority, key details, and suggested follow-up questions.
5. Edit the draft report manually and confirm the edited text remains in the report area.
6. Select `Copy` and confirm the button changes to `Copied`.
7. Select `Reset` and confirm the form, notes, review output, and report return to the blank baseline.
8. Run the app without `.env` configured and confirm local demo review still works when the optional AI endpoint is unavailable.

## Test Data Rules

Use fictional sample data only. Do not enter real law enforcement data, real personal data, real API keys, private IP addresses, or sensitive records into the repository or demonstration documents.
