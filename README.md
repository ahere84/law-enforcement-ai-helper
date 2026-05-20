# Law Enforcement AI Helper

Law Enforcement AI Helper is a class project for an AI-assisted documentation tool that helps organize case details, draft incident reports, and identify missing information for human review.

## Project Goal

The goal of this project is to reduce time spent on repetitive documentation tasks by helping users collect case details, organize information, generate draft reports, and identify missing information before human review.

## Important Limitation

This system does not make legal decisions, identify suspects, determine guilt, recommend charges, or replace officer judgment. It only assists with documentation and report preparation.

## Planned Features

- Case information intake form
- Draft incident report generator
- Missing information checklist
- Case summary generator
- Human review and edit workflow

## Prototype

Open `index.html` in a browser to try the current static React prototype. The first demo lets a user fill out an incident form, generate a structured draft report, edit the output, and copy it for review.

If the browser blocks local files, run this command from the project folder and open `http://localhost:4173`:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

## Optional AI Review

The prototype can run without an API key. In that mode, the Detective Copilot Review uses local demo logic.

The `.env.example` file is safe to commit because it only shows the variable names the project expects. Each teammate should copy it to their own local `.env` file and put their own API key there. The `.env` file is ignored by Git and should never be committed or shared.

To try AI-assisted review locally, copy `.env.example` to `.env`, add your API key, and restart the local server:

```powershell
copy .env.example .env
notepad .env
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

Never commit `.env` or paste API keys into the browser code.

Do not include real API keys, real personal information, real law enforcement data, or real team/private IP addresses in the repo. Use sample/demo values only.

## Team Members

- Mark Iversen
- Alex Isaac
- Andy Heredia
- Theodor Santos-Gafudy
