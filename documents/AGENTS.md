# Documentation guide

Keep project documents factual, concise, and usable without conversation history. Never include secret values or complete subscriber addresses.

- Architecture decisions: `documents/architecture/`
- Content and route policy: `documents/content/`
- Testing: `documents/testing/`
- Cloudflare deployment, cutover, and rollback: `documents/migration/`
- Active implementation plan: `documents/todo/astro_cloudflare_workers_migration_plan.md`

The cutover runbook owns the exact DNS before-state and rollback. Do not edit it from public DNS observations alone.
