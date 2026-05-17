# NextGenOutreach — Remaining To-Do

Last updated: 14 May 2026. Everything listed here requires **your action** — the frontend code is complete.

---

## 🔑 1. Environment Variables (do this first)

Copy `apps/web/env.example` to `apps/web/.env.local` and fill in real values:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Your Apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | same |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | same |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | same |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | same |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | same |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | https://web3forms.com (free, instant) |
| `NEXT_PUBLIC_API_URL` | Your backend URL once deployed |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | `nextgenoutreach.co.za` (or leave empty in dev) |

---

## 🔥 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a project (or use existing)
3. Enable **Authentication → Email/Password** sign-in method
4. Add your domain to **Authentication → Settings → Authorized domains** (add `nextgenoutreach.co.za` + `localhost`)
5. Create a **Web App** in Project Settings and copy the config into `.env.local`
6. Generate a **Service Account** key (Project Settings → Service Accounts → Generate new private key) — needed for the API backend to set custom role claims

---

## ⚙️ 3. Backend API Deployment

The Express API (`apps/api/`) needs to be live before real dashboard data shows.

1. Set up environment variables on the server (see `apps/api/.env.example`)
2. Copy your Firebase service account JSON to the server path referenced in the API config
3. Run `npm install && npm run build` in `apps/api/`
4. Start with PM2: `pm2 start dist/server.js --name ngo-api`
5. Configure Nginx reverse proxy (config is in `infrastructure/nginx/`)
6. The API must be reachable at `https://api.nextgenoutreach.co.za` for the auth sync-claims flow to work

> Until the API is live, users can still log in — they just won't have role claims set, defaulting to `client`.

---

## 📧 4. Contact Form (Web3Forms)

1. Sign up free at https://web3forms.com
2. Create an access key → add to `NEXT_PUBLIC_WEB3FORMS_KEY` in `.env.local` **and** in your Afrihost static site environment
3. The form at `/contact` will then deliver emails to your registered Web3Forms email

---

## 🚀 5. Afrihost / Static Deployment

1. Ensure all env vars above are set
2. Run the deployment script from the project root:
   ```powershell
   .\scripts\create-afrihost-static-site.ps1
   ```
3. Upload the output folder to Afrihost via cPanel File Manager or FTP
4. The `apps/web/public/.htaccess` handles SPA routing on Apache

---

## 📊 6. Plausible Analytics

1. Sign up at https://plausible.io (has a free trial)
2. Add site `nextgenoutreach.co.za`
3. Set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=nextgenoutreach.co.za` in your production env

---

## 🔗 7. API Integration — ✅ COMPLETE

All dashboard pages are now wired to real API endpoints. No mock data remains in the primary pages.

| Page | Endpoint | Status |
|---|---|---|
| Client Campaigns | `GET /api/v1/campaigns` | ✅ Live |
| Campaign Create | `POST /api/v1/campaigns` | ✅ Live |
| Campaign Pause/Resume | `PATCH /api/v1/campaigns/:id/status` | ✅ Live |
| Client Marketplace | `GET /api/v1/reps` | ✅ Live |
| Admin Users | `GET /api/v1/admin/users` | ✅ Live |
| Admin Stats | `GET /api/v1/admin/stats` | ✅ Live |
| Rep Tasks | `GET /api/v1/rep/tasks` | ✅ Live |
| Rep Earnings | `GET /api/v1/rep/earnings` | ✅ Live |
| Lead Vault | `GET /api/v1/admin/leads` | ✅ Live |
| Missions / Agents | `GET /api/v1/campaigns` / `/admin/reps` | ✅ Live |

---

## 🧪 8. Manual Testing Checklist

Before going live, verify these flows end-to-end:

- [ ] Register as **client** → lands on `/dashboard/client/overview`
- [ ] Register as **rep** → lands on `/dashboard/rep/overview`
- [ ] Login with wrong password → shows error
- [ ] Visit `/dashboard/*` while logged out → redirects to `/login`
- [ ] Visit `/login` while logged in → redirects to dashboard
- [ ] Contact form submits → redirects to `/contact/success` + email arrives
- [ ] `/login` and `/register` links work from nav and between auth pages
- [ ] 404 page loads for unknown routes
- [ ] Campaign wizard steps through correctly at `/dashboard/client/campaigns/create`

---

## 🏗️ 9. Missing Backend Features — ✅ COMPLETED SPRINT

The following features have been implemented and wired up:

- ✅ **ID Verification flow** — S3 upload API implemented + UI integrated into `/dashboard/vault`.
- ✅ **Real-time matching** — Matching service integrated into marketplace with visual match scores.
- ✅ **Payment / PayFast integration** — Checkout API, ITN webhook handler, and `/pricing` page implemented.
- ✅ **Rep profile pages** — `/dashboard/rep/profile` fully implemented with edit support.
- ✅ **Client profile page** — `/dashboard/client/profile` fully implemented with subscription status.
- ✅ **Admin analytics** — Historical reporting API + live charts added to Admin Overview.
- ✅ **Lead Vault** — Integrated with activities API + CRM Sync functionality implemented.

---

## ✅ What Is Already Done (frontend)

- All public marketing pages (homepage, pricing, how-it-works, marketplace, about, company, products, why-nextgenoutreach, contact, privacy, terms, become-an-outreach-agent)
- Auth pages: `/login`, `/register` with Firebase auth + role selection
- Auth guard: unauthenticated users redirected to `/login`
- Auth layout: logged-in users redirected away from auth pages
- All dashboard pages styled to design system (client, rep, admin roles)
- Campaign wizard route at `/dashboard/client/campaigns/create`
- sitemap.xml, robots.txt, 404 page
- Contact form with Web3Forms (client-side, works on static hosting)
- TypeScript: zero errors (`tsc --noEmit` exits 0)
