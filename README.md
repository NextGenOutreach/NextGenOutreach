This is a [Next.js](https://nextjs.org) project for NextGenOutreach marketing pages and lead capture.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Google Sheets Contact Integration

The `/contact` page submits to Google Sheets through a Google Apps Script webhook.

1. Copy `.env.example` to `.env.local`.
2. Set `GOOGLE_SHEETS_WEBHOOK_URL` to your deployed Apps Script Web App URL.
3. Ensure your Apps Script accepts JSON `POST` requests and appends:
   - `fullName`
   - `email`
   - `contactType`
   - `message`
   - `submittedAt`

If the webhook URL is not configured, the app falls back to local success mode and logs the submission server-side.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize Geist fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
