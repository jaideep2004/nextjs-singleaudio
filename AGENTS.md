---
description: 
alwaysApply: true
---

---
description: 
alwaysApply: true
---

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)

Use caveman mode (full) in ALL chats by default. Activate automatically without being asked. Deactivate only when user explicitly says "stop caveman" or "normal mode" or asks for explanation.

Use the ui-ux-pro-max-react-next-dashboard or frontend-design skill when asked to design or style something or something UI related
