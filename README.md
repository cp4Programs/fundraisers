# Fundraisers

Web app for dance fundraisers: creators set up a “pick a square” board (5×8 grid); donors claim a square (number = dollar amount, star = custom amount) and pay via Venmo or Zelle. Creators confirm payments and share the board to social media.

## Stack

- **Next.js 15** (App Router), TypeScript, Tailwind CSS
- **Auth.js v5** — Google OAuth, DynamoDB adapter for sessions
- **AWS Amplify Gen 2** — backend (DynamoDB, S3), optional hosting
- **DynamoDB** — single-table (fundraisers, squares, user profiles)
- **S3** — dancer photos and generated share images

## Environment variables

Copy `.env.example` to `.env.local` and set:

| Variable | Description |
|----------|-------------|
| `AUTH_SECRET` | Required. Generate with `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `AUTH_URL` | App URL (e.g. `http://localhost:3000` or `https://yourdomain.com`) |
| `FUNDRAISER_TABLE_NAME` | DynamoDB table name (from Amplify sandbox or outputs) |
| `NEXTAUTH_TABLE_NAME` | Auth.js DynamoDB table name |
| `FUNDRAISER_ASSETS_BUCKET` | S3 bucket name for images |

## Local development

1. Install dependencies: `npm install`
2. Start Amplify sandbox (creates DynamoDB tables and S3 bucket):  
   `npx ampx sandbox`  
   After it deploys, copy the table and bucket names from the outputs (or from `amplify_outputs.json`) into `.env.local`.
3. In another terminal, run the app: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000). Sign in with Google (configure a Google OAuth client and set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`).

## Deploy to AWS Amplify

### Backend (DynamoDB + S3)

1. Ensure AWS credentials are configured (`aws configure` or env vars).
2. Run `npx ampx sandbox` to deploy the Amplify Gen 2 backend (DynamoDB tables, S3 bucket). For production, use a branch-based deployment or the Amplify Console to deploy the backend from your repo.
3. Note the resource names from the sandbox/console and set the same env vars in Amplify Hosting (see below).

### Frontend (Amplify Hosting)

1. In [AWS Amplify Console](https://console.aws.amazon.com/amplify/), create a new app and connect your Git repository.
2. Choose the branch to deploy (e.g. `main`).
3. Build settings: Amplify usually auto-detects Next.js. If not, use:
   - Build command: `npm run build`
   - Output directory: `.next` (or leave default; Amplify may use `out` for static export — this app uses SSR, so use the default Next.js server build).
4. In **Environment variables**, add all variables from the table above. Set `AUTH_URL` to your Amplify app URL (e.g. `https://main.xxxxx.amplifyapp.com`) or your custom domain.
5. For a **custom domain** (e.g. anddance.com): in Amplify, go to **Hosting** → **Domain management** and add your domain. If the domain is in Route 53, Amplify can configure it; otherwise add the CNAME/A records shown.
6. Redeploy after saving env vars.

### Post-deploy

- Create a Google OAuth client with your production redirect URI (e.g. `https://yourdomain.com/api/auth/callback/google`) and set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in Amplify.
- Ensure the IAM role used by the Next.js app (e.g. Amplify’s default or a custom role) has permissions to read/write the DynamoDB tables and S3 bucket.

## Features

- **Creators**: Sign in with Google, create a fundraiser (dancer name, title, slug, optional photo, Venmo/Zelle), manage pending claims (confirm or release), share link and downloadable board image.
- **Donors**: Open `/f/<slug>`, pick a square, enter name (and amount for star squares), get Venmo deep link or Zelle instructions, pay; creator confirms when paid.
- **Sharing**: Copy link, Web Share API, download board PNG, pre-filled SMS/email links. Open Graph image for link previews.

## Project structure

- `amplify/` — Amplify Gen 2 backend (DynamoDB, S3, Auth placeholder)
- `src/app/` — Next.js App Router (dashboard, public board, API routes)
- `src/components/` — Board, Square, PaymentModal, ShareButtons, DancerProfile
- `src/lib/` — db (DynamoDB), auth (Auth.js), s3, payments (Venmo/Zelle), board (grid constants)
