# Deployment Guide

This guide covers multiple deployment options for the WeHaveFoodAtHome backend API, from free hosting to production-ready solutions.

## Table of Contents
- [Docker Setup](#docker-setup)
- [Free/Cheap Deployment Options](#freecheap-deployment-options)
  - [Render.com (Recommended)](#rendercom-recommended)
  - [Fly.io](#flyio)
  - [Railway.app](#railwayapp)
  - [Koyeb](#koyeb)
- [Environment Variables](#environment-variables)
- [Health Checks](#health-checks)

---

## Docker Setup

### Local Development with Docker

**Quick Start:**
```bash
# Build and run production image
docker-compose up api

# Run development server with hot reload
docker-compose --profile dev up api-dev
```

**Manual Docker Commands:**
```bash
# Build production image
docker build -t wehavefoodathome-backend .

# Run container
docker run -p 5000:5000 \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_key \
  -e ANTHROPIC_API_KEY=your_key \
  wehavefoodathome-backend
```

**Using .env file:**
```bash
docker run -p 5000:5000 --env-file .env wehavefoodathome-backend
```

---

## Free/Cheap Deployment Options

### Render.com (Recommended)

**Cost:** Free tier with 750 hours/month (sleeps after 15min inactivity)

**Deployment Steps:**

1. **One-Click Deploy:**
   - Push this code to GitHub
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

2. **Manual Deploy:**
   - Click "New +" → "Web Service"
   - Connect repository
   - Set build command: `docker build -t app .`
   - Set start command: `docker run app`
   - Add environment variables (see below)

3. **Set Environment Variables:**
   - Go to your service → Environment
   - Add all required variables from [Environment Variables](#environment-variables)

**Pros:**
- Easy setup with `render.yaml`
- Free SSL certificates
- Auto-deploy on git push
- Great UI for managing services

**Cons:**
- Free tier sleeps after 15 min (30-60s cold start)
- Limited to 750 hours/month

---

### Fly.io

**Cost:** 3 free VMs (256MB RAM each), always-on

**Deployment Steps:**

1. **Install Fly CLI:**
   ```bash
   # macOS
   brew install flyctl

   # Linux/WSL
   curl -L https://fly.io/install.sh | sh

   # Windows
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Login and Launch:**
   ```bash
   fly auth login
   fly launch
   ```

   The `fly.toml` file is already configured. Just confirm settings.

3. **Set Secrets:**
   ```bash
   fly secrets set SUPABASE_URL=your_url
   fly secrets set SUPABASE_SERVICE_ROLE_KEY=your_key
   fly secrets set SUPABASE_PROJECT_ID=your_project_id
   fly secrets set ANTHROPIC_API_KEY=your_key
   # Add other optional API keys as needed
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

5. **View Your App:**
   ```bash
   fly open
   fly logs
   ```

**Pros:**
- No cold starts on free tier
- Global edge deployment
- Fast performance
- Always-on within free tier limits

**Cons:**
- CLI-based (less beginner-friendly)
- Requires Dockerfile knowledge

---

### Railway.app

**Cost:** $5/month free credit (enough for small apps)

**Deployment Steps:**

1. **Deploy from GitHub:**
   - Go to [Railway.app](https://railway.app/)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway auto-detects Dockerfile

2. **Add Environment Variables:**
   - Click on your service → Variables
   - Add all required variables (see below)

3. **Deploy:**
   - Railway auto-deploys on git push
   - Get your URL from the Deployments tab

**Pros:**
- Excellent developer experience
- No sleep on free tier
- Auto-deploy from GitHub
- Beautiful dashboard

**Cons:**
- Credit-based (may run out with high traffic)
- $5/month credit limit

---

### Koyeb

**Cost:** Free tier with 1 web service + 1 database

**Deployment Steps:**

1. **Deploy from GitHub:**
   - Go to [Koyeb](https://www.koyeb.com/)
   - Click "Create App" → "GitHub"
   - Select repository
   - Choose "Dockerfile" as builder

2. **Configure:**
   - Set port to 5000
   - Add environment variables
   - Deploy

**Pros:**
- Always-on (no cold starts)
- Free tier doesn't sleep
- Simple setup

**Cons:**
- Smaller resource limits
- Fewer regions than competitors

---

## Environment Variables

All deployment platforms require these environment variables:

### Required:
```bash
NODE_ENV=production
PORT=5000  # or 8080 for Fly.io

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_ID=your_project_id
```

### Optional (Receipt Parsing):
```bash
# Choose provider
RECEIPT_PARSER_PROVIDER=claude  # claude, groq, or veryfi

# Claude Vision (Anthropic)
ANTHROPIC_API_KEY=your_anthropic_key
CLAUDE_MODEL=claude-3-5-sonnet-20241022

# Groq (Llama Vision)
GROQ_API_KEY=your_groq_key
GROQ_MODEL=llama-3.2-90b-vision-preview

# Veryfi
VERYFI_CLIENT_ID=your_client_id
VERYFI_CLIENT_SECRET=your_client_secret
VERYFI_USERNAME=your_username
VERYFI_API_KEY=your_api_key
```

---

## Health Checks

All deployment configs include health checks at:
```
GET /api/v1
```

This endpoint should return a 200 status when the service is healthy.

**Configure in deployment platforms:**
- **Render:** Set Health Check Path to `/api/v1`
- **Fly.io:** Already configured in `fly.toml`
- **Railway:** Auto-detected from Dockerfile
- **Koyeb:** Set in service settings

---

## Comparison Table

| Platform | Free Tier | Cold Starts | Complexity | Best For |
|----------|-----------|-------------|------------|----------|
| **Render** | 750hrs/mo | Yes (15min) | Low | Beginners, quick deploy |
| **Fly.io** | 3 VMs | No | Medium | Performance, always-on |
| **Railway** | $5 credit | No | Low | Dev & small production |
| **Koyeb** | 1 service | No | Low | Always-on free hosting |

---

## Troubleshooting

### Build Fails
- Ensure all dependencies in `package.json` are correct
- Check that TypeScript compiles: `npm run build`

### Health Check Fails
- Verify `/api/v1` endpoint returns 200
- Check PORT environment variable matches service config
- Review logs for startup errors

### Environment Variables Not Working
- Ensure variables are set in platform dashboard
- Restart service after adding new variables
- Check for typos in variable names

### Out of Memory
- Increase memory allocation in platform settings
- Optimize dependencies (remove unused packages)
- Consider upgrading to paid tier

---

## Next Steps

1. Choose a deployment platform
2. Set up environment variables
3. Deploy using steps above
4. Configure custom domain (optional)
5. Set up monitoring/logging
6. Configure CI/CD for auto-deployment

For production deployments, consider:
- Database backups
- Monitoring (Sentry, DataDog, etc.)
- CDN for static assets
- Rate limiting
- Security headers (already configured via Helmet)
