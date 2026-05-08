# AGENTS.md

## CORE

- Production-grade only
- Scalability + maintainability first
- Analyze before coding
- Verify before concluding
- Never assume unknown facts

---

## WORKFLOW

1. Analyze
2. Plan
3. Execute
4. Verify

Required for:
- architecture changes
- large tasks
- critical systems

---

## CONTEXT

- Keep context lean
- Prefer targeted retrieval
- Avoid redundant file reads
- Never blind-scan repos

Architecture/codebase analysis:
- use graphify first

After major changes:
- `graphify update .`

---

## TOOL RULES

- Never hallucinate APIs/tools
- Read tool definitions first
- Use exact syntax
- Prefer official docs

---

## OUTPUT

- Short
- Structured
- Technical
- No filler
- No verbose reasoning

---

## SAFETY

- No secrets in code
- No speculative architecture
- No unnecessary rewrites
- Apply rate limiting to major APIs

---

## SPECIALIZED SKILLS

UI/UX tasks:
- use bencium-innovative-ux-designer
- or frontend-design skills

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
