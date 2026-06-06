# Requirements

## Functional Requirements

- The system should allow a user to enter basic case details.
- The system should organize entered details into a structured report format.
- The system should generate an editable draft incident report.
- The system should show a checklist of missing required information.
- The system should allow a human user to review and revise generated output.
- The system should allow a user to enter structured case intelligence notes.
- The system should summarize key report and note details for review.
- The system should suggest neutral follow-up questions based on user-provided information.
- The system should support optional AI-assisted review through a local server endpoint.
- The system should fall back to local rule-based review when no API key is configured.

## Non-Functional Requirements

- The system should be simple to run locally.
- The system should keep all final decisions under human control.
- The system should avoid legal judgments and suspect classifications.
- The system should protect sensitive information when used with real data.
- The system should clearly state that outputs are draft support only.
- The system should not expose API keys in browser code or commit local `.env` files.
- The system should use fictional sample data for classroom demonstrations.

## Possible Future Features

- Export reports to a document file
- Save previous case drafts
- Add templates for different report types
- Add role-based access for users
- Add stronger input validation
- Add browser-level integration tests
- Add a clearer user guide and developer guide

