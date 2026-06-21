# SDD Progress Ledger — Project Skeleton

Plan: docs/superpowers/plans/2026-06-21-project-skeleton.md
Started: 2026-06-21
Status: COMPLETE

## Tasks

- [x] Task 1: Initialize project, git, and dependencies
- [x] Task 2: Set up next-intl and [locale] routing
- [x] Task 3: Header with LanguageToggle
- [x] Task 4: Database layer
- [x] Task 5: Scaffold all pages, API stubs, and image folders

## Completed

Task 1: complete (commits 9ac5508..8a4f75e, review clean after fixes)
  - Landed on Next.js 14.2.35 (Node 18 ceiling)
  - Post-review fixes: experimental.serverComponentsExternalPackages; CLAUDE.md db path
  - Minor: images in root img/ were committed (plan-mandated; real user photos, not placeholders)

Task 2: complete (commits 30334e9..3b84481, review clean after fix)
  - Used requestLocale async API (correct for next-intl@3 latest)
  - Post-review fix: added `?? 'bg'` fallback in i18n/request.js

Task 3: complete (commit 76845f4, review clean)
  - Minor noted: locale swap uses string replace (safe for this structure; regex would be more robust)

Task 4: complete (commit 860ccb0, review clean)
  - All 4 tables created; CJS/ESM module split correct; seed inserts 3 products

Task 5: complete (commit 863cd11, review clean)
  - 18/18 routes verified; all .gitkeep files 0 bytes; no images added

Final: 7 commits total (9ac5508..863cd11), all task reviews Approved
