# Glossary discovery

Use when configuring glossary paths or when a caller has no path mapping.

Read the Planning Artifacts mapping in `docs/agents/workflow/config.md` first.
Configured paths govern, including legacy `CONTEXT.md` or `CONTEXT-MAP.md`.

Without a mapping, inspect `GLOSSARY-MAP.md` and legacy `CONTEXT-MAP.md` for
multiple contexts; otherwise find the applicable `GLOSSARY.md` or `CONTEXT.md`.
Use repo references and established consumers to identify authority. If both
conventions exist with conflicting meanings and no clear authority, report the
Setup gap and resolve it before editing either. A newer filename alone does
not establish authority.

Preserve existing conventions. For a new layout, default to `GLOSSARY.md` and
`GLOSSARY-MAP.md`. Create files only when there is confirmed domain language to
record. A naming migration must update all consumers together; routine setup
does not authorize renaming or creating a second glossary.
