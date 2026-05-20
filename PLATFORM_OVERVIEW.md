# NextGenOutreach — Full Platform Overview
> Last updated: May 2026 · Version 1.0

Use this document to verify the platform is working end-to-end. Work through each section top-to-bottom.

---

## 1. Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                         nextgenoutreach.co.za                   │
│                      (Vercel — Next.js 15)                      │
│                                                                 │
│  /login  /dashboard  /marketplace  /dashboard/documents  ...   │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS REST + WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              nextgenoutreachapi-production.up.railway.app        │
│                   (Railway — Express.js + Node 20)              │
│                                                                 │
│  /api/v1/*  ← auth, campaigns, CRM, docs, admin, sockets ...   │
└────────┬────────────────────────────────┬───────────────────────┘
         │                                │
         ▼                                ▼
┌────────────────┐              ┌─────────────────────┐
│  PostgreSQL DB │              │  Google Drive API   │
│  (Railway)     │              │  (optional — Docs)  │
└────────────────┘              └─────────────────────┘
         │
         ▼
┌────────────────┐
│  Firebase Auth │  ← identity + role claims
└────────────────┘
```

### Services
| Service | Provider | URL |
|---------|----------|-----|
| **Frontend** | Vercel | `https://nextgenoutreach.co.za` |
| **API** | Railway | `https://nextgenoutreachapi-production.up.railway.app` |
| **Database** | Railway PostgreSQL | Via `DATABASE_URL` env var |
| **Auth** | Firebase | Configured via `FIREBASE_SERVICE_ACCOUNT` env var |
| **Email** | SendGrid | Domain `nextgenoutreach.co.za` verified |
| **Documents** | Google Drive | Optional — needs `GOOGLE_SERVICE_ACCOUNT_JSON` |

---

## 2. Monorepo Structure

```
nextgen-dashboard/
├── apps/
│   ├── api/                 ← Express API (Railway)
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── config/environment.ts
│   │       ├── lib/
│   │       │   ├── database.ts        (Prisma client)
│   │       │   ├── googleDrive.ts     (Drive service)
│   │       │   ├── redis-fallback.ts  (in-memory Redis fallback)
│   │       │   └── logger.ts
│   │       ├── middleware/
│   │       │   └── firebaseAuth.middleware.ts
│   │       └── routes/            (see Section 4)
│   └── web/                 ← Next.js 15 frontend (Vercel)
│       └── src/app/
│           ├── dashboard/         (see Section 6)
│           ├── login/
│           └── marketplace/
├── packages/
│   ├── types/               ← Shared TypeScript types
│   └── validators/          ← Shared Zod schemas
└── nixpacks.toml            ← Railway build config
```

---

## 3. Environment Variables

### Railway (API)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | ✅ Required | PostgreSQL connection string |
| `FIREBASE_SERVICE_ACCOUNT` | ✅ Prod | JSON string of Firebase service account |
| `JWT_SECRET` | ⚠️ Recommended | Min 32 chars; falls back to insecure default |
| `JWT_REFRESH_SECRET` | ⚠️ Recommended | Min 32 chars; falls back to insecure default |
| `SESSION_SECRET` | ⚠️ Recommended | Falls back to insecure default |
| `CORS_ORIGIN` | ✅ Set | Comma-separated allowed origins |
| `NODE_ENV` | ✅ Set | `production` |
| `PORT` | Auto | Railway sets this; default `3001` |
| `SENDGRID_API_KEY` | Optional | Email sending; degrades without it |
| `FROM_EMAIL` | Optional | e.g. `noreply@nextgenoutreach.co.za` |
| `REDIS_URL` | Optional | Falls back to in-memory store |
| `AWS_ACCESS_KEY_ID` | Optional | S3 file uploads |
| `AWS_SECRET_ACCESS_KEY` | Optional | S3 file uploads |
| `AWS_REGION` | Optional | Default `us-east-1` |
| `AWS_S3_BUCKET` | Optional | S3 bucket name |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Optional | Enables Google Drive auto-doc creation |
| `PAYFAST_MERCHANT_ID` | Optional | PayFast billing |
| `PAYFAST_MERCHANT_KEY` | Optional | PayFast billing |
| `PAYFAST_PASSPHRASE` | Optional | PayFast billing |
| `PAYFAST_MODE` | Optional | `test` or `live` |
| `GOLOGIN_API_TOKEN` | Optional | GoLogin browser profiles |
| `BIT_BROWSER_API_URL` | Optional | BitBrowser API |
| `BIT_BROWSER_API_KEY` | Optional | BitBrowser API |
| `BROWSER_PROVIDER` | Optional | `gologin` / `bitbrowser` / `adspower` |

### Vercel (Frontend)

| Variable | Required | Notes |
|----------|----------|-------|
| `NEXT_PUBLIC_API_URL` | ✅ Required | `https://nextgenoutreachapi-production.up.railway.app` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ Required | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ Required | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ Required | Firebase web config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Optional | Firebase Storage |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Optional | Firebase Messaging |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ Required | Firebase web config |

---

## 4. API Routes

All routes live under `https://nextgenoutreachapi-production.up.railway.app/api/v1/`

### Authentication
Every protected route requires:
```
Authorization: Bearer <Firebase ID Token>
```

### Complete Route Map

| Method | Path | Auth | Role | Description |
|--------|------|------|------|-------------|
| `GET` | `/health` | None | Any | API + DB health status |
| `GET` | `/health/detailed` | None | Any | Full diagnostics |
| `GET` | `/health/ready` | None | Any | Readiness probe |
| `GET` | `/health/live` | None | Any | Liveness probe |
| `POST` | `/auth/sync-claims` | Firebase | Any | Sync DB role to Firebase token |
| `GET` | `/reps` | None | Public | Browse rep marketplace |
| `GET` | `/reps/:id` | None | Public | Single rep profile |
| `GET` | `/campaigns` | ✅ | All | List campaigns (scoped by role) |
| `POST` | `/campaigns` | ✅ | Client | Create campaign |
| `PATCH` | `/campaigns/:id/status` | ✅ | Admin | Update campaign status |
| `GET` | `/analytics/overview` | ✅ | Client | Campaign analytics |
| `GET` | `/prospects` | ✅ | All | List prospects |
| `POST` | `/prospects` | ✅ | Rep/Admin | Create prospect |
| `PATCH` | `/prospects/:id` | ✅ | Rep/Admin | Update prospect |
| `GET` | `/crm/leads` | ✅ | Admin | CRM lead list |
| `POST` | `/crm/leads` | ✅ | Admin | Create CRM lead |
| `PATCH` | `/crm/leads/:id` | ✅ | Admin | Update lead stage |
| `GET` | `/tasks` | ✅ | All | Tasks (scoped by role) |
| `POST` | `/tasks` | ✅ | Admin | Create task |
| `PATCH` | `/tasks/:id` | ✅ | Any | Update task |
| `GET` | `/rep/tasks` | ✅ | Rep | Rep assigned tasks |
| `GET` | `/rep/earnings` | ✅ | Rep | Rep earnings |
| `GET` | `/rep/profile` | ✅ | Rep | Rep profile |
| `PATCH` | `/rep/profile` | ✅ | Rep | Update rep profile |
| `POST` | `/rep/upload-id` | ✅ | Rep | Upload ID document |
| `POST` | `/rep/sync-crm` | ✅ | Rep | Sync to CRM |
| `GET` | `/browser-profiles` | ✅ | Admin | Browser profiles list |
| `POST` | `/browser-profiles` | ✅ | Admin | Create browser profile |
| `DELETE` | `/browser-profiles/:id` | ✅ | Admin | Delete profile |
| `POST` | `/browser-profiles/:id/launch` | ✅ | Admin | Launch browser session |
| `GET` | `/proxies` | ✅ | Admin | Proxy pool |
| `POST` | `/proxies` | ✅ | Admin | Add proxy |
| `DELETE` | `/proxies/:id` | ✅ | Admin | Remove proxy |
| `GET` | `/activity-log` | ✅ | Admin | Rep activity log |
| `POST` | `/activity-log` | ✅ | Rep | Log rep action |
| `GET` | `/outreach-queue` | ✅ | Rep/Admin | Day 1/4/8 sequence queue |
| `POST` | `/outreach-queue/:id/advance` | ✅ | Rep | Advance sequence step |
| `GET` | `/linkedin-health` | ✅ | Rep/Admin | LinkedIn health scores |
| `GET` | `/comms/threads` | ✅ | All | Message threads |
| `POST` | `/comms/threads` | ✅ | All | Create thread |
| `POST` | `/comms/threads/:id/messages` | ✅ | All | Send message |
| `GET` | `/gamification/leaderboard` | ✅ | All | Rep leaderboard |
| `GET` | `/gamification/badges` | ✅ | Rep | Rep badges |
| `GET` | `/daily-report` | ✅ | Rep | Daily report |
| `POST` | `/daily-report` | ✅ | Rep | Submit daily report |
| `GET` | `/documents` | ✅ | All | Document vault list |
| `POST` | `/documents` | ✅ | All | Upload/link document |
| `DELETE` | `/documents/:id` | ✅ | Owner/Admin | Delete document |
| `GET` | `/documents/drive-status` | ✅ | All | Google Drive config status |
| `GET` | `/documents/leads` | ✅ | All | B2B CRM leads |
| `POST` | `/documents/leads` | ✅ | All | Create B2B lead + Drive Doc |
| `POST` | `/documents/leads/bulk` | ✅ | All | CSV bulk import |
| `DELETE` | `/documents/leads/:id` | ✅ | Admin | Delete B2B lead |
| `GET` | `/admin/users` | ✅ | Admin | All users |
| `PATCH` | `/admin/users/:id/status` | ✅ | Admin | Approve/suspend user |
| `PATCH` | `/admin/users/:id/role` | ✅ | Admin | Change role |
| `PATCH` | `/admin/users/:id/verify-id` | ✅ | Admin | Verify rep ID |
| `GET` | `/admin/stats` | ✅ | Admin | Platform stats |
| `GET` | `/admin/activity` | ✅ | Admin | Recent activity |
| `GET` | `/admin/leads` | ✅ | Admin | Campaign activity leads |
| `GET` | `/admin/reps` | ✅ | Admin | All reps + stats |
| `GET` | `/admin/earnings` | ✅ | Admin | All earnings |
| `PATCH` | `/admin/earnings/:id/pay` | ✅ | Admin | Mark earning paid |
| `GET` | `/admin/alerts` | ✅ | Admin | Campaign red alerts |
| `POST` | `/webhooks/payfast` | None | - | PayFast payment webhook |
| `GET` | `/billing/plans` | ✅ | All | Available plans |
| `POST` | `/billing/subscribe` | ✅ | Client | Start subscription |
| `GET` | `/clients/profile` | ✅ | Client | Client profile |
| `PATCH` | `/clients/profile` | ✅ | Client | Update client profile |

---

## 5. Database Models (Prisma)

All models live in PostgreSQL on Railway. Run `prisma migrate deploy` on start.

### Core Models
| Model | Table | Purpose |
|-------|-------|---------|
| `User` | `users` | Auth identity — all roles |
| `RepProfile` | `rep_profiles` | Rep details, LinkedIn stats, tier |
| `ClientProfile` | `client_profiles` | Client company info, plan |
| `Campaign` | `campaigns` | LinkedIn outreach campaigns |
| `CampaignActivity` | `campaign_activities` | Individual actions within campaigns |
| `Prospect` | `prospects` | LinkedIn contacts in campaigns |
| `Lead` | `leads` | B2B CRM pipeline contacts |
| `CRMActivity` | `crm_activities` | Activity log for leads/prospects |
| `Deal` | `deals` | Won deal records |

### Infrastructure Models
| Model | Table | Purpose |
|-------|-------|---------|
| `BrowserProfile` | `browser_profiles` | GoLogin/BitBrowser/AdsPower profiles |
| `Proxy` | `proxies` | Proxy pool for browser sessions |
| `BrowserSession` | `browser_sessions` | Active sessions |
| `ActivityLog` | `activity_logs` | Rep action log (feeds daily report) |
| `OutreachSequence` | `outreach_sequences` | Day 1/4/8 follow-up tracking |
| `LinkedInHealthScore` | `linkedin_health_scores` | 0–100 account health |
| `DailyReport` | `daily_reports` | Rep end-of-day report |

### Finance Models
| Model | Table | Purpose |
|-------|-------|---------|
| `Subscription` | `subscriptions` | Client plan billing |
| `Payment` | `payments` | Payment records |
| `RepEarning` | `rep_earnings` | Rep payout tracking |
| `Invoice` | `invoices` | Client invoice records |

### Communication Models
| Model | Table | Purpose |
|-------|-------|---------|
| `MessageThread` | `message_threads` | DM / campaign channel threads |
| `ThreadParticipant` | `thread_participants` | Thread members |
| `InternalMessage` | `internal_messages` | Messages within threads |
| `Notification` | `notifications` | In-app notifications |

### Misc Models
| Model | Table | Purpose |
|-------|-------|---------|
| `Task` | `tasks` | Internal task management |
| `TaskComment` | `task_comments` | Task discussion |
| `TaskAuditLog` | `task_audit_logs` | Task change history |
| `AuditLog` | `audit_log` | Global audit trail |
| `TrainingModule` | `training_modules` | Rep training content |
| `RepTraining` | `rep_training` | Rep training progress |
| `Badge` | `badges` | Gamification badge types |
| `RepBadge` | `rep_badges` | Badges awarded to reps |
| `SystemSetting` | `system_settings` | Key-value platform settings |
| `Document` | `documents` | Document Vault files + Drive links |

### Enums
`UserRole` · `UserStatus` · `RepTier` · `CampaignStatus` · `CampaignType` · `ActivityType` · `PipelineStage` · `ConnectionStatus` · `MessageStatus` · `Sentiment` · `Severity` · `Priority` · `TaskStatus` · `Plan` · `BrowserProvider` · `SessionStatus` · `ProxyStatus` · `SequenceStep` · `SequenceStatus` · `MessageType` · `DocumentType`

---

## 6. Frontend Pages (Next.js)

### Public
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Firebase email/Google sign-in |
| `/marketplace` | Browse available reps |

### Dashboard — All Roles
| Route | Description |
|-------|-------------|
| `/dashboard` | Role redirect gateway |
| `/dashboard/comms` | Internal messaging hub |
| `/dashboard/missions` | Missions / goals view |
| `/dashboard/agents` | Agents overview |
| `/dashboard/documents` | **Document Vault + B2B CRM** (new) |
| `/dashboard/vault` | Identity vault (reps) / Prospect Intelligence (admin) |

### Dashboard — Client Role
| Route | Description |
|-------|-------------|
| `/dashboard/client/overview` | Campaign stats |
| `/dashboard/client/campaigns` | Manage campaigns |
| `/dashboard/client/prospects` | Prospect feed |
| `/dashboard/client/roi` | ROI calculator |
| `/dashboard/client/message-ab` | A/B message testing |
| `/dashboard/client/marketplace` | Find/hire reps |
| `/dashboard/client/profile` | Client profile + billing |

### Dashboard — Rep Role
| Route | Description |
|-------|-------------|
| `/dashboard/rep/overview` | Rep stats |
| `/dashboard/rep/workspace` | Daily command centre |
| `/dashboard/rep/daily-report` | Intelligent daily report |
| `/dashboard/rep/tasks` | Assigned tasks |
| `/dashboard/rep/earnings` | Earnings history |
| `/dashboard/rep/profile` | Rep profile settings |

### Dashboard — Admin / Super Admin Role
| Route | Description |
|-------|-------------|
| `/dashboard/admin/overview` | Platform-wide stats |
| `/dashboard/admin/users` | User management |
| `/dashboard/admin/browser-profiles` | Browser profile management |
| `/dashboard/admin/proxies` | Proxy pool management |
| `/dashboard/admin/leaderboard` | Rep leaderboard + LinkedIn health |
| `/dashboard/admin/earnings` | All rep payouts |

---

## 7. Document Vault + B2B CRM (New Feature)

### How it works

1. **Create a contact** via the CRM Leads tab
2. If `GOOGLE_SERVICE_ACCOUNT_JSON` is configured on Railway, a Google Doc is auto-created and linked to the contact
3. Documents can be uploaded or linked manually via the Documents tab
4. CSV bulk import creates multiple contacts at once (up to 200 rows)

### Google Drive Setup
To enable auto-doc creation:
1. Create a Google Cloud project
2. Enable the **Google Drive API**
3. Create a **Service Account** and download the JSON key
4. Add the JSON (single-line) as `GOOGLE_SERVICE_ACCOUNT_JSON` in Railway
5. The status badge on the Documents page will turn green

### Without Google Drive
The feature still works — contacts are stored in PostgreSQL and Drive columns stay `null`.

---

## 8. Deployment Flow

### Railway (API)
Triggered by push to `main` branch. Build config is in `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = [
  "npm run build --workspace=packages/types || echo 'types build skipped'",
  "npm run build --workspace=packages/validators || echo 'validators build skipped'",
  "cd apps/api && npx prisma generate",
  "npm run build --workspace=apps/api"
]

[start]
cmd = "cd apps/api && npx prisma migrate deploy && node dist/server.js"
```

**Prisma migrations are auto-applied on every start.**

### Vercel (Frontend)
- Root directory: `apps/web`
- Build command: `npm run build`
- Output: `.next`
- Triggered by push to `main` branch

---

## 9. Authentication Flow

```
User enters email+password
        │
        ▼
Firebase Auth (client-side)
  → returns Firebase ID Token (JWT)
        │
        ▼
POST /api/v1/auth/sync-claims
  → API verifies token with Firebase Admin SDK
  → Looks up user role in PostgreSQL
  → Sets Firebase custom claims { role: "admin" }
        │
        ▼
All subsequent API calls include:
  Authorization: Bearer <Firebase ID Token>
        │
        ▼
firebaseAuth.middleware.ts verifies token,
attaches req.user = { uid, email, role }
```

### Role Hierarchy
```
super_admin > admin > client > rep
```

---

## 10. Real-time (WebSocket)

Socket.IO runs on the same Railway server (port 3001).

```javascript
// Client connects
const socket = io('https://nextgenoutreachapi-production.up.railway.app', {
  auth: { token: '<Firebase ID Token>' }
});

// Join campaign room to get live updates
socket.emit('join_campaign', 'campaign_id');

// Receive new activity events
socket.on('new_lead', (data) => { /* { type, prospectName, campaignId, timestamp } */ });

