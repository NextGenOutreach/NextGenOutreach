# NextGenOutreach API Reference

## Base URL
- Development: `http://localhost:3001`
- Production: `https://api.nextgenoutreach.co.za` (when deployed)

## Authentication
Most endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <Firebase ID Token>
```

Get token from Firebase client:
```javascript
const token = await user.getIdToken();
```

## Response Format

### Success (2xx)
```json
{
  "success": true,
  "data": {},
  "meta": {
    "page": 1,
    "total": 100,
    "perPage": 20
  }
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Descriptive error message",
    "statusCode": 400
  }
}
```

---

## 🔓 PUBLIC ENDPOINTS (No Auth)

### Auth

#### POST /api/v1/auth/sync-claims
Sync Firebase token claims with database role information.

**Headers:**
```
Authorization: Bearer <Firebase ID Token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "client"  // optional: hint for default role
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "client",
    "_dbEmail": "user@example.com",
    "_tokenEmail": "user@example.com"
  }
}
```

### Reps / Marketplace

#### GET /api/v1/reps
List available reps with filtering and pagination.

**Query Parameters:**
```
industry=software      // optional: filter by industry
country=South Africa   // optional: filter by country
minFollowers=1000      // optional: minimum LinkedIn followers
maxFollowers=100000    // optional: maximum LinkedIn followers
sort=rating            // optional: 'rating' or 'followers'
page=1                 // optional: pagination
limit=20               // optional: results per page
clientPreferences={}   // optional: JSON string for matching scores
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rep_123",
      "linkedinUrl": "https://linkedin.com/in/user",
      "linkedinFollowers": 5000,
      "industry": "Software",
      "locationCountry": "South Africa",
      "locationCity": "Johannesburg",
      "bio": "LinkedIn SDR with 5 years experience",
      "rating": 4.8,
      "totalReviews": 42,
      "availabilityStatus": "available",
      "maxClients": 3,
      "hourlyRateUsd": 45,
      "matchScore": 0.92  // if clientPreferences provided
    }
  ],
  "meta": {
    "page": 1,
    "total": 156,
    "perPage": 20
  }
}
```

#### GET /api/v1/reps/:id
Get detailed rep profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rep_123",
    "linkedinUrl": "https://linkedin.com/in/user",
    "linkedinFollowers": 5000,
    "industry": "Software",
    "bio": "...",
    "rating": 4.8,
    "totalReviews": 42,
    "availabilityStatus": "available",
    "maxClients": 3,
    "hourlyRateUsd": 45,
    "createdAt": "2026-05-01T10:00:00Z"
  }
}
```

---

## 🔒 PROTECTED ENDPOINTS (Auth Required)

### Campaigns

#### GET /api/v1/campaigns
List campaigns (scoped to user role).

**Query Parameters:**
```
status=active     // optional: DRAFT, PENDING_MATCH, ACTIVE, PAUSED, COMPLETED, CANCELLED
page=1            // optional
limit=20          // optional
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "camp_123",
      "name": "Q2 Outreach Campaign",
      "status": "ACTIVE",
      "type": "CONNECTIONS",
      "dailyLimit": 40,
      "startDate": "2026-05-01T00:00:00Z",
      "endDate": null,
      "notes": "Target tech companies",
      "createdAt": "2026-04-20T10:00:00Z",
      "rep": {
        "id": "rep_456",
        "industry": "Software",
        "rating": "4.8",
        "linkedinFollowers": 5000
      },
      "_count": {
        "activities": 245
      }
    }
  ],
  "meta": {
    "page": 1,
    "total": 5,
    "perPage": 20
  }
}
```

#### POST /api/v1/campaigns
Create new campaign (clients only).

**Request Body:**
```json
{
  "name": "New Campaign",
  "type": "CONNECTIONS",
  "dailyLimit": 50,
  "targetIcp": {
    "industry": "Software",
    "country": "USA"
  },
  "notes": "Optional notes"
}
```

**Response:** Campaign object (201 Created)

