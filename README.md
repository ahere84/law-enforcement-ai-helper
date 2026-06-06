# Law Enforcement AI Helper

Law Enforcement AI Helper is a CMSC 495 Team 5 capstone prototype for AI-assisted documentation and case review support. The app helps organize user-provided case details, generate a draft incident report, identify missing information, and suggest neutral follow-up questions for human review.

## Important Limitation

This system does not make legal decisions, identify suspects, determine guilt, classify gang affiliation, recommend charges, or replace officer or detective judgment. It only assists with documentation, organization, missing-information review, and follow-up preparation.

Use fictional sample data only. Do not enter real law enforcement data, real personal data, real API keys, private IP addresses, or sensitive records into the repository.

## Current Phase I Features

- Incident intake form
- Draft incident report generator
- Missing information checklist
- Case Intelligence Notes workflow
- Detective Copilot Review with local rule-based fallback
- Optional AI-assisted review through a local server endpoint
- Editable report output and copy workflow
- Sample fictional case data
- Automated unit tests for core report and review logic

## Project Setup

The prototype is intentionally lightweight for Phase I. It runs as a static React app served by a local PowerShell HTTP server.

Main source areas:

- `index.html` loads the browser app, React, ReactDOM, Babel, `src/reportLogic.js`, and `src/App.jsx`.
- `src/reportLogic.js` contains testable report, checklist, and review logic.
- `src/App.jsx` contains the React user interface and event handlers.
- `src/styles.css` contains layout and responsive styling.
- `scripts/serve.ps1` serves static files and exposes the optional `/api/analyze` endpoint.
- `tests/reportLogic.test.js` contains unit tests using Node's built-in test framework.
- `docs/testing.md` documents automated and manual validation.

Runtime libraries:

- React 18 from `https://unpkg.com/react@18/umd/react.development.js`
- ReactDOM 18 from `https://unpkg.com/react-dom@18/umd/react-dom.development.js`
- Babel Standalone from `https://unpkg.com/@babel/standalone/babel.min.js`
- Node.js for unit tests

## Run the Prototype

From the project folder:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\serve.ps1
```

Then open:

```text
http://localhost:4173
```

## Run Unit Tests

From the project folder:

```powershell
npm test
```

The unit tests verify required-field validation, multiline formatting, draft report generation, and detective copilot review logic.

## Optional AI Review

The prototype works without an API key. When no key is configured, the Detective Copilot Review uses local rule-based demo logic.

The `.env.example` file is safe to commit because it only shows expected variable names. Each teammate can copy it to a local `.env` file and add their own API key. The `.env` file is ignored by Git and must never be committed or shared.

To try AI-assisted review locally:

```powershell
copy .env.example .env
notepad .env
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\serve.ps1
```

Never commit `.env` or paste API keys into browser code.

## Team Members

- Mark Iversen
- Alex Isaac
- Andy Heredia
- Theodor Santos-Gafudy
