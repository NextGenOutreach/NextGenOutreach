# NextGenOutreach — Platform Technical Specification

**Document Version:** 1.0  
**Date:** 13 May 2026  
**Domain:** nextgenoutreach.co.za  
**Prepared for:** Platform Owner / Stakeholder Review  

---

## 1. Executive Summary

NextGenOutreach is a **LinkedIn SDR & Reps Marketplace** — a two-sided platform connecting businesses that need LinkedIn outreach with ID-verified professionals ("reps") who execute campaigns from their own real LinkedIn profiles.

The platform consists of:
- A **public marketing website** (live on Afrihost)
- A **role-based dashboard** for Clients, Reps, and Admins
- **Firebase Authentication** for secure user login/registration
- A **backend API** (Node.js/Express) ready for future deployment

**Current deployment:** Static site on Afrihost Gold Home Linux Hosting at `nextgenoutreach.co.za`

---

## 2. Technology Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| **Frontend Framework** | Next.js 16.2.4 (React 19) | App Router, static export for Afrihost |
| **Styling** | Tailwind CSS 4 | Custom design system with 5 accent colors |
| **Fonts** | Outfit, DM Sans, Bungee | Google Fonts, base64-encoded for Afrihost |
| **Authentication** | Firebase Auth | Email/password, client-side, no backend required |
| **Backend API** | Express.js + TypeScript | REST API with JWT, rate limiting, Socket.IO |
| **Database** | PostgreSQL (planned) | Via Prisma ORM |
| **Real-time** | Socket.IO | WebSocket server for live updates |
| **File Storage** | AWS S3 (planned) | For documents, profile images |
| **Hosting (current)** | Afrihost Gold Home Linux | Static HTML export |
| **Hosting (future)** | Vercel or VPS | Full server-side rendering + API |

---

## 3. Design System

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0d0d1a` | Dark base |
| Magenta (Accent 1) | `#ff3af2` | Primary CTA, borders, highlights |
| Cyan (Accent 2) | `#00f5d4` | Secondary actions, hover states |
| Yellow (Accent 3) | `#ffe600` | Tags, badges, emphasis |
| Orange (Accent 4) | `#ff6b35` | Warnings, tertiary elements |
| Purple (Accent 5) | `#7b2fff` | Shadows, gradients, depth |
| Muted | `#2d1b4e` | Card backgrounds, subtle UI |

### Typography
- **Outfit** — Headlines, buttons, UI labels (font-weight 800–900)
- **DM Sans** — Body text, paragraphs (font-weight 400–700)
- **Bungee** — Decorative background text, step numbers

### Visual Style
- Hard stacked shadows (3-layer colored offsets)
- Gradient text effects (animated color shifting)
- Dotted/striped/checker background patterns
- Glassmorphism (backdrop-blur + transparency)
- Floating emoji decorations with animations
- Neon glow effects on buttons and cards
- Fully responsive (mobile-first with breakpoints at sm/md/lg)

---

## 4. Site Map & Pages

### 4.1 Public Pages (Marketing)

| Route | Page | Description |
|-------|------|-------------|
| `/` | **Homepage** | Hero section, how it works, pricing cards, CTA banner, rep modal |
| `/pricing` | **Pricing** | Starter ($75), Professional ($150), Managed ($300) plans with ROI calculator |
| `/how-it-works` | **How It Works** | Step-by-step process for Clients and Reps |
| `/about-us` | **About Us** | Company story, team, mission |
| `/company` | **Company** | Corporate info |
| `/contact` | **Contact** | Contact form (Full Name, Email, Type, Message) |
| `/contact/success` | **Contact Success** | Confirmation after form submission |
| `/marketplace` | **Marketplace** | Browse available outreach reps |
| `/products` | **Products** | Product/service offerings |
| `/become-an-outreach-agent` | **Become a Rep** | Rep application and information |
| `/why-nextgenoutreach` | **Why Us** | Value propositions and differentiators |
| `/login` | **Login** | Redirects to auth login |
| `/register` | **Register** | Redirects to auth register |

