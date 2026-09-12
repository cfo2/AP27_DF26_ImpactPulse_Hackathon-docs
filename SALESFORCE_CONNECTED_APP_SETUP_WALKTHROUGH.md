# Salesforce Connected App & OAuth 2.0 Configuration Walkthrough

> **Purpose:** A complete, click-by-click administrator and judge guide for configuring the **Salesforce Connected App / External Client App** to establish secure server-to-server and web-server OAuth integration with ImpactPulse.

---

## 1. Step-by-Step Connected App Creation in Salesforce

### Step 1: Navigate to App Manager
1. Log into your Salesforce Developer / Sandbox / Production Org as a **System Administrator**.
2. Click the **Gear Icon** (⚙️) in the top-right corner $\rightarrow$ Click **Setup**.
3. In the Quick Find search box on the left, type **App Manager** and select **App Manager** (under *Apps*).
4. Click the **New Connected App** button in the top right.

---

### Step 2: Basic Information
Fill in the application identification metadata:

| Field Name | Value | Notes |
|---|---|---|
| **Connected App Name** | `ImpactPulse Executive Command Center` | Display name in Salesforce App Launcher |
| **API Name** | `ImpactPulse_Executive_Command_Center` | Auto-populated |
| **Contact Email** | `admin@impactpulse.org` (or your developer email) | Required for Salesforce notifications |
| **Description** | `Workforce development command center connecting Slack, Supabase, and Salesforce standard objects for governed decision support.` | Optional but recommended |
| **Logo Image URL** | (Optional) | Can link to ImpactPulse logo |

---

### Step 3: Enable API (OAuth Settings)
1. Check the box for **Enable OAuth Settings**.
2. **Callback URL(s):** Enter both local development and production URLs (comma or newline separated):
   ```text
   https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/auth/salesforce/callback
   http://localhost:3000/api/auth/salesforce/callback
   ```
3. **Selected OAuth Scopes:** Add the following standard scopes from the left list to the right list:
   - `Manage user data via APIs (api)` — Allows querying standard objects (`Opportunity`, `Task`, `Account`) and creating `Task` records.
   - `Perform requests at any time (refresh_token, offline_access)` — Allows headless background operations without requiring constant human re-login.
   - `Access unique user identifiers (openid, id)` — For identity resolution.
   - `Manage user data via Web browsers (web)` — For Web Server Flow.
4. **Require Secret for Web Server Flow:** Ensure this is **Checked / Enabled**.
5. **Require Proof Key for Code Exchange (PKCE):** Recommended for public clients; optional for server-side Next.js.
6. Click **Save** $\rightarrow$ Click **Continue**.

> ⏳ **Important Note on Salesforce Replication:** Salesforce Connected Apps take **2 to 10 minutes** to replicate across all Salesforce edge servers after creation.

---

### Step 4: Retrieve Client ID (Consumer Key) & Client Secret
1. On the Connected App summary page, click **Manage Consumer Details**.
2. Complete the identity verification prompt (SMS or Authenticator Code).
3. Copy the following keys:
   - **Consumer Key:** This is your `SALESFORCE_CLIENT_ID`
   - **Consumer Secret:** This is your `SALESFORCE_CLIENT_SECRET`

---

### Step 5: Configure Connected App Policies (Crucial Step!)
1. In App Manager, find `ImpactPulse Executive Command Center` $\rightarrow$ Click the dropdown arrow on the right $\rightarrow$ Select **Manage**.
2. Click **Edit Policies**.
3. Under **OAuth Policies**:
   - **Permitted Users:** Select `All users may self-authorize` (for developer orgs) OR `Admin approved users are pre-authorized` (if assigning via Permission Sets).
   - **IP Relaxation:** Select `Relax IP restrictions` (to allow serverless Vercel Edge IPs to communicate seamlessly).
   - **Refresh Token Policy:** Select `Refresh token is valid until revoked`.
4. Click **Save**.

---

## 2. Environment Variables Configuration

Add the retrieved credentials to your `.env.local` or **Vercel Environment Variables Console**:

