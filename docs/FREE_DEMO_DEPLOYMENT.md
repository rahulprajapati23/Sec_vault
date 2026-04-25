# 100% Free Demo Deployment Guide

This guide deploys Secure File Vault using only free-tier services, with settings verified against this repository.

## Architecture Overview
- Backend: Render Free Web Service
- Database: Supabase Postgres (recommended) or Render Postgres Free (time-limited)
- Frontend: Vercel Free
- IAM: Cloud-IAM Keycloak (Little Birdie tier)
- File Storage: Local disk on Render (demo only) or Supabase storage integration

## Step 1: Provision Free Services

### 1. Supabase (Database)
1. Create a project on Supabase.
2. Open Project Settings -> Database.
3. Copy the connection string URI.
4. Replace [YOUR-PASSWORD] with your real DB password.

Example:

```bash
postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
```

### 2. Cloud-IAM (Keycloak)
1. Create a Cloud-IAM account.
2. Create a Little Birdie deployment.
3. In Keycloak admin:
4. Create a realm, for example vault-demo.
5. Create a client, for example vault-frontend.
6. Add redirect URIs:
   - https://*.vercel.app/*
   - http://localhost:5173/*
7. Create realm roles:
   - OWNER
   - ADMIN
   - REQUESTER
8. (Optional but recommended) create a client secret and keep it for backend env vars.

Important:
Use the Keycloak server base URL (for example https://<id>.cloud-iam.com/auth), not the admin console URL.

## Step 2: Deploy Backend on Render

1. Fork this repository.
2. In Render, click New -> Blueprint.
3. Connect your fork. Render will detect render.yaml.
4. In the service environment variables, set or override:

```bash
# Required security
SECRET_KEY=<long-random-string>
MASTER_KEY=<urlsafe-base64-encoded-32-byte-key>

# Database (override blueprint DB if using Supabase)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres

# Keycloak
KEYCLOAK_ENABLED=true
KEYCLOAK_SERVER_URL=https://<id>.cloud-iam.com/auth
KEYCLOAK_REALM=vault-demo
KEYCLOAK_CLIENT_ID=vault-frontend
KEYCLOAK_CLIENT_SECRET=<optional-or-empty>
KEYCLOAK_ADMIN_CLIENT_ID=<admin-client-id-or-vault-frontend>
KEYCLOAK_ADMIN_CLIENT_SECRET=<admin-client-secret-or-client-secret>

# Cross-site frontend support (Vercel -> Render)
CORS_ALLOW_ORIGINS=https://<your-vercel-app>.vercel.app,http://localhost:5173
COOKIE_SAMESITE=none
COOKIE_SECURE=true

# Demo-safe feature toggles
SMTP_ENABLED=false
GEOLOCATION_ENABLED=false
```

Generate MASTER_KEY locally:

```bash
python -c "import base64, os; print(base64.urlsafe_b64encode(os.urandom(32)).decode())"
```

## Step 3: Deploy Frontend on Vercel

1. In Vercel, click Add New -> Project.
2. Import your forked repo.
3. Set Root Directory to frontend.
4. Add environment variable:

```bash
VITE_API_URL=https://<your-render-service>.onrender.com
```

5. Deploy.

Notes:
- This repo uses cookie-based auth with credentials; VITE_API_URL is required for hosted frontend calls.
- If login works but API calls fail, double-check CORS_ALLOW_ORIGINS and cookie settings in backend env.

## Step 4: Local .env Template

Use this as a base for local/dev cloud testing:

```bash
# Security + DB
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres
SECRET_KEY=your-long-random-secret
MASTER_KEY=your_base64_32_byte_key

# Keycloak
KEYCLOAK_ENABLED=true
KEYCLOAK_SERVER_URL=https://<id>.cloud-iam.com/auth
KEYCLOAK_REALM=vault-demo
KEYCLOAK_CLIENT_ID=vault-frontend
KEYCLOAK_CLIENT_SECRET=
KEYCLOAK_ADMIN_CLIENT_ID=vault-frontend
KEYCLOAK_ADMIN_CLIENT_SECRET=

# Hosted frontend support
CORS_ALLOW_ORIGINS=https://<your-vercel-app>.vercel.app,http://localhost:5173
COOKIE_SAMESITE=none
COOKIE_SECURE=true

# Feature flags
SMTP_ENABLED=false
GEOLOCATION_ENABLED=false
```

## Demo Day Checklist

- Wake backend: open the Render URL 5 minutes before demo.
- Smoke test auth: login once so Keycloak and backend are warm.
- Verify API session: call /auth/me from frontend after login.
- Clear noisy demo data: clean dam_events if you need a fresh timeline.
- Check realtime panel: confirm SOC dashboard still receives live updates.
- Keep a prepared share-link scenario for quick walkthrough.

## Free Tier Limitations

- Render free web services sleep after inactivity.
- Cloud-IAM free tier has limited concurrency/resources.
- Supabase free tier has storage and database caps.
- Local disk on Render is ephemeral; uploaded files may be lost on redeploy/restart.