### 4.2 Authentication Pages

| Route | Page | Description |
|-------|------|-------------|
| `/auth/login` | **Sign In** | Email + password login via Firebase |
| `/auth/register` | **Sign Up** | Email + password + role selection (Client or Rep) via Firebase |

### 4.3 Dashboard — Client Role

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard` | **Router** | Detects user role, redirects to appropriate overview |
| `/dashboard/client/overview` | **Client Overview** | Active campaigns, connections sent, meetings booked, pipeline value |
| `/dashboard/client/campaigns` | **Campaigns** | Create/manage LinkedIn outreach campaigns |
| `/dashboard/client/marketplace` | **Marketplace** | Browse and hire reps from the dashboard |

### 4.4 Dashboard — Rep Role

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard/rep/overview` | **Rep Overview** | Active clients, tasks due today, weekly connections, monthly earnings |
| `/dashboard/rep/tasks` | **Tasks** | Daily outreach tasks assigned by clients |
| `/dashboard/rep/earnings` | **Earnings** | Payment history and earnings breakdown |

### 4.5 Dashboard — Admin Role

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard/admin/overview` | **Admin Overview** | Total reps, clients, campaigns, monthly revenue |
| `/dashboard/admin/users` | **User Management** | Search, filter, view all users (reps + clients), status management |

### 4.6 Dashboard — Shared Pages

| Route | Page | Description |
|-------|------|-------------|
| `/dashboard/agents` | **Agents** | Agent/rep listings |
| `/dashboard/missions` | **Missions** | Campaign mission tracking |
| `/dashboard/vault` | **Vault** | Secure document/credential storage |

---

## 5. User Roles & Permissions

| Role | Access | Description |
|------|--------|-------------|
| **Client** | Client dashboard, marketplace, campaigns | Businesses hiring reps for LinkedIn outreach |
| **Rep** | Rep dashboard, tasks, earnings | ID-verified LinkedIn professionals executing campaigns |
| **Admin** | Full admin dashboard, user management | Platform operators managing reps and clients |
| **Super Admin** | Same as Admin | Elevated admin with full system access |

### Authentication Flow
1. User visits `/auth/register` → selects role (Client or Rep) → creates account via Firebase
2. Firebase creates user → role stored in browser `localStorage` (keyed by Firebase UID)
3. User visits `/auth/login` → authenticates via Firebase → redirected to role-specific dashboard
4. Dashboard layout shows user email + name, Sign Out button
5. Protected routes redirect unauthenticated users to `/login`

---

## 6. Backend API (apps/api)

> **Status:** Built but not yet deployed. Currently, dashboard pages show simulated/mock data. When the API is deployed (on a VPS or cloud), dashboard data will be live.

### Architecture
- **Framework:** Express.js with TypeScript
- **Auth:** JWT (access + refresh tokens)
- **Database:** PostgreSQL via Prisma
- **Real-time:** Socket.IO for live campaign updates
- **Rate Limiting:** Per-IP + auth-specific rate limits with account lockout
- **File Storage:** AWS S3 integration ready
- **Logging:** Winston logger with Morgan HTTP logging

### API Routes

| Endpoint Group | Base Path | Description |
|---------------|-----------|-------------|
| **Auth** | `/api/v1/auth` | Login, register, refresh token, 2FA |
| **Users** | `/api/v1/users` | User CRUD, profile management |
| **Reps** | `/api/v1/reps` | Rep profiles, verification, matching |
| **Clients** | `/api/v1/clients` | Client profiles, requirements |
| **Campaigns** | `/api/v1/campaigns` | Campaign CRUD, status, metrics |
| **Billing** | `/api/v1/billing` | Payment processing, invoices |
| **Analytics** | `/api/v1/analytics` | Platform metrics, reports |
| **Admin** | `/api/v1/admin` | Admin-only operations |
| **Webhooks** | `/api/v1/webhooks` | External service webhooks |
| **Health** | `/api/v1/health` | Server health check |

### Middleware Stack
- CORS (configurable origin)
- Helmet (security headers)
- Rate limiter (100 req/15min per IP)
- Request logger
- JWT auth middleware
- Validation middleware
- Error handler

---

## 7. Reusable Component Library

| Component | File | Description |
|-----------|------|-------------|
| `MaxButton` | `ui/MaxButton.tsx` | Gradient button with glow effect. Variants: primary, secondary, outline, ghost. Sizes: sm, md, lg. Supports links. |
| `MaxCard` | `ui/MaxCard.tsx` | Glassmorphic card with colored border + stacked shadow. Props: accentColor, shadowColor, dashed. |
| `MaxInput` | `ui/MaxInput.tsx` | Styled input field with label and colored border. |
| `FloatingDecoration` | `ui/Decoration.tsx` | Animated floating emojis/shapes for visual flair. |
| `BackgroundPatterns` | `ui/Decoration.tsx` | Layered dot/stripe/mesh background patterns. |
| `MarketingNav` | `marketing-nav.tsx` | Fixed navbar with logo, nav links, CTA, mobile hamburger menu. |
| `SiteFooter` | `marketing.tsx` | Footer with logo, email, nav links, copyright. |
| `Hero` | `marketing.tsx` | Reusable hero section with title, subtitle, dual CTAs. |
| `Section` | `marketing.tsx` | Reusable content section with tag, title, intro text. |
| `CardGrid` | `marketing.tsx` | Auto-colored card grid with alternating accents. |
| `MetricCard` | `MetricCard.tsx` | Dashboard stat card with label + value. |
| `CampaignWizard` | `CampaignWizard.tsx` | Multi-step campaign creation flow. |
| `SDRMarketplace` | `SDRMarketplace.tsx` | Rep browsing/filtering component. |
| `RepApplicationForm` | `RepApplicationForm.tsx` | Rep application form. |
| `DashboardLayout` | `DashboardLayout.tsx` | Alternative dashboard sidebar layout. |

---

## 8. Pricing Model

| Plan | Price | Includes |
|------|-------|----------|
| **Starter** | $75/agent/month | 1 ID-Verified Rep, Connection Campaigns, DM Campaigns, Secure Environment |
| **Professional** | $150/agent/month | Everything in Starter + Post & Engagement, Sales Navigator Access, Account Warm-Up, Priority Matching |
| **Managed** | $300/agent/month | Everything in Pro + Full Reply Handling, Appointment Setting, Dedicated Account Manager |

- Month-to-month, no lock-in
- Go live within 24 hours

---

## 9. Current Deployment (Afrihost)

### How It Works
1. Next.js builds a **static HTML export** (`output: 'export'`)
2. A PowerShell script (`create-afrihost-static-site.ps1`) post-processes the build:
   - Renames `_next/` to `assets/` (Afrihost rejects underscore-prefixed folders)
   - Rewrites all asset paths in HTML/JS/CSS
   - Base64-encodes all `.woff2` font files into CSS
   - Inlines all CSS directly into HTML files
3. Output: `nextgen-afrihost-public-html.zip` (~4.6 MB)
4. Uploaded and extracted into Afrihost `public_html/` directory

### What Works on Afrihost
- All public/marketing pages (fully styled, responsive, mobile-friendly)
- Firebase Authentication (login/register — runs entirely client-side)
- Dashboard UI with mock data
- Contact form (client-side validation, redirects to success page)
- SEO: sitemap.xml, robots.txt, OpenGraph metadata

### What Doesn't Work on Afrihost
- Backend API (Afrihost shared hosting cannot run Node.js)
- Real dashboard data (currently mock/simulated)
- Server-side rendering (static HTML only)
- Contact form email delivery (form validates but doesn't send)

---

## 10. Responsive Design (Mobile)

All pages are fully mobile responsive with:
- **Hamburger navigation** on screens < 1024px with slide-down menu
- **Stacked layouts** — hero cards, pricing cards, step cards stack vertically
- **Reduced padding** — `16px` on mobile vs `40px` on desktop
- **Scaled typography** — headlines use `clamp()` for fluid sizing
- **Smaller buttons/tags** — proportional sizing on small screens
- **Reduced text shadows** — fewer shadow layers on mobile for readability
- **Dashboard sidebar** — off-canvas slide-in with backdrop overlay

---

## 11. SEO & Metadata

- **Title template:** `%s | NextGenOutreach`
- **Default title:** "NextGenOutreach | World's #1 LinkedIn SDR & Reps Marketplace"
- **OpenGraph:** Type, locale (en_ZA), URL, site name, description
- **Twitter Card:** summary_large_image
- **Authors:** Tshepo Khosi, Nobuhle Tshanini
- **Keywords:** LinkedIn SDR, LinkedIn Reps Marketplace, Hire LinkedIn SDR, etc.
- **Sitemap:** Auto-generated at `/sitemap.xml`
- **Robots:** Auto-generated at `/robots.txt` (allows all, disallows `/dashboard/` and `/api/`)

---

## 12. Environment Variables Required

```
# Firebase (required for auth — get from Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## 13. What's Next — Roadmap

