# AGENTS.md

## CORE

- Production-grade solutions only
- Scalability > shortcuts
- Maintainability + performance first
- Think before coding
- Never assume unknown facts
- Research before decisions
- Verify before concluding

---

## EXECUTION FLOW

1. ANALYZE
   - understand architecture
   - detect constraints
   - identify edge cases

2. PLAN
   - define implementation strategy
   - break into steps before coding

3. EXECUTE
   - clean
   - modular
   - scalable

4. VERIFY
   - production readiness
   - edge cases
   - regressions

---

## GLOBAL SKILLS (ALWAYS ACTIVE)

### graphify

ALWAYS use for:
- architecture analysis
- dependency tracing
- codebase understanding
- large project reasoning

Rules:
- NEVER blind-scan full repo
- ALWAYS check `graphify-out/GRAPH_REPORT.md` first
- Prefer graph traversal over file traversal
- Use:
  - graphify query
  - graphify path
  - graphify explain

After modifications:
- run: `graphify update .`

---

### caveman

ALWAYS active.

Rules:
- minimal wording
- no filler
- no repeated explanations
- bullets > paragraphs
- execution-focused responses only
- compress aggressively
- output only necessary information

---

## TOOL DISCIPLINE

- Never hallucinate tool behavior
- Never invent APIs/functions/flags
- Never assume IDE tool capabilities
- Read tool definitions first
- Use exact tool syntax
- Prefer official docs over assumptions

---

## DECISION RULES

- Big task → analyze first
- Big update → mandatory planning first
- Architecture task → graphify first
- Unknown area → research first
- Multiple solutions → choose industry standard
- Performance critical → optimize before shipping

---

## CONTEXT MANAGEMENT

- Keep context lean
- Avoid redundant explanations
- Do not repeat repo knowledge
- Do not reload unnecessary files
- Prefer targeted retrieval
- Prefer skills over giant prompts

---

## OUTPUT

- Structured only
- Short
- Direct
- Technical
- No teaching tone
- No summaries unless requested

---

## STRICT ANTI-PATTERNS

- no blind repo scanning
- no coding before planning
- no fake assumptions
- no verbose reasoning dumps
- no speculative architecture
- no unnecessary rewrites
- no excessive token usage

## POST-CHANGE RULES

After significant code changes:
- run: `graphify . --update`

After architecture changes:
- run full rebuild if needed

Never leave graph stale after major edits.

Always apply rate limiting in major API's.
Never commit secrets to github or hardcode secrets into code.

Use the bencium-innovative-ux-designer skill or ui-ux-pro-max-react-next-dashboard or frontend-design skill when asked to design or style something or something UI/web app UI related
