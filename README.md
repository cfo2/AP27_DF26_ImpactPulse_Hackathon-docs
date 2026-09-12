# ImpactPulse — Slack & Salesforce Hackathon Submission Package

Welcome Hackathon Judges! This folder contains all the architecture, source code, interactive simulators, test scripts, payload templates, and execution evidence demonstrating **ImpactPulse's Slack-Native Executive Command Center, Salesforce CRM Integration, and Responsible AI Governance Workflows**.

---

## 📁 Included Review & Submission Files

| File / Document | Category | Description |
|---|---|---|
| [`SLACK_INTERACTIVE_PREVIEW.html`](./SLACK_INTERACTIVE_PREVIEW.html) | **Interactive Simulator** | **Double-click to open in any web browser!** A standalone visual Slack simulator allowing judges to test slash commands, click `⚡ Escalate Risk`, and watch live telemetry dispatch to Sam & Anu with zero setup. |
| [`SALESFORCE_CONNECTED_APP_SETUP_WALKTHROUGH.md`](./SALESFORCE_CONNECTED_APP_SETUP_WALKTHROUGH.md) | **Salesforce Setup** | **Click-by-click Administrator Guide** for creating and configuring the Salesforce Connected App / External Client App with OAuth 2.0 Web Server Flow, IP relaxation, scope matrix, and troubleshooting gotchas. |
| [`SALESFORCE_INTEGRATION_GUIDE.md`](./SALESFORCE_INTEGRATION_GUIDE.md) | **Salesforce Architecture** | Complete guide to Salesforce standard objects schema (`Task`, `Opportunity`, `Account`), SOQL queries, and live-to-mock dual-mode client. |
| [`salesforce/`](./salesforce/) | **Salesforce Source Code** | Server-side Salesforce client (`client.ts`) and OAuth configuration (`config.ts`). |
| [`FINAL_SLACK_MANIFEST_DOCUMENTATION.md`](./FINAL_SLACK_MANIFEST_DOCUMENTATION.md) | **Slack Configuration** | Detailed review of the complete Slack App manifest, webhook endpoints, and permission scopes. |
| [`SLACK_APP_MANIFEST.json`](./SLACK_APP_MANIFEST.json) | **Manifest (JSON)** | 1-click import JSON for the [Slack Developer App Console](https://api.slack.com/apps). |
| [`SLACK_APP_MANIFEST.yaml`](./SLACK_APP_MANIFEST.yaml) | **Manifest (YAML)** | YAML version of the Slack manifest. |
| [`SLACK_BLOCK_KIT_BUILDER_PAYLOADS.json`](./SLACK_BLOCK_KIT_BUILDER_PAYLOADS.json) | **UI Templates** | Copy-paste JSON payloads for the official [Slack Block Kit Builder](https://app.slack.com/block-kit-builder). |
| [`SLACK_SALESFORCE_GOVERNANCE_SPEC.md`](./SLACK_SALESFORCE_GOVERNANCE_SPEC.md) | **AI & CRM Spec** | Exact Slack $\rightarrow$ Salesforce Standard `Task` mapping & Responsible AI judging criteria alignment. |
| [`SLACK_EXECUTION_EVIDENCE.md`](./SLACK_EXECUTION_EVIDENCE.md) | **Execution Proof** | Verified CLI simulation terminal outputs, replay/idempotency protection tests, and step-by-step state transition logs. |
| [`SLACK_TESTING_GUIDE.md`](./SLACK_TESTING_GUIDE.md) | **Testing Guide** | 3 testing modes: 1-line CLI simulation, cURL HTTP webhook testing, and live Slack workspace testing. |
| [`PRD_SLACK_SECTION_EXCERPT.md`](./PRD_SLACK_SECTION_EXCERPT.md) | **PRD Excerpt** | Standalone architecture excerpt from Section 12 of `docs/PRD.md`. |
| [`HACKATHON_PACKAGE_GENERATOR_PROMPT.md`](./HACKATHON_PACKAGE_GENERATOR_PROMPT.md) | **Reusable Playbook** | Prompt template to replicate this package for other projects. |
| [`simulate-risk-escalation-approval.ts`](./simulate-risk-escalation-approval.ts) | **TypeScript Engine** | Test engine that executes Salesforce task creation, Supabase audit logging, and idempotency checks. |
| [`commands/route.ts`](./commands/route.ts) | **Source Code** | Next.js API Route handler for all slash commands. |
| [`interactions/route.ts`](./interactions/route.ts) | **Source Code** | Next.js API Route handler for Block Kit interactive buttons and DM dispatches. |
| [`blocks.ts`](./blocks.ts) | **Source Code** | Block Kit card layout builder functions. |
| [`verify-signature.ts`](./verify-signature.ts) | **Source Code** | HMAC-SHA256 request signature verification security middleware. |
| [`escalate-route.ts`](./escalate-route.ts) | **Source Code** | API route for web-initiated executive escalations. |
| [`standalone-bolt-app/`](./standalone-bolt-app/) | **Standalone Daemon** | Complete Node.js / Slack Bolt server alternative supporting Socket Mode and HTTP. |

---

## ⚡ 3 Ways for Judges to Verify the Work

1. **Option A (Zero Setup — Instant Visual Simulator):**  
   Open [`SLACK_INTERACTIVE_PREVIEW.html`](./SLACK_INTERACTIVE_PREVIEW.html) in your browser.
2. **Option B (Zero Slack Setup — CLI Engine Simulation):**  
   Run `npx tsx scripts/simulate-risk-escalation-approval.ts --approve` in your terminal.
3. **Option C (Live Slack & Salesforce Workspace):**  
   Follow [`SALESFORCE_CONNECTED_APP_SETUP_WALKTHROUGH.md`](./SALESFORCE_CONNECTED_APP_SETUP_WALKTHROUGH.md) and [`SLACK_APP_MANIFEST.json`](./SLACK_APP_MANIFEST.json) to run live in your own Salesforce and Slack environments.