### Phase 1: Foundation (Current)
- [x] Marketing website live on Afrihost
- [x] Mobile responsive design
- [x] Firebase Authentication (login/register)
- [x] Role-based dashboard UI (Client, Rep, Admin)
- [x] Pricing page with 3-tier plans
- [x] Contact form
- [x] SEO (sitemap, robots, OpenGraph)

### Phase 2: Backend Integration
- [ ] Deploy API to a VPS or cloud service (Railway, Render, DigitalOcean)
- [ ] Connect PostgreSQL database
- [ ] Replace mock dashboard data with live API calls
- [ ] Wire contact form to send emails (via SendGrid or similar)
- [ ] Implement PayFast or Stripe payment integration

### Phase 3: Core Marketplace Features
- [ ] Rep ID verification workflow
- [ ] Client-Rep matching algorithm
- [ ] Campaign creation and management
- [ ] Real-time task assignment and tracking
- [ ] Earnings/payout system for reps
- [ ] Secure environment (vault) for campaign credentials

### Phase 4: Growth
- [ ] Google/LinkedIn OAuth login
- [ ] Rep ratings and reviews
- [ ] Analytics and reporting dashboards
- [ ] Admin bulk operations
- [ ] Email notifications and drip campaigns
- [ ] Mobile app (React Native)

