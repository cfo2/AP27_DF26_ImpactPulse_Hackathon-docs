# ImpactPulse — Slack Architecture & PRD Excerpt (Section 12)

> **Document Purpose:** Standalone review copy of the Slack Bot Architecture & Configuration section from `docs/PRD.md` for judges and internal review.

---

## 12. Slack Bot Architecture & App Configuration

### 12.1 Bot Purpose & Governance Model

The ImpactPulse Slack bot is an **internal, decision-support and executive governance agent**. It bridges operational analytics with accountable organizational leadership by providing:

- **Source-Grounded Summaries:** Distinguishes verified CRM/database facts from risk assessments and recommendations.
- **Freshness & Provenance Indicators:** Explicitly stamps data provenance (Salesforce Standard Objects + Supabase) and real-time generation timestamps.
- **Human-in-the-Loop Governance Gate:** Strictly prohibits autonomous mutations; human authorization via Block Kit interactive buttons is required before generating Salesforce Tasks or updating escalation statuses.
- **Multi-Party Notification Dispatch:** Directs automated escalation notices to executive leadership (Executive Director Sam) and dispatch coordinators (Operations Coordinator Anu) via Slack Web API direct messaging.
- **Idempotency & Replay Protection:** Ensures that repeated button clicks or network retries never result in duplicate Salesforce task records or conflicting audit events.

---

### 12.2 Technical Architecture & Request Lifecycle

```text
+-----------------------------------------------------------------------------------+
|                                   SLACK CLIENT                                    |
|                                                                                   |
|  Executive invokes command:                  Executive clicks button:             |
|  `/project-risk` / `/board-brief`            [ ⚡ Escalate Risk ] / [ ✅ Approve ]  |
+-------------------------+-----------------------------------+---------------------+
                          |                                   |
        POST Request with |                 POST Request with |
        x-slack-signature |                 payload & signature
                          v                                   v
+-------------------------+-----------------------------------+---------------------+
|                          NEXT.JS SERVER / VERCEL EDGE LAYER                       |
|                                                                                   |
|  1. /api/slack/commands                      2. /api/slack/interactions           |
|     ├─ verifySlackSignature()                   ├─ verifySlackSignature()         |
|     ├─ Parse URL-encoded command                ├─ Parse interaction payload JSON |
|     ├─ Query program risk & CRM metrics         ├─ Dispatch DM notices to leaders |
|     └─ Return Block Kit response (in_channel)   ├─ Trigger Salesforce Task create |
|                                                 ├─ Write Supabase audit log       |
|                                                 └─ Replace message with audit card|
+-------------------------+-----------------------------------+---------------------+
                          |                                   |
                          v                                   v
+-------------------------+--------+        +-----------------+---------------------+
|        SALESFORCE CRM            |        |           SUPABASE DATABASE           |
|                                  |        |                                       |
|  • Task Standard Object          |        |  • approval_requests                  |
|  • Priority: High                |        |  • risk_escalations                   |
|  • AssignedTo: Sam (Exec Dir)    |        |  • audit_events (Governance Log)      |
|  • Subject: Escalate Risk Deficit|        |  • Idempotency key tracking           |
+----------------------------------+        +---------------------------------------+
```

---

### 12.3 Slash Commands Specification

| Command | HTTP Endpoint | Response Type | Description & Block Kit UI Elements |
|---|---|---|---|
| `/project-risk` | `/api/slack/commands` | `in_channel` | Surfaces high-risk program cards (e.g., Salesforce Career Foundations at 42% completion with 18 stalled learners), evidence breakdown, and the interactive `⚡ Escalate Risk` button. |
| `/escalate-risk` | `/api/slack/commands` | `in_channel` | Alias for `/project-risk` to immediately trigger the governed risk review card in the active channel. |
| `/board-brief` | `/api/slack/commands` | `in_channel` | Generates the Q1 2025 Executive Governance & Impact Brief with fundraising metrics ($360,000 raised / $500,000 goal) and the `✅ Request Board Review & Log Approval` button. |
| `/decision-queue` | `/api/slack/commands` | `ephemeral` | Renders a concise prioritized list of governance decisions pending executive sign-off. |
| `/impact-help` | `/api/slack/commands` | `ephemeral` | Displays the Executive Watchtower Command Guide with quick-action buttons to launch all workflows. |

---

### 12.4 Interactive Actions & State Handlers

| Action ID | Triggering Block Element | Execution Flow & Side Effects |
|---|---|---|
| `action_escalate_risk` | Button: `⚡ Escalate Risk (Create Task)` | 1. Directs DM notification to Sam (`U0C06KZRT6V`) with Task details.<br>2. Directs DM notification to Anu (`U0C0Z3RAKQ8`) requesting mentor reallocation.<br>3. Creates a High-Priority Salesforce Task assigned to Sam.<br>4. Writes audit event `RISK_ESCALATION_APPROVED` to Supabase.<br>5. Updates Slack card to `✅ Risk Escalation Successfully Executed & Logged`. |
| `action_approve_brief` | Button: `✅ Request Board Review & Log Approval` | 1. Logs approval in Supabase `approval_requests`.<br>2. Generates Salesforce Task for Board Secretary: *"Distribute Q1 2025 Approved Governance Brief"*.<br>3. Updates Slack card to `✅ Board Brief Approved for Internal Distribution`. |
| `action_open_dashboard` | Button: `📊 Open Dashboard` | URL action directing user to `/internal/executive` command center. |
| `action_view_brief_web` | Button: `🏛️ View Command Center` | URL action directing user to `/internal/executive` command center. |

---

### 12.5 Security: Cryptographic HMAC-SHA256 Signature Verification

All incoming requests to `/api/slack/commands` and `/api/slack/interactions` are cryptographically verified using the official Slack signing protocol (`lib/slack/verify-signature.ts`):

1. **Header Extraction:** Extracts `x-slack-signature` and `x-slack-request-timestamp`.
2. **Replay Prevention:** Checks that `|currentTime - timestamp| < 300 seconds` (5-minute window).
3. **Signature Computation:**
   $$\text{sig\_basestring} = \text{"v0:"} + \text{timestamp} + \text{":"} + \text{rawBody}$$
   $$\text{computed\_signature} = \text{"v0="} + \text{HMAC-SHA256}(\text{SLACK\_SIGNING\_SECRET}, \text{sig\_basestring})$$
4. **Timing-Safe Comparison:** Uses `crypto.timingSafeEqual` to prevent timing attacks.
