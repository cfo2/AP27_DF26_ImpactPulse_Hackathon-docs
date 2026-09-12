# ImpactPulse — Salesforce CRM Integration & Connectivity Architecture

This guide details the **Salesforce CRM connectivity architecture, Connected App setup, Standard Object data model, and Slack-to-Salesforce sync mechanisms** powering ImpactPulse.

---

## 1. Architectural Role of Salesforce in ImpactPulse

ImpactPulse leverages **Salesforce standard CRM objects exclusively** to maintain clean architectural alignment with nonprofit tech ecosystems without requiring custom packages:

```
+-------------------+       +-----------------------+       +------------------------+
|    SLACK BOT      | ----> |  NEXT.JS API SERVER   | ----> |     SALESFORCE CRM     |
| [⚡ Escalate Risk]|       |  /api/slack/interact  |       | (Standard Objects Only)|
+-------------------+       +-----------------------+       +------------------------+
                                       |                                 |
                                       | POST /sobjects/Task             v
                                       +-------------------------> • Task (Standard)
                                                                   • Opportunity (Pipeline)
                                                                   • Account (Donors/Corps)
                                                                   • Contact (Mentors/Staff)
                                                                   • Campaign (Cohorts)
```

---

## 2. Standard Object Schema & Field Mapping

| Salesforce Object | Standard Field | Type | How ImpactPulse Uses It |
|---|---|---|---|
| **`Task`** | `Subject` | String | Created upon Slack risk escalation (`"Urgent: Reallocate 3 mentors for Salesforce Career Foundations cohort"`). |
| | `Priority` | Picklist | Set to `"High"` for critical cohort risks; `"Normal"` for general board briefs. |
| | `Status` | Picklist | Initialized as `"Not Started"` or `"In Progress"`. |
| | `OwnerId` | ID | Assigned to Executive Director Sam (`U0C06KZRT6V`). |
| | `Description` | Text Area | Full audit summary containing Approver Name, Slack Timestamp, Evidence metrics (42% completion rate, 18 stalled learners), and Impact ID (`ESC-2025-SF-01`). |
| **`Opportunity`** | `Amount`, `StageName` | Currency / Picklist | Aggregated to power the Executive Dashboard fundraising pipeline ($360k raised, $115k late-stage pipeline). |
| **`Campaign`** | `Name`, `Status` | String / Picklist | Represents active learning cohort programs. |
| **`Contact`** | `Name`, `Title`, `Email` | String | Represents mentors, program managers, and executive leaders. |

---

## 3. Connected App / OAuth Configuration

To connect ImpactPulse to a Salesforce Developer or Production Org:

### 1. Connected App Settings (Salesforce Setup $\rightarrow$ App Manager):
* **Connected App Name:** `ImpactPulse Executive Command Center`
* **Callback URL:** `https://<YOUR-APP>.vercel.app/api/auth/salesforce/callback`
* **Selected OAuth Scopes:**
  * `Manage user data via APIs (api)`
  * `Perform requests at any time (refresh_token, offline_access)`
* **Require Secret for Web Server Flow:** `Enabled`

### 2. Environment Variables Configuration:
```bash
# Salesforce Connectivity
SALESFORCE_LOGIN_URL=https://login.salesforce.com
SALESFORCE_CLIENT_ID=3MVG9...your_client_id
SALESFORCE_CLIENT_SECRET=your_client_secret
SALESFORCE_REDIRECT_URI=https://<YOUR-APP>.vercel.app/api/auth/salesforce/callback

# Live vs Mock Toggle
USE_LIVE_SALESFORCE=false # Set to true when live Salesforce credentials are provided
```

---

## 4. Live REST API Client Implementation

Located at [`salesforce/client.ts`](./salesforce/client.ts):

* **Dual-Mode Graceful Fallback:** When `USE_LIVE_SALESFORCE=false` or credentials are unset, the client transparently returns high-fidelity mock metrics and mock Task IDs (`mock-task-1789226702133`), guaranteeing that the hackathon demo never crashes or gets blocked by network/login timeouts.
* **Live Task Creation:** When live mode is active, the client dispatches:
  ```http
  POST /services/data/v59.0/sobjects/Task
  Authorization: Bearer <ACCESS_TOKEN>
  Content-Type: application/json

  {
    "Subject": "Escalate Salesforce Career Foundations mentor-capacity risk",
    "Priority": "High",
    "Status": "Not Started",
    "Description": "Approved via ImpactPulse Slack Governance Workflow..."
  }
  ```

---

## 5. SOQL Queries Used in ImpactPulse

### Fetch High-Priority Operational Tasks:
```sql
SELECT Id, Subject, Priority, Status, ActivityDate, Description, Owner.Name
FROM Task
WHERE Priority = 'High' AND Status != 'Completed'
ORDER BY ActivityDate ASC
LIMIT 10
```

### Fetch Executive Pipeline Opportunities:
```sql
SELECT Id, Name, Amount, StageName, CloseDate, Account.Name
FROM Opportunity
WHERE IsClosed = false AND StageName IN ('Proposal/Price Quote', 'Negotiation/Review')
ORDER BY Amount DESC
LIMIT 5
```