#### PATCH /api/v1/campaigns/:id/status
Update campaign status.

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Valid Statuses:** DRAFT, PENDING_MATCH, ACTIVE, PAUSED, COMPLETED, CANCELLED

**Response:** Updated campaign object

### Analytics

#### GET /api/v1/analytics/overview
Get client analytics overview (clients only).

**Response:**
```json
{
  "success": true,
  "data": {
    "activeCampaigns": 3,
    "connectionsSent": 1250,
    "meetingsBooked": 45,
    "pipelineValue": 0
  }
}
```

### Rep Dashboard

#### GET /api/v1/rep/tasks
Get rep's assigned tasks (reps only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_123",
      "campaignId": "camp_456",
      "campaignName": "Q2 Outreach",
      "clientName": "Acme Corp",
      "type": "connections",
      "status": "active",
      "dailyLimit": 40,
      "completedCount": 235,
      "prospectCount": 40,
      "startDate": "2026-05-01T00:00:00Z",
      "endDate": null,
      "notes": "Focus on CTOs",
      "technicalStatus": "RUNNING"
    }
  ]
}
```

#### GET /api/v1/rep/earnings
Get rep earnings and monthly summary (reps only).

**Query Parameters:**
```
status=pending  // optional: pending, paid, disputed
```

**Response:**
```json
{
  "success": true,
  "data": {
    "earnings": [
      {
        "id": "earn_123",
        "campaignId": "camp_456",
        "campaignName": "Q2 Outreach",
        "clientName": "Acme Corp",
        "amount": 500,
        "currency": "USD",
        "periodStart": "2026-05-01T00:00:00Z",
        "periodEnd": "2026-05-31T23:59:59Z",
        "status": "pending",
        "paidAt": null,
        "notes": "Performance bonus included"
      }
    ],
    "monthly": [
      {
        "month": "2026-05",
        "earnings": 1500,
        "campaigns": 2
      }
    ]
  }
}
```

### Admin

#### GET /api/v1/admin/users
List all users with filtering (admin only).

**Query Parameters:**
```
role=client      // optional: CLIENT, REP, ADMIN, SUPER_ADMIN
status=active    // optional: PENDING, ACTIVE, SUSPENDED, BANNED
search=john      // optional: email search
page=1           // optional
limit=30         // optional
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "client@example.com",
      "role": "CLIENT",
      "status": "ACTIVE",
      "twoFaEnabled": false,
      "createdAt": "2026-04-15T10:00:00Z",
      "clientProfile": {
        "id": "cp_123",
        "companyName": "Acme Corp",
        "plan": "PROFESSIONAL",
        "planStatus": "active"
      },
      "repProfile": null
    }
  ],
  "meta": {
    "page": 1,
    "total": 245,
    "perPage": 30
  }
}
```

#### GET /api/v1/admin/stats
Get platform statistics (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 156,
    "totalReps": 42,
    "totalClients": 89,
    "activeCampaigns": 23,
    "totalRevenue": 45000
  }
}
```

#### GET /api/v1/admin/activity
Get recent platform activity (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "user_registered",
      "label": "New client registered: john@example.com",
      "time": "2026-05-17T14:30:00Z"
    },
    {
      "type": "campaign",
      "label": "Campaign active: Q2 Outreach",
      "time": "2026-05-17T14:25:00Z"
    }
  ]
}
```

#### GET /api/v1/admin/leads
Get campaign activities as leads (admin only).

**Query Parameters:**
```
type=CONNECTION_SENT   // optional: filter by activity type
page=1                 // optional
limit=30               // optional
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "lead_123",
      "activityType": "CONNECTION_SENT",
      "prospectName": "John Doe",
      "prospectUrl": "https://linkedin.com/in/johndoe",
      "notes": "Tech lead at startup",
      "occurredAt": "2026-05-17T14:20:00Z",
      "campaign": {
        "id": "camp_456",
        "name": "Q2 Outreach",
        "rep": {
          "id": "rep_789",
          "industry": "Software",
          "user": {
            "email": "rep@example.com"
          }
        }
      }
    }
  ],
  "meta": {
    "page": 1,
    "total": 5234,
    "perPage": 30
  }
}
```

#### GET /api/v1/admin/reps
Get all reps with performance stats (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rep_123",
      "linkedinUrl": "https://linkedin.com/in/user",
      "industry": "Software",
      "availabilityStatus": "available",
      "idVerified": true,
      "rating": "4.8",
      "linkedinFollowers": 5000,
      "user": {
        "email": "rep@example.com",
        "status": "ACTIVE",
        "createdAt": "2026-04-01T10:00:00Z"
      },
      "_count": {
        "campaigns": 5,
        "earnings": 12
      },
      "stats": {
        "connectionsSent": 1250,
        "acceptanceRate": 35,
        "meetingsBooked": 45
      }
    }
  ]
}
```

