# Deployment Guide - Plant Disease Diagnosis & Treatment System

This guide provides step-by-step instructions for deploying the GreenUpp Platform's plant disease diagnosis and treatment system to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements

- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 14.0 or higher
- **Redis**: 6.0 or higher (for session storage)
- **Memory**: Minimum 2GB RAM
- **Storage**: Minimum 10GB available space

### Required API Keys

- **OpenAI API Key**: For AI-powered plant disease analysis
- **Database Connection**: PostgreSQL connection string
- **Session Secret**: Secure random string for session encryption

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/greenupp

# Session Configuration
SESSION_SECRET=your-super-secure-session-secret-here

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Server Configuration
PORT=3000
NODE_ENV=development

# Redis Configuration (optional, for production)
REDIS_URL=redis://localhost:6379

# Logging Configuration
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security Configuration
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

### 4. Generate Session Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Database Setup

### 1. PostgreSQL Installation

#### Ubuntu/Debian

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### macOS (using Homebrew)

```bash
brew install postgresql
brew services start postgresql
```

#### Windows

Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE greenupp;
CREATE USER greenupp_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE greenupp TO greenupp_user;
\q
```

### 3. Run Database Migrations

```bash
# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Seed Initial Data (Optional)

```bash
# Create sample treatment products
npm run db:seed
```

---

## Local Development

### 1. Start Development Server

```bash
# Start both client and server
npm run dev

# Or start separately
npm run dev:client  # Frontend on port 3001
npm run dev:server  # Backend on port 3000
```

### 2. Access the Application

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Database Studio**: http://localhost:3000/db-studio

### 3. Development Tools

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Formatting
npm run format

# Testing
npm test
npm run test:watch
```

---

## Production Deployment

### 1. Build the Application

```bash
# Install production dependencies
npm ci --only=production

# Build frontend
npm run build

# Build backend
npm run build:server
```

### 2. Environment Configuration

Create production `.env` file:

```env
# Production Environment
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://username:password@host:5432/greenupp?sslmode=require

# Session
SESSION_SECRET=your-production-session-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Redis (recommended for production)
REDIS_URL=redis://your-redis-host:6379

# Security
CORS_ORIGIN=https://your-domain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=warn
LOG_FILE=/var/log/greenupp/app.log

# SSL (if using reverse proxy)
TRUST_PROXY=true
```

### 3. Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'greenupp',
    script: 'dist/server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/greenupp/err.log',
    out_file: '/var/log/greenupp/out.log',
    log_file: '/var/log/greenupp/combined.log',
    time: true
  }]
};
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Using Systemd

```bash
# Create systemd service file
sudo tee /etc/systemd/system/greenupp.service << EOF
[Unit]
Description=GreenUpp Plant Disease Diagnosis System
After=network.target postgresql.service

[Service]
Type=simple
User=greenupp
WorkingDirectory=/opt/greenupp
ExecStart=/usr/bin/node dist/server/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable greenupp
sudo systemctl start greenupp
```

### 4. Reverse Proxy (Nginx)

```nginx
# /etc/nginx/sites-available/greenupp
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Client max body size for image uploads
    client_max_body_size 10M;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files
    location / {
        root /opt/greenupp/dist/client;
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/api/health;
        access_log off;
    }
}
```

### 5. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## Docker Deployment

### 1. Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S greenupp -u 1001

# Change ownership
RUN chown -R greenupp:nodejs /app
USER greenupp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "dist/server/index.js"]
```

