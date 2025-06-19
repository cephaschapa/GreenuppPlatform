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

```bash
# Set all environment variables
railway variables set DATABASE_URL=your_neon_database_url
railway variables set SESSION_SECRET=your_session_secret
railway variables set NODE_ENV=production
# ... add all other variables
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
Node.js 18+
npm or yarn
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

#### 1. Build Failures

```bash
# Check build logs
railway logs

# Verify environment variables
railway variables list

# Test build locally
npm run build
```

#### 2. Database Connection Issues

```bash
# Verify DATABASE_URL
railway variables get DATABASE_URL

# Test database connection
npm run db:push
```

#### 3. Health Check Failures

```bash
# Check application logs
railway logs

# Verify port configuration
# Ensure PORT=5000 is set
```

#### 4. GitHub Actions Failures

- Check Actions tab for detailed error messages
- Verify secrets are properly configured
- Ensure branch protection rules are set correctly

### Rollback Strategy

```bash
# Railway automatic rollback
# If health checks fail, Railway automatically rolls back

# Manual rollback
railway rollback

# Check deployment history
railway deployments
```

## 🔒 Security Considerations

### Environment Variables

- Never commit `.env` files
- Use Railway's encrypted variables
- Rotate secrets regularly

### Database Security

- Use connection pooling
- Enable SSL connections
- Regular backups

### Application Security

- Keep dependencies updated
- Regular security audits
- Monitor for vulnerabilities

## 📊 Performance Optimization

### Build Optimization

- Multi-stage Docker builds
- Dependency caching
- Bundle size analysis

### Runtime Optimization

- Node.js memory limits
- Database query optimization
- CDN for static assets

## 🔄 Continuous Improvement

### Metrics to Monitor

- Deployment success rate
- Build times
- Application response times
- Error rates
- User experience metrics

### Regular Maintenance

- Weekly dependency updates
- Monthly security audits
- Quarterly performance reviews

## 📞 Support

### Getting Help

1. Check Railway documentation
2. Review GitHub Actions logs
3. Check application logs
4. Contact team for issues

### Useful Commands

```bash
# Railway
railway status          # Check deployment status
railway logs            # View application logs
railway variables       # Manage environment variables
railway domains         # Manage custom domains

# GitHub Actions
# Check Actions tab in repository for workflow status
```

---

**Happy Deploying! 🚀**