```bash
# ==========================================
# Salesforce Connected App Configuration
# ==========================================

# 1. Login endpoint (Use https://test.salesforce.com for Sandboxes / Scratch orgs)
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# 2. Consumer Key from Connected App
SALESFORCE_CLIENT_ID=3MVG9xxxxxxxxx...

# 3. Consumer Secret from Connected App
SALESFORCE_CLIENT_SECRET=9182374981723xxxxxxxxx...

# 4. Registered OAuth Callback URI
SALESFORCE_REDIRECT_URI=https://ap-27-df-26-impact-pulse-hack02.vercel.app/api/auth/salesforce/callback

# 5. Dual-Mode Switch (true = live REST API; false = high-fidelity mock fallback)
USE_LIVE_SALESFORCE=false
```

---

## 3. OAuth 2.0 Web Server Flow Architecture

```
[Browser / Admin] 
       | 
       | 1. Initiates Auth: GET /services/oauth2/authorize?client_id=...&redirect_uri=...
       v
[Salesforce Login & Consent Screen]
       | 
       | 2. User grants access; Salesforce redirects to Callback with ?code=AUTH_CODE
       v
[Next.js Server API: /api/auth/salesforce/callback]
       | 
       | 3. Exchanges code for tokens: POST /services/oauth2/token
       v
[Salesforce Token Service]
       | 
       | 4. Returns: { access_token, refresh_token, instance_url }
       v
[ImpactPulse Server / Client Session]
       | 
       | 5. Live SOQL Query & Standard Task Creation (POST /sobjects/Task)
       v
[Salesforce CRM Standard Objects Database]
```

---

## 4. Manual OAuth Token Verification via cURL

To manually test and verify your Connected App credentials directly from your terminal:

```bash
curl -X POST https://login.salesforce.com/services/oauth2/token \
  -d "grant_type=password" \
  -d "client_id=YOUR_CONSUMER_KEY" \
  -d "client_secret=YOUR_CONSUMER_SECRET" \
  -d "username=your_salesforce_username" \
  -d "password=your_salesforce_password_and_security_token"
```

**Expected Successful JSON Response:**
```json
{
  "access_token": "00D5e000000X...05T5e000000X...",
  "instance_url": "https://yourorg.my.salesforce.com",
  "id": "https://login.salesforce.com/id/00D5e000000X.../0055e000000X...",
  "token_type": "Bearer",
  "issued_at": "1789226702133",
  "signature": "..."
}
```

---

## 5. Troubleshooting & Common Salesforce Gotchas

| Issue / Error Code | Root Cause | Solution |
|---|---|---|
| `invalid_client_id` | Consumer Key has a typo or Connected App has not finished replicating. | Double-check Consumer Key and wait 5–10 minutes after app creation. |
| `redirect_uri_mismatch` | The URI in request does not match the Connected App settings. | Ensure exact URL match (including `https://` vs `http://` and trailing slashes). |
| `ip_restricted` | Salesforce Org enforces strict IP login ranges blocking Vercel serverless IPs. | Set **IP Relaxation** to `Relax IP restrictions` in Connected App Manage Policies. |
| `invalid_grant` | Password expired, security token missing, or user locked. | Append the Salesforce Security Token to the password (e.g. `PasswordSecretToken`). |
| `API_DISABLED_FOR_ORG` | Salesforce Edition does not allow REST API (e.g. Basic Edition). | Use Developer Edition, Enterprise, Unlimited, or Trailhead Scratch Orgs. |

---

## 6. Standard Object Security & Permission Matrix

Ensure the Salesforce integration user or profile has the following object-level permissions enabled:

| Object | Read | Create | Edit | Delete | Notes |
|---|:---:|:---:|:---:|:---:|---|
| **`Task`** | ✅ | ✅ | ✅ | ❌ | Required for Slack risk escalation action (`action_escalate_risk`). |
| **`Opportunity`** | ✅ | ❌ | ❌ | ❌ | Required for reading fundraising pipeline metrics. |
| **`Account`** | ✅ | ❌ | ❌ | ❌ | Required for reading donor & community partner organizations. |
| **`Contact`** | ✅ | ❌ | ❌ | ❌ | Required for mentor, coordinator, and learner identity context. |
| **`Campaign`** | ✅ | ❌ | ❌ | ❌ | Required for cohort roadmap associations. |
