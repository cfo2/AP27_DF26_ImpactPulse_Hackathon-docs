# ImpactPulse — Slack to Salesforce & Responsible AI Governance Spec

This document details the exact **Slack Interaction $\rightarrow$ Salesforce Standard Object Data Mapping** and the **Responsible AI Governance Model** that fulfills the hackathon judging criteria.

---

## 1. Slack to Salesforce Standard Object Data Mapping

When an executive clicks `⚡ Escalate Risk (Create Task)` or `✅ Request Board Review & Log Approval` in Slack, the interaction endpoint (`/api/slack/interactions`) translates the Slack event into a standard Salesforce `Task` record:

| Salesforce Standard Field | API Name | Value Set by Slack Event |
|---|---|---|
| **Subject** | `Subject` | `"Urgent: Reallocate 3 mentors for Salesforce Career Foundations cohort"` |
| **Priority** | `Priority` | `"High"` |
| **Status** | `Status` | `"In Progress"` / `"Not Started"` |
| **Assigned Owner** | `OwnerId` / Name | Executive Director Sam (`U0C06KZRT6V`) |
| **Description** | `Description` | Multi-line structured body containing: Approver Slack User ID, Approval Timestamp, Telemetry (42% completion, 18 stalled learners, 2 mentors), and Impact ID (`ESC-2025-SF-01`) |
| **Activity Date** | `ActivityDate` | Set to +2 business days from timestamp |

---

## 2. Multi-Party Notification Pipeline

```
+---------------------------------------------------------------------------------------+
|                               EXECUTIVE CLICKS BUTTON                                 |
|                         [ ⚡ Escalate Risk (Create Task) ]                            |
+-------------------------------------------+-------------------------------------------+
                                            |
                                            v
+---------------------------------------------------------------------------------------+
|                    /api/slack/interactions (Webhook Router)                           |
+---------------------+---------------------+---------------------+---------------------+
                      |                     |                     |
                      v                     v                     v
+---------------------+ +-------------------+ +-------------------+ +-------------------+
|  1. DIRECT MESSAGE  | | 2. DIRECT MESSAGE | | 3. SALESFORCE CRM | | 4. SUPABASE AUDIT |
|     TO SAM (EXEC)   | |    TO ANU (COORD) | |    TASK CREATION  | |    EVENT LOG      |
|                     | |                   | |                   | |                   |
| "🚨 High-Priority   | | "📨 Mentor        | | Creates Standard  | | Inserts immutable |
|  Escalation Notice: | |  Dispatch Action  | | Task assigned to  | | row in table      |
|  Assigned High      | |  Required: Please | | Sam with 'High'   | | `audit_events`    |
|  Priority Task for  | |  reallocate 3     | | Priority for CRM  | | with idempotency  |
|  cohort risk."      | |  mentors."        | | tracking.         | | key tracking.     |
+---------------------+ +-------------------+ +-------------------+ +-------------------+
```

---

## 3. Responsible AI Hackathon Criteria Alignment

1. **Human-in-the-Loop Gate:** The agent never performs autonomous external actions. It provides grounded synthesis and requires an explicit click on the Slack Block Kit button before creating a Salesforce task or notifying coordinators.
2. **Data Provenance & Freshness:** Every Slack card includes a footer badge citing the exact data origin (Salesforce CRM + Supabase) and generation timestamp.
3. **Idempotency Protection:** Double-clicks, accidental re-submissions, and network retries use an idempotency key (`ESC-2025-SF-01`) to prevent duplicate Salesforce tasks.
4. **Separation of Facts vs Recommendations:** Block Kit cards strictly separate **Key Facts** (completion rate, stalled count) from **Risk Interpretations** and **Recommended Next Actions**.