---

## 14. Repository Structure

```
nextgen-dashboard/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/                  # Pages (App Router)
│   │   │   │   ├── (public)/         # Marketing pages
│   │   │   │   ├── (auth)/           # Login & Register
│   │   │   │   ├── dashboard/        # Role-based dashboards
│   │   │   │   ├── layout.tsx        # Root layout
│   │   │   │   └── globals.css       # Design system + animations
│   │   │   ├── components/           # Reusable UI components
│   │   │   └── lib/                  # Firebase config, auth context
│   │   ├── next.config.ts            # Static export config
│   │   ├── vercel.json               # Vercel deploy config
│   │   └── package.json
│   │
│   └── api/                          # Express.js backend
│       ├── src/
│       │   ├── controllers/          # Route handlers
│       │   ├── middleware/            # Auth, validation, errors
│       │   ├── routes/               # API route definitions
│       │   ├── services/             # Business logic
│       │   ├── lib/                  # DB, JWT, S3, Redis, logging
│       │   └── server.ts             # App entry point
│       └── package.json
│
├── scripts/
│   ├── create-afrihost-static-site.ps1   # Afrihost packaging script
│   └── create-afrihost-package.ps1       # Source code packaging
│
└── PLATFORM_SPEC.md                  # This document
```

---

## 15. Key Contacts

- **Domain:** nextgenoutreach.co.za
- **Hosting:** Afrihost Gold Home Linux Hosting
- **Email:** directors@nextgenoutreach.co.za
- **WhatsApp (Rep Applications):** +27 60 686 5738
- **Discord:** discord.gg/CcsNMcGMsH

---

*End of specification.*