### 2. Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://greenupp:password@db:5432/greenupp
      - SESSION_SECRET=${SESSION_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped
    volumes:
      - ./logs:/app/logs

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=greenupp
      - POSTGRES_USER=greenupp
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### 3. Deploy with Docker

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## Cloud Deployment

### 1. AWS Deployment

#### Using AWS ECS

```bash
# Create ECR repository
aws ecr create-repository --repository-name greenupp

# Build and push image
docker build -t greenupp .
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-west-2.amazonaws.com
docker tag greenupp:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/greenupp:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/greenupp:latest
```

#### Using AWS App Runner

```yaml
# apprunner.yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm install
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
  env:
    - name: NODE_ENV
      value: production
    - name: DATABASE_URL
      value: "{{resolve:secretsmanager:greenupp-db-url}}"
    - name: OPENAI_API_KEY
      value: "{{resolve:secretsmanager:openai-api-key}}"
```

### 2. Google Cloud Platform

#### Using Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/greenupp
gcloud run deploy greenupp \
  --image gcr.io/PROJECT_ID/greenupp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### 3. Azure Deployment

#### Using Azure Container Instances

```bash
# Build and push to Azure Container Registry
az acr build --registry myregistry --image greenupp .
az container create \
  --resource-group myResourceGroup \
  --name greenupp \
  --image myregistry.azurecr.io/greenupp:latest \
  --dns-name-label greenupp \
  --ports 3000
```

---

## Monitoring & Maintenance

### 1. Application Monitoring

#### Health Checks

```bash
# Check application health
curl http://localhost:3000/api/health

# Check database connectivity
curl http://localhost:3000/api/health/db

# Check OpenAI API connectivity
curl http://localhost:3000/api/health/openai
```

#### Log Monitoring

```bash
# View application logs
tail -f logs/app.log

# Monitor error rates
grep "ERROR" logs/app.log | wc -l

# Monitor API response times
grep "ms" logs/app.log | awk '{print $NF}' | sort -n
```

### 2. Database Maintenance

```bash
# Database backup
pg_dump greenupp > backup_$(date +%Y%m%d).sql

# Database optimization
psql greenupp -c "VACUUM ANALYZE;"

# Check database size
psql greenupp -c "SELECT pg_size_pretty(pg_database_size('greenupp'));"
```

### 3. Performance Monitoring

#### Using PM2

```bash
# Monitor application metrics
pm2 monit

# View detailed statistics
pm2 show greenupp

# Restart application
pm2 restart greenupp
```

#### Using Prometheus/Grafana

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "greenupp"
    static_configs:
      - targets: ["localhost:3000"]
    metrics_path: "/api/metrics"
```

### 4. Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Database backup
pg_dump $DATABASE_URL > backups/db_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf backups/app_$(date +%Y%m%d_%H%M%S).tar.gz \
  --exclude=node_modules \
  --exclude=logs \
  --exclude=.git \
  .

# Upload to cloud storage
aws s3 cp backups/ s3://my-backup-bucket/greenupp/ --recursive

# Clean old backups (keep 30 days)
find backups/ -name "*.sql" -mtime +30 -delete
find backups/ -name "*.tar.gz" -mtime +30 -delete
```

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Issues

```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-*.log

# Restart database service
sudo systemctl restart postgresql
```

#### 2. OpenAI API Issues

```bash
# Test OpenAI API key
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Check API usage
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/usage
```

#### 3. Memory Issues

```bash
# Check memory usage
free -h

# Check Node.js memory usage
ps aux | grep node

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 4. Port Conflicts

```bash
# Check port usage
sudo netstat -tlnp | grep :3000

# Kill process using port
sudo fuser -k 3000/tcp
```

### Performance Optimization

#### 1. Database Optimization

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_plant_analyses_user_id ON plant_analyses(user_id);
CREATE INDEX idx_plant_analyses_analysis_date ON plant_analyses(analysis_date);
CREATE INDEX idx_treatment_plans_user_id ON treatment_plans(user_id);

-- Analyze table statistics
ANALYZE plant_analyses;
ANALYZE treatment_plans;
```

#### 2. Application Optimization

```javascript
// Enable compression
app.use(compression());

// Cache static assets
app.use(
  express.static("dist/client", {
    maxAge: "1y",
    etag: true,
  })
);

// Rate limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
```

#### 3. Image Processing Optimization

```javascript
// Optimize image processing
const sharp = require("sharp");

async function optimizeImage(buffer) {
  return sharp(buffer)
    .resize(800, 600, { fit: "inside" })
    .jpeg({ quality: 80 })
    .toBuffer();
}
```

### Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure session configuration
- [ ] Implement rate limiting
- [ ] Validate all user inputs
- [ ] Use parameterized queries
- [ ] Set secure headers
- [ ] Regular security updates
- [ ] Monitor for suspicious activity
- [ ] Backup data regularly
- [ ] Use environment variables for secrets

---

## Support

For deployment support:

1. Check the [API Documentation](./API_DOCUMENTATION.md)
2. Review the [README](../README.md)
3. Create an issue in the GitHub repository
4. Check the application logs for error details
5. Verify environment variable configuration

### Emergency Contacts

- **Database Issues**: Check PostgreSQL logs and connectivity
- **API Issues**: Verify OpenAI API key and quota
- **Performance Issues**: Monitor system resources and application metrics
- **Security Issues**: Review logs for suspicious activity and update dependencies
