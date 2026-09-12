# ImpactPulse — Slack Bot Testing & Simulation Guide

This document provides instructions for testing the ImpactPulse Slack functionality either **locally without Slack** or **live in a real Slack workspace**.

---

## 1. Local CLI Simulation (Zero Setup Required)

You can run the full governance simulation script to test risk loading, idempotency protection, Salesforce Task payload construction, Supabase audit event creation, and Slack notification rendering:

### Run Default Approval Simulation:
```bash
npx tsx scripts/simulate-risk-escalation-approval.ts --approve
```

### Run Rejection Simulation:
```bash
npx tsx scripts/simulate-risk-escalation-approval.ts --reject
```

### Test Idempotency & Replay Protection:
```bash
# First run: Creates task and logs approval
npx tsx scripts/simulate-risk-escalation-approval.ts --key test-idemp-001 --approve

# Second run with same key: Detected as duplicate replay - skips creation safely
npx tsx scripts/simulate-risk-escalation-approval.ts --key test-idemp-001 --approve
```

---

## 2. Testing HTTP Endpoints via cURL / Postman

### Test Slash Commands:
```bash
curl -X POST http://localhost:3000/api/slack/commands \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "command=/project-risk&text="
```

### Test Help Guide:
```bash
curl -X POST http://localhost:3000/api/slack/commands \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "command=/impact-help&text="
```

### Test Interactivity Button Action (`action_escalate_risk`):
```bash
curl -X POST http://localhost:3000/api/slack/interactions \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode 'payload={"actions":[{"action_id":"action_escalate_risk","value":"risk_001"}],"user":{"name":"Elena Rostova","id":"U_EXEC_01"}}'
```

---

## 3. Live Slack Workspace Testing

1. Install the Slack App via [`SLACK_APP_MANIFEST.json`](./SLACK_APP_MANIFEST.json).
2. Set `SLACK_BOT_TOKEN` and `SLACK_SIGNING_SECRET` in `.env.local` or Vercel.
3. In any channel, execute:
   - `/impact-help` — View the Executive Watchtower menu
   - `/project-risk` — Surface the risk alert
   - Click `⚡ Escalate Risk` to execute the live escalation!
