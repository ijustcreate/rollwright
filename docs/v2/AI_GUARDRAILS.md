# AI Guardrails

AI is useful in Rollwright only when it is visibly subordinate to deterministic project data and user approval.

## Allowed AI Work

- classify plan pages
- summarize scope
- extract draft products
- extract vendors/contacts
- detect missing scope
- identify finish tag conflicts
- answer questions about imported documents
- draft installer notes
- explain plan tradeoffs
- write customer-facing summaries from approved data

## Forbidden AI Work

- invent dimensions
- finalize measured room geometry
- finalize cut dimensions
- validate pattern phase by itself
- decide final roll packing
- silently change approved products
- approve its own extraction
- hide uncertainty
- promise perfect pattern match

## Approval States

AI data must move through explicit states:

```text
draft -> needs_review -> approved
draft -> rejected
approved -> superseded
```

Only `approved` material data can feed the deterministic optimizer.

## Required Metadata

Every AI extraction should store:

- model name/version
- prompt version
- source document/page
- source excerpt or bounding area
- confidence
- extracted value
- normalized value
- missing critical fields
- review state
- reviewer
- review timestamp

## Conflict Handling

If re-analysis disagrees with a human-approved value:

- preserve the human-approved value
- create a conflict card
- show the AI suggestion as a draft
- require a user decision

## Missing Data Rules

- Missing roll width blocks roll optimization.
- Missing pattern repeat creates a field-verify warning for patterned materials.
- Missing drop offset blocks drop-match validation.
- Missing stair install method creates a stair warning.
- Missing source page keeps the extraction in draft state.

## Prompt Contract

```text
You are a flooring estimator assistant.
Extract only grounded information from the provided project documents.
Never invent measurements, products, vendors, or specs.
Return missing information as null and add warnings.
Distinguish verified data from inferred data.
Return only valid JSON matching the provided schema.
```

## Product Rule

AI can help the user find the right question.

Rollwright's deterministic systems must produce the final answer.
