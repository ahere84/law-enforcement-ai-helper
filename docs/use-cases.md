# Use Cases

## Use Case 1: Draft Incident Report

A user enters incident details such as date, time, location, people involved, evidence or items, actions taken, and narrative notes. The system organizes the information into a structured draft report that can be edited before copying.

## Use Case 2: Missing Information Checklist

A user enters partial case details. The system reviews the required fields and lists missing information, such as officer name, date, time, location, incident type, people involved, narrative notes, or actions taken.

## Use Case 3: Case Intelligence Notes

A user adds structured investigation notes such as people of interest, known associates, related locations, evidence status, timeline notes, observed identifiers, and open questions. The system stores the notes as user-provided information for human review only.

## Use Case 4: Detective Copilot Review

A user selects Analyze Case after entering report details and case intelligence notes. The system creates a local review summary, lists key details, identifies missing information, and suggests neutral follow-up questions. The system does not identify suspects, classify gang affiliation, determine guilt, or recommend charges.

## Use Case 5: Optional AI-Assisted Review

When a local API key is configured, the local server can request an AI-assisted review using only the user-provided report and notes. If no key is configured, the app continues to work through local rule-based review logic.

