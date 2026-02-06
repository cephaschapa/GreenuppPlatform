# Deploying GreenUpp on Dokploy

This guide covers deploying the GreenUpp platform (Node.js API + Vite frontend) on a [Dokploy](https://dokploy.com/) instance.

## Prerequisites

- A Dokploy instance up and running
- (Recommended) A PostgreSQL database—use Dokploy’s built-in PostgreSQL or an external one

## 1. Create a new project in Dokploy

1. In Dokploy, create a **new project** (e.g. “greenupp”).
2. Add an **application** and choose **Dockerfile** as the build method.
3. Set the **build context** to the `platform` directory (e.g. `./platform` or the path where the Dockerfile lives).
4. The Dockerfile at `platform/Dockerfile` will be used automatically.

## 2. Build and run settings

- **Port:** The app listens on **5000**. In Dokploy, expose or map port **5000** for the service.
- **Start command:** Leave empty to use the Dockerfile `CMD` (`npm start`).

## 3. Environment variables

Configure these in Dokploy’s **Environment** / **Variables** for the application.

### Required

| Variable         | Description                                                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string, e.g. `postgresql://user:password@host:5432/greenupp`. If you use Dokploy’s PostgreSQL, use the URL it provides. |
| `SESSION_SECRET` | A long random string for session encryption (e.g. 32+ characters).                                                                            |

### Domain / CORS (use your Dokploy URL)

| Variable          | Example (replace with your domain)                                    |
| ----------------- | --------------------------------------------------------------------- |
| `BASE_DOMAIN`     | `greenupp.yourdomain.com`                                             |
| `ALLOWED_ORIGINS` | `https://greenupp.yourdomain.com,https://app.greenupp.yourdomain.com` |
| `COOKIE_DOMAIN`   | `.yourdomain.com` or your exact domain                                |

### Optional (see `.env.example`)

- `NODE_ENV=production`
- `OPENWEATHER_API_KEY`, `OPENAI_API_KEY`, etc., as needed
- `REDIS_URL` if you add Redis
- Stripe, Stream, SendGrid, etc., if you use those features

## 4. Database

- **Option A – Dokploy PostgreSQL:** Create a PostgreSQL service in the same project and use its connection URL as `DATABASE_URL`.
- **Option B – External PostgreSQL:** Set `DATABASE_URL` to your external instance. Ensure the Dokploy server (or your app’s network) can reach it.

After first deploy, run migrations (e.g. via a one-off command or Dokploy “run command”):

```bash
npm run db:migrate
```

(or your project’s migration command if different).

## 5. Volumes (optional)

If you want uploads to persist across restarts, add a volume in Dokploy for the app container:

- **Container path:** `/app/uploads`
- **Volume:** e.g. a named volume or host path

The Dockerfile already creates `/app/uploads` and the app serves files from it.

## 6. Health check

The Dockerfile includes a `HEALTHCHECK` that calls `http://localhost:5000/api/health`. Dokploy can use this to determine container health. No extra config is required if the app is listening on port 5000.

## 7. Mobile app (Expo) and API URL

Point the Expo app at your Dokploy API:

- Set **`EXPO_PUBLIC_API_URL`** to your public API URL, e.g. `https://greenupp.yourdomain.com`.
- Rebuild the Expo app so the new URL is embedded.

The app uses this in `app/services/api/config.ts`; in production it otherwise defaults to `https://www.greenupp.earth`.

## 8. Deploy

1. Save the application and trigger a **deploy** (e.g. from Git or “Deploy” in the UI).
2. After the build finishes, open your configured domain; you should see the GreenUpp web app and be able to call `/api/health`.

## Quick reference

| Item            | Value                             |
| --------------- | --------------------------------- |
| Build context   | `platform/` (where Dockerfile is) |
| Port            | 5000                              |
| Health endpoint | `GET /api/health`                 |
| Start command   | From Dockerfile: `npm start`      |

For full environment options, see `platform/.env.example`.
