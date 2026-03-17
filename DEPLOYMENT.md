# Deployment notes

This document summarizes steps to deploy the project to a production host and where to set environment variables securely.

1) Local quick test with Docker Compose

  - Create a local `.env` (do NOT commit it) and copy values from `.env.example`.
  - Build and run:

    docker compose -f docker-compose.prod.yml up --build -d

  - Check the logs for the `app` service:

    docker compose -f docker-compose.prod.yml logs -f app

  - Test API endpoint:

    curl http://localhost:5000/api/agents

2) Migrations (Drizzle)

  - Before the app is run against the production DB, run migrations:
    - Locally or in a one-off container: `npx drizzle-kit push` (or `npm run db:push`).
    - The provided `docker-compose.prod.yml` includes a `migrations` service that runs `npx drizzle-kit push --yes` once the DB is healthy.

3) Secrets and environment variables

  - Never commit `.env` to the repo. Use the `.env.example` as a template only.
  - For Render / Vercel / Fly / other hosts, set the following environment variables in the platform UI or secret store:
    - DATABASE_URL (required) — e.g. `postgresql://postgres:<PASSWORD>@db.maxyuppnjqkpuvhycvkq.supabase.co:5432/postgres`
    - SESSION_SECRET (required) — long random string
    - REPL_ID (if using Replit OIDC)
    - ISSUER_URL (optional, default `https://replit.com/oidc`)
    - AI_INTEGRATIONS_OPENAI_API_KEY (optional)
    - AI_INTEGRATIONS_OPENAI_BASE_URL (optional)
    - PORT (the platform normally provides one; app uses process.env.PORT)

4) Platform-specific notes

  - Render:
    - Create a Web Service, set the build command to `npm ci && npm run build` and start command to `npm start`.
    - Add the environment variables above to the service's environment.
    - Ensure `PORT` is not hard-coded; Render will provide it.

  - Vercel (frontend) + Render (backend) scenario:
    - Deploy the frontend to Vercel.
    - Deploy the backend to Render (or Fly).
    - On Vercel, set the frontend environment variable (if needed) with the backend URL.
    - Configure CORS on the backend to allow the frontend origin.

5) TLS / Cookies

  - The server sets `trust proxy` and the session cookie `secure: true`. Make sure TLS is terminated by a proxy (platform load balancer) so cookies are marked secure and authentication works.

6) Rollback / updates

  - Use platform deployments or simple CI to build, run migrations, and then swap the container.
