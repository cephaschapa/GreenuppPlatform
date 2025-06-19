# Greenupp Deployment Guide

## 🚀 CI/CD Pipeline Overview

This project uses **GitHub Actions + Railway** for automated CI/CD deployment.

### Pipeline Flow

```
Code Push → GitHub Actions → Build → Test → Deploy to Railway
```

## 📋 Prerequisites

### 1. Railway Account Setup

1. Create account at [railway.app](https://railway.app)
2. Install Railway CLI: `npm i -g @railway/cli`
3. Login: `railway login`

### 2. GitHub Repository Setup

1. Push your code to GitHub
2. Go to repository Settings → Secrets and variables → Actions
3. Add the following secrets:

#### Required Secrets

```bash
RAILWAY_TOKEN=your_railway_token
RAILWAY_PROJECT_ID=your_project_id
DATABASE_URL=your_neon_database_url
SESSION_SECRET=your_session_secret
```

#### Optional Secrets (for full features)

```bash
OPENAI_API_KEY=your_openai_key
SENDGRID_API_KEY=your_sendgrid_key
OPENWEATHER_API_KEY=your_weather_key
STRIPE_SECRET_KEY=your_stripe_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STREAM_API_KEY=your_stream_key
STREAM_API_SECRET=your_stream_secret
VITE_STREAM_API_KEY=your_stream_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## 🔧 Railway Setup

### 1. Create Railway Project

```bash
# Initialize Railway project
railway init

# Link to existing project (if you have one)
railway link
```

### 2. Set Environment Variables

**⚠️ CRITICAL: You must set these environment variables in Railway for the app to start!**

#### Required Variables (Must be set)

| Variable         | Description                  | Example                               |
| ---------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`   | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Secret key for sessions      | `your-super-secret-key-here`          |

#### Optional Variables (Enable additional features)

| Variable                 | Description                    | Example                     |
| ------------------------ | ------------------------------ | --------------------------- |
| `OPENAI_API_KEY`         | OpenAI API key for AI features | `sk-your-openai-key`        |
| `SENDGRID_API_KEY`       | SendGrid API key for emails    | `SG.your-sendgrid-key`      |
| `OPENWEATHER_API_KEY`    | OpenWeather API key            | `your-weather-key`          |
| `STRIPE_SECRET_KEY`      | Stripe secret key for payments | `sk_test_your-stripe-key`   |
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key              | `pk_test_your-stripe-key`   |
| `STREAM_API_KEY`         | Stream Chat API key            | `your-stream-key`           |
| `STREAM_API_SECRET`      | Stream Chat API secret         | `your-stream-secret`        |
| `VITE_STREAM_API_KEY`    | Stream Chat public key         | `your-stream-key`           |
| `ANTHROPIC_API_KEY`      | Anthropic API key              | `sk-ant-your-anthropic-key` |

#### Setting Variables in Railway

1. **Go to your Railway project dashboard**
2. **Click on your service**
3. **Go to the 'Variables' tab**
4. **Add each variable with its corresponding value**

#### Database Setup

1. **Create a PostgreSQL database in Railway:**

   - Go to your Railway project
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically provide the `DATABASE_URL`

2. **Or use an external database:**
   - Set `DATABASE_URL` to your external PostgreSQL connection string

#### Session Secret

Generate a secure session secret:

```bash
# Generate a random 32-character string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy Manually (First Time)

```bash
# Deploy to Railway
railway up
```

## 🔄 Automated Deployment

### GitHub Actions Workflow

The pipeline automatically runs on:

- **Push to `main` branch**: Full CI/CD (lint → test → build → deploy)
- **Push to `develop` branch**: CI only (lint → test)
- **Pull requests**: CI only (lint → test)

### Pipeline Stages

1. **Lint & Type Check**

   - ESLint code quality check
   - TypeScript type checking
   - Code formatting validation

2. **Test**

   - Unit tests (when implemented)
   - Integration tests (when implemented)
   - Database connectivity test

3. **Build**

   - Frontend build with Vite
   - Backend build with ESBuild
   - Artifact creation

4. **Deploy**

   - Deploy to Railway production
   - Health check verification
   - Automatic rollback on failure

5. **Security Scan**
   - npm audit for vulnerabilities
   - Dependency security check

## 🏗️ Local Development

### Prerequisites

```bash
Node.js 20+
npm 10+
PostgreSQL database (Neon recommended)
```

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
npm run db:push

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run start:debug  # Start production server with debug logging
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
npm run test         # Run tests
npm run db:push      # Push database schema changes
```

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

- **Basic Health**: `GET /api/health`
- **Detailed Health**: `GET /api/health/detailed`

### Railway Monitoring

- **Logs**: `railway logs`
- **Status**: `railway status`
- **Metrics**: Available in Railway dashboard

### GitHub Actions Monitoring

- Check Actions tab in GitHub repository
- Set up notifications for failed deployments
- Monitor build times and success rates

## 🚨 Troubleshooting

### Common Issues

#### 1. "cross-env: not found" Error

**Problem**: The server fails to start with `sh: cross-env: not found`

**Solution**:

- ✅ **Fixed**: `cross-env` has been moved to main dependencies
- ✅ **Fixed**: Start script now uses direct environment variable setting
- ✅ **Fixed**: Railway configuration updated to use `npm run start:debug`

**If you still see this error:**

1. Check Railway logs: `railway logs`
2. Ensure you're using the latest code
3. Redeploy: `railway up`

#### 2. Build Failures

```bash
# Check build logs
railway logs

# Verify environment variables
railway variables list

# Test build locally
npm run build
```

#### 3. Database Connection Issues

```bash
# Verify DATABASE_URL
railway variables get DATABASE_URL

# Check database status
railway logs | grep -i database
```

#### 4. Missing Environment Variables

**Problem**: Server fails to start due to missing environment variables

**Solution**:

1. Check Railway logs for specific missing variables
2. Set all required variables in Railway dashboard
3. Minimum required variables:
   - `DATABASE_URL`
   - `SESSION_SECRET`

#### 5. Health Check Failures

**Problem**: Health check returns "service unavailable"

**Solution**:

1. Check Railway logs: `railway logs`
2. Verify server is starting properly
3. Check for missing environment variables
4. Ensure database is accessible

### Debug Mode

Enable debug mode by setting:

```env
DEBUG_APP=true
```

This will provide more detailed logging during startup.

### Local Testing

Test the production build locally:

```bash
# Build the project
npm run build

# Test with production environment
NODE_ENV=production PORT=5000 npm start
```

## 📊 Performance & Scaling

### Railway Scaling

- **Automatic**: Railway scales based on traffic
- **Manual**: Adjust resources in dashboard
- **Custom domains**: Add custom domains in Railway

### Performance Optimization

- **Caching**: Implement Redis caching
- **CDN**: Use Railway's CDN for static assets
- **Database**: Optimize queries and indexes

## 🛡️ Security

### Environment Variables

- Never commit `.env` files
- Use Railway's secure variable storage
- Rotate secrets regularly

### Database Security

- Use connection pooling
- Enable SSL connections
- Regular backups

### Application Security

- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## 🔧 Maintenance

### Regular Tasks

1. **Update dependencies**: `npm update`
2. **Security audits**: `npm audit`
3. **Database backups**: Automated in Railway
4. **Log monitoring**: Check Railway logs

### Backup Strategy

- **Database**: Automated daily backups
- **Code**: Git repository
- **Configuration**: Railway variables

## 📞 Support

### Railway Support

- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Railway Status](https://status.railway.app/)

### Application Support

- Check logs: `railway logs`
- Debug mode: Set `DEBUG_APP=true`
- Health checks: `/api/health`

## 🎯 Best Practices

### Development

- Test locally before deploying
- Use feature branches
- Review code before merging
- Monitor deployment logs

### Production

- Set up monitoring and alerts
- Regular security updates
- Performance monitoring
- Backup verification

### Environment Management

- Use different environments for dev/staging/prod
- Never use production data in development
- Document all environment variables
- Use secure secret management

---

**Happy Deploying! 🚀**
