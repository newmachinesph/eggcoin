<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — EggCoin

<!-- CLAUDE.md in this repo is just: @AGENTS.md -->

## Stack
Next.js 16 · React 19 · Tailwind v4 (App Router, `src/`, Turbopack, TypeScript). Frontend-only prototype — **no backend yet**. Demo state lives in `localStorage`.

## Loadouts (equip what applies)
@~/.claude/rules/ecc/common/coding-style.md
<!-- core packs (common/karpathy/git/security/windows) are always on via global CLAUDE.md -->
@~/.claude/rules/loadout/profiles/agents.md
@~/.claude/rules/loadout/profiles/web.md
<!-- agents → orchestration + models · web → nextjs -->

## Golden rule
Pull current docs via **Context7** (or `node_modules/next/dist/docs/`) for the exact installed version before coding. Don't trust training memory.

## Memory (read at session start, update at session end)
- `PROJECT.md`  — current status
- `DECISIONS.md` — why we chose things
- `MISTAKES.md`  — pitfalls to not repeat
- `CONTRACT.md`  — plan for a high-risk change; create before, delete after verify
