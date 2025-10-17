
# Project Plan - Secure Disclosure/Whistleblower Platform

**IMPORTANT RULES:**
- DO NOT modify any existing page designs, layouts, or styling without explicit user consent
- Focus only on the specific functionality requested
- Preserve all existing UI/UX elements and their positioning
- Test changes carefully to ensure no visual impact on existing pages
- Do not use mock data focus on making things work properly
- Security is paramount for an app offering secure communication

## Current Status - PROTOTYPE COMPLETE ✅
The platform has evolved from initial concept to a working prototype with all core functionality implemented and tested.

## ✅ COMPLETED FEATURES

### Core Platform Infrastructure
- ✅ Secure reporting interface with client-side encryption (AES-256)
- ❌ Audit Trail Page
- ❌ 
- ❌ Private AI Gateway

“Secure AI Gateway” (backend)
Build a TypeScript Node/Express service called ai-gateway with endpoints /ai/analyze (POST, SSE stream). Include middleware for JWT auth, org/user context, rate limiting, and PII redaction (emails, phones, NI numbers, credit cards). Add a provider abstraction supporting DeepSeek now (OpenAI-compatible client; model from env) and easily swappable later. The service must be stateless by default (no request/response content saved), but include an optional audit store (Postgres) that saves only hashes + metadata, with TTL and a schema migration. Enforce a 200kb payload limit. Add unit tests for redaction and tenancy isolation. Add a Dockerfile and GitHub Action to build/test. Keep everything production-ready.

“Frontend wiring” (app)
In the Disclosurely web app, add a Case Analysis panel with a Confidential Mode toggle. POST to /ai/analyze (SSE) with case_id, mode, and the case text. Render streaming tokens as they arrive. Never expose provider keys in the browser. Show a “Data Handling” notice: “Processed securely. No training. Confidential mode: analysis isn’t stored.” Add role-based permissions (Compliance Officer, HR, Admin) and show/hide the toggle by role. Add a test suite for streaming UI.

“Compliance docs”
Generate a Security & Privacy page section and developer docs that clearly state: (1) prompts/responses are not used to train external models, (2) data minimisation and PII redaction are applied, (3) storage is off by default; when enabled, short summaries and metadata only; (4) retention periods and deletion SLAs; (5) tenant isolation, encryption in transit/at rest; (6) options for self-hosted models.


---

*Last updated: 2025-10-16*
*Status: Refinement - Moving to Launch Preparation Phase*
