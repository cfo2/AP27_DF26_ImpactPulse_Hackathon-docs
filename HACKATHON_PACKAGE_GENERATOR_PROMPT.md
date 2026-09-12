# 🚀 Reusable Hackathon Documentation & Slack Package Generator Prompt

> **How to Use This File:**  
> Copy the prompt template below into your AI coding assistant (Cursor, Antigravity, Claude, ChatGPT, etc.) on any other project to automatically generate a complete, judge-ready Hackathon documentation package and Slack App integration bundle.

---

```markdown
# TASK: Generate Complete Hackathon Documentation & Integration Package

Please create a comprehensive, judge-ready documentation and integration bundle for this hackathon project inside a dedicated folder named `Hackathon-docs/`.

## 1. Goal & Requirements
We need to present our integration (Slack bot, CRM/Database workflows, and AI governance) to hackathon judges with multiple redundant verification methods so there is zero risk of evaluation failure.

Please generate the following deliverables:

---

### Deliverable A: Dedicated `Hackathon-docs/` Package Folder
Create a standalone directory `Hackathon-docs/` containing:

1. **`SLACK_APP_MANIFEST.json` & `SLACK_APP_MANIFEST.yaml`:**
   - Pre-configured Slack App Manifests with display info, slash commands, interactive webhook request URLs, and minimum OAuth bot token scopes (`chat:write`, `commands`, `im:write`, `im:history`, `im:read`, `users:read`, `app_mentions:read`).
   
2. **`FINAL_SLACK_MANIFEST_DOCUMENTATION.md`:**
   - Complete technical breakdown of the Slack manifest, webhook routes, permission scopes matrix, and a 60-second judge setup guide.

3. **`SLACK_INTERACTIVE_PREVIEW.html`:**
   - A standalone, zero-dependency visual HTML simulator using Tailwind CSS.
   - Allows judges to double-click and open in any browser, click slash commands, view Block Kit cards, test interactive button actions, and watch simulated telemetry logs with ZERO installation required.

4. **`SLACK_BLOCK_KIT_BUILDER_PAYLOADS.json`:**
   - Raw JSON payloads ready to copy and paste directly into the official [Slack Block Kit Builder](https://app.slack.com/block-kit-builder).

5. **`SLACK_SALESFORCE_GOVERNANCE_SPEC.md` (or Target CRM/DB Spec):**
   - Detailed mapping showing how Slack interactive button clicks map to database/CRM records.
   - Multi-party notification pipeline architecture diagram.
   - Explicit alignment with the **Responsible AI Hackathon Judging Criteria** (Human-in-the-loop gate, data provenance, freshness timestamps, idempotency & replay protection, and separation of facts from recommendations).

6. **`SLACK_EXECUTION_EVIDENCE.md`:**
   - Terminal transcripts showing successful simulation runs, idempotency replay tests, and state transition logs.

7. **`SLACK_TESTING_GUIDE.md`:**
   - Step-by-step instructions for 3 testing modes:
     - Tier 1: Zero-setup browser simulator
     - Tier 2: CLI simulation engine (`npx tsx ...`)
     - Tier 3: Live Slack workspace testing

8. **`PRD_SLACK_SECTION_EXCERPT.md`:**
   - Standalone copy of the PRD integration architecture section for quick judge review.

9. **`README.md` (in `Hackathon-docs/`):**
   - Master index with table of files, architecture diagrams, and 3-step judge verification pathways.

10. **Source Code Copies & Standalone Daemon:**
    - Copy all slash command routes (`commands/route.ts`), interaction routes (`interactions/route.ts`), UI builders (`blocks.ts`), signature verification middleware (`verify-signature.ts`), and simulation scripts into `Hackathon-docs/`.
    - Provide a `standalone-bolt-app/` subfolder with a Node.js Slack Bolt server (`server.ts` + `package.json`) supporting both HTTP and Socket Mode.

---

### Deliverable B: Update the Project PRD (`docs/PRD.md` or `PRD.md`)
Update the main PRD file to include:
- A dedicated **Slack Bot Architecture & App Configuration** section.
- Complete ASCII architecture request lifecycle diagram (Slack $\leftrightarrow$ Next.js/API Server $\leftrightarrow$ CRM/Database).
- Slash commands table with endpoint URLs and Block Kit element descriptions.
- Interactive action matrix with state change workflows.
- Cryptographic HMAC-SHA256 signature verification protocol (`x-slack-signature`, timing-safe comparisons, 5-minute replay window).
- Embedded JSON Slack App Manifest.
- Step-by-step judge setup guide.

---

### Deliverable C: Verification & Quality Control
1. Run a type check (e.g. `npx tsc --noEmit`) to ensure the codebase and documentation subfolders build with 0 errors.
2. Run the simulation script and verify clean exit codes.
3. Provide a clear summary checklist of all generated files.
```
