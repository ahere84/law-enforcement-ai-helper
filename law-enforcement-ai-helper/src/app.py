def build_report(case):
    missing = []

    required_fields = [
        "officer_name",
        "date",
        "time",
        "location",
        "incident_type",
        "narrative_notes",
    ]

    for field in required_fields:
        if not case.get(field):
            missing.append(field.replace("_", " ").title())

    report = f"""
Incident Report Draft

Officer: {case.get("officer_name", "Missing")}
Date: {case.get("date", "Missing")}
Time: {case.get("time", "Missing")}
Location: {case.get("location", "Missing")}
Incident Type: {case.get("incident_type", "Missing")}

Narrative:
{case.get("narrative_notes", "Missing")}

Actions Taken:
{case.get("actions_taken", "No actions listed.")}
""".strip()

    return report, missing


if __name__ == "__main__":
    sample_case = {
        "officer_name": "Jane Doe",
        "date": "2026-05-17",
        "time": "14:30",
        "location": "100 Main Street",
        "incident_type": "Theft Report",
        "narrative_notes": "The reporting party stated that a laptop was missing from an office desk.",
        "actions_taken": "Statement taken from reporting party. Security footage review requested.",
    }

    draft_report, missing_items = build_report(sample_case)
    print(draft_report)

    if missing_items:
        print("\nMissing Information:")
        for item in missing_items:
            print(f"- {item}")
