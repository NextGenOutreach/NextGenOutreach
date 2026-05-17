# Quick Start Guide - NextGenOutreach Development

## Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Firebase account (free tier OK)
- Git

## 1. Clone & Install Dependencies

```bash
# Navigate to project root
cd nextgen-dashboard

# Install root dependencies
npm install

# Install workspace dependencies (automatic)
```

## 2. Setup Environment Variables

### Frontend (.env.local)
```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local` and add:
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234
NEXT_PUBLIC_WEB3FORMS_KEY=your_web3forms_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env)
```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and add:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nextgenoutreach
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# Firebase (get from Firebase Console)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# JWT Keys (generate new ones or use defaults)
JWT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
```

## 3. Setup Database

```bash
# Create PostgreSQL database
createdb nextgenoutreach

# Navigate to API
cd apps/api

# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Seed database with sample data
npx prisma db seed
```

## 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use existing
3. Enable **Email/Password** Authentication
4. In **Authentication → Settings → Authorized domains**, add:
   - `localhost`
   - Your domain (e.g., `nextgenoutreach.co.za`)
5. Create a **Web App** and copy config to `.env.local`
6. Generate **Service Account** key:
   - Project Settings → Service Accounts → Generate new private key
   - Add to `apps/api/.env` as `FIREBASE_PRIVATE_KEY`

## 5. Start Development Servers

### Terminal 1 - Backend API
```bash
cd apps/api
npm run dev
# API runs on http://localhost:3001
```

### Terminal 2 - Frontend
```bash
cd apps/web
npm run dev
# Frontend runs on http://localhost:3000
```

## 6. Verify Everything Works

```bash
# Test API health
curl http://localhost:3001/health

# Test reps endpoint
curl http://localhost:3001/api/v1/reps

# Visit frontend
open http://localhost:3000
```

## Common Commands

```bash
# Build API
cd apps/api && npm run build

# Build Frontend
cd apps/web && npm run build

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Check Prisma schema
cd apps/api && npx prisma studio
```

## Database Cheat Sheet

```bash
# Reset database (careful!)
cd apps/api
npx prisma migrate reset

# View database GUI
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Push changes without migration
npx prisma db push
```

## Testing Flows

### Register as Client
1. Go to http://localhost:3000/auth/register
2. Select "Client" role
3. Enter email & password
4. Should redirect to dashboard

### Browse Reps Marketplace
1. Go to http://localhost:3000/marketplace
2. Should show list of available reps (from API)
3. Filter by industry, country, rating

### Admin Dashboard
1. Register user with admin role (via Prisma)
2. Login as admin
3. Access http://localhost:3000/dashboard/admin
4. Manage users, campaigns, earnings

## Troubleshooting

### Database Connection Error
```
Error: Could not connect to the database server at `localhost:5432`
```
**Solution:** Ensure PostgreSQL is running: `pg_ctl start`

### Firebase Auth Error
```
Error: Firebase configuration missing
```
**Solution:** Check `.env.local` has all Firebase config

### API Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Kill process: `kill -9 $(lsof -ti:3001)` or use different port

### Prisma Client Generation Error
```
Error: Failed to generate Prisma Client
```
**Solution:** Run `npx prisma generate` manually

## Next Steps

1. ✅ Setup environment (you are here)
2. → Test API endpoints with Postman
3. → Create test users via dashboard
4. → Test campaign creation flow
5. → Deploy to staging
6. → Production deployment

## Useful Links

- [Firebase Console](https://console.firebase.google.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Questions?** Check IMPLEMENTATION_STATUS.md for more details.