#### GET /api/v1/admin/earnings
Get all earnings records (admin only).

**Query Parameters:**
```
status=pending  // optional: pending, paid
page=1         // optional
limit=50       // optional
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "earn_123",
      "amountUsd": 500,
      "periodStart": "2026-05-01T00:00:00Z",
      "periodEnd": "2026-05-31T23:59:59Z",
      "status": "pending",
      "createdAt": "2026-05-17T10:00:00Z",
      "rep": {
        "id": "rep_456",
        "user": {
          "email": "rep@example.com"
        }
      },
      "client": {
        "id": "client_789",
        "companyName": "Acme Corp"
      },
      "campaign": {
        "id": "camp_111",
        "name": "Q2 Outreach"
      }
    }
  ],
  "meta": {
    "page": 1,
    "total": 342,
    "perPage": 50
  }
}
```

#### GET /api/v1/admin/alerts
Get red alerts for inactive campaigns (admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "campaignId": "camp_123",
      "campaignName": "Q2 Outreach",
      "lastActivity": "2026-05-15T10:00:00Z",
      "issue": "NO_ACTIVITY_24H"
    }
  ]
}
```

#### PATCH /api/v1/admin/users/:id/status
Update user status (admin only).

**Request Body:**
```json
{
  "status": "ACTIVE"
}
```

**Valid Statuses:** PENDING, ACTIVE, SUSPENDED, BANNED

**Response:** Updated user object

#### PATCH /api/v1/admin/users/:id/role
Change user role (admin only).

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

**Valid Roles:** CLIENT, REP, ADMIN, SUPER_ADMIN

**Response:** Updated user object

#### PATCH /api/v1/admin/users/:id/verify-id
Verify rep ID (admin only).

**Request Body:**
```json
{
  "verified": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rep_123",
    "idVerified": true,
    "idVerifiedAt": "2026-05-17T14:35:00Z"
  }
}
```

#### PATCH /api/v1/admin/earnings/:id/pay
Mark earning as paid (admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "earn_123",
    "status": "paid",
    "paidAt": "2026-05-17T14:40:00Z"
  }
}
```

---

## 🔧 Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| VALIDATION_ERROR | 400 | Invalid input parameters |
| UNAUTHORIZED | 401 | Missing or invalid authentication |
| FORBIDDEN | 403 | Authenticated but not authorized |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Server error |

---

## 📝 Rate Limiting

- General: 100 requests per 15 minutes per IP
- Auth endpoints: 5 failed attempts → 15 minute lockout
- Admin endpoints: 200 requests per 15 minutes per IP

---

## 🔌 WebSocket Events

### Establish Connection
```javascript
const socket = io('http://localhost:3001');

// Join campaign updates
socket.emit('join_campaign', 'campaign_id');

// Listen for new leads
socket.on('new_lead', (data) => {
  console.log('New meeting booked:', data);
  // {
  //   type: 'MEETING_BOOKED',
  //   prospectName: 'John Doe',
  //   campaignId: 'camp_123',
  //   timestamp: '2026-05-17T14:45:00Z'
  // }
});

// Leave campaign
socket.emit('leave_campaign', 'campaign_id');
```

---

**Last Updated:** May 17, 2026  
**API Version:** 1.0.0
