# ImpactPulse — Official Slack App Manifest & Submission Reference

This document provides the final, production-ready **Slack App Manifest** configured for the **ImpactPulse Executive Watchtower** integration submitted to the Hackathon Judges.

---

## 📄 Raw Manifest Files Included in this Folder
1. **JSON Format:** [`SLACK_APP_MANIFEST.json`](./SLACK_APP_MANIFEST.json)
2. **YAML Format:** [`SLACK_APP_MANIFEST.yaml`](./SLACK_APP_MANIFEST.yaml)

---

## 📋 Full Manifest Specification (JSON)

```json
{
  "display_information": {
    "name": "ImpactPulse",
    "description": "Executive command center and risk escalation bot for workforce development nonprofits",
    "background_color": "#1e293b"
  },
  "features": {
    "bot_user": {
      "display_name": "ImpactPulse",
      "always_online": true
    },
    "slash_commands": [
      {
        "command": "/project-risk",
        "url": "https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/commands",
        "description": "Surface prioritized program risk alert with 1-click escalation button",
        "should_escape": false
      },
      {
        "command": "/escalate-risk",
        "url": "https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/commands",
        "description": "Trigger governed risk escalation workflow and generate Salesforce Task",
        "should_escape": false
      },
      {
        "command": "/board-brief",
        "url": "https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/commands",
        "description": "Generate Q1 2025 Executive Governance & Impact Brief draft for review",
        "should_escape": false
      },
      {
        "command": "/decision-queue",
        "url": "https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/commands",
        "description": "List all governance actions currently pending executive sign-off",
        "should_escape": false
      },
      {
        "command": "/impact-help",
        "url": "https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/commands",
        "description": "Display command guide and quick action menu for ImpactPulse Watchtower",
        "should_escape": false
      }
    ]
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "commands",
        "im:write",
        "im:history",
        "im:read",
        "users:read",
        "app_mentions:read"
      ]
    }
  },
  "settings": {
    "interactivity": {
      "is_enabled": true,
      "request_url": "https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/interactions"
    },
    "org_deploy_enabled": false,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

---

## 🛠️ Configuration Breakdown

### 1. Webhook Endpoints
- **Slash Commands URL:** `https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/commands`
  - Validates request HMAC-SHA256 signature using `SLACK_SIGNING_SECRET`.
  - Dispatches `/project-risk`, `/board-brief`, `/decision-queue`, and `/impact-help`.
- **Interactivity & Shortcuts Request URL:** `https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/slack/interactions`
  - Receives button actions (`action_escalate_risk`, `action_approve_brief`).
  - Triggers Salesforce Task creation and direct DMs to Sam (`U0C06KZRT6V`) and Anu (`U0C0Z3RAKQ8`).

### 2. Bot Token Permissions (OAuth Scopes)
| Scope | Purpose |
|---|---|
| `chat:write` | Post Block Kit cards into channels and threads |
| `commands` | Register slash commands (`/project-risk`, etc.) |
| `im:write` | Send direct messages to Sam (Executive Director) and Anu (Director Coordinator) |
| `im:history` / `im:read` | Read bot DM thread context for interactive approvals |
| `users:read` | Resolve Slack user display names for the Supabase governance audit trail |
| `app_mentions:read` | Listen for `@ImpactPulse` mentions in internal channels |

---

## 🚀 60-Second Import Steps for Judges

1. Open [https://api.slack.com/apps](https://api.slack.com/apps).
2. Click **Create New App** $\rightarrow$ Choose **From an app manifest**.
3. Select your target Slack workspace.
4. Copy and paste the JSON above (or upload [`SLACK_APP_MANIFEST.json`](./SLACK_APP_MANIFEST.json)).
5. Click **Create** $\rightarrow$ **Install to Workspace**.