// Leave room
socket.emit('leave_campaign', 'campaign_id');
```

---

## 11. Health Check

Quick verification:
```
GET https://nextgenoutreachapi-production.up.railway.app/api/v1/health
```

Expected response when healthy:
```json
{
  "status": "healthy",
  "services": {
    "database": { "status": "healthy" },
    "redis": { "status": "not_configured" },
    "memory": { "status": "healthy" },
    "cpu": { "status": "healthy" },
    "disk": { "status": "healthy" }
  }
}
```

`redis: not_configured` is **expected** and normal — the API uses in-memory fallback.

---

## 12. Known Pending Items

| Item | Priority | Notes |
|------|----------|-------|
| `JWT_SECRET` set on Railway | 🔴 High | Currently using insecure fallback |
| `SESSION_SECRET` set on Railway | 🔴 High | Currently using insecure fallback |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | 🟡 Medium | Optional — needed for Drive auto-docs |
| PayFast live mode | 🟡 Medium | Currently in `test` mode |
| Redis instance | 🟢 Low | Optional; in-memory fallback works fine |
| S3 bucket | 🟢 Low | Optional; needed for direct file uploads |

---

## 13. Quick Test Checklist

Go through these in order to confirm the platform is working:

- [ ] `GET /api/v1/health` returns `status: "healthy"`
- [ ] Login at `https://nextgenoutreach.co.za/login` works
- [ ] Firebase token is obtained and `sync-claims` succeeds
- [ ] Admin can view `/dashboard/admin/overview`
- [ ] Rep can view `/dashboard/rep/workspace`
- [ ] Client can view `/dashboard/client/overview`
- [ ] Marketplace at `/marketplace` shows reps
- [ ] `/dashboard/documents` loads with correct Drive status badge
- [ ] Creating a contact on Documents page saves to DB
- [ ] Comms (`/dashboard/comms`) loads thread list
- [ ] `POST /api/v1/documents/leads` creates a lead record in DB
- [ ] Vercel build passes (check Vercel dashboard)
- [ ] Railway deployment succeeds with `prisma migrate deploy`

---

*For API endpoint details and request/response schemas see `API_REFERENCE.md`*
