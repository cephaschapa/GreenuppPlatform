# Health Check Verification Guide

This guide helps you verify that health check endpoints are working correctly in production and troubleshoot any issues.

## 🔍 Current Health Check Configuration

### Railway Configuration

- **Health Check Path**: `/api/health`
- **Timeout**: 30 seconds (railway.toml) / 300 seconds (railway.json)
- **Expected Response**: HTTP 200 with JSON status

### Available Endpoints

1. **`/api/health`** - Fast health check (no database dependency)

   - Used by Railway for deployment health checks
   - Should respond in < 100ms
   - Returns basic server status

2. **`/api/health/db`** - Database health check

   - Tests database connectivity
   - Has 5-second timeout
   - Returns database status

3. **`/api/health/detailed`** - Comprehensive health check

   - Tests all system components
   - Returns detailed status information
   - Includes memory usage

4. **`/api/test`** - Simple test endpoint
   - Basic server response test
   - Useful for debugging routing issues

## 🧪 Testing Health Checks Locally

### 1. Start the Server

```bash
# Build the application
npm run build

# Start in production mode
npm start
```

### 2. Test Health Check Endpoints

```bash
# Test all health check endpoints
npm run test:health

# Or test manually with curl
curl http://localhost:5000/api/health
curl http://localhost:5000/api/health/db
curl http://localhost:5000/api/health/detailed
curl http://localhost:5000/api/test
```

### 3. Expected Responses

#### `/api/health` Response

```json
{
  "status": "healthy",
  "timestamp": "2025-06-19T15:40:50.405Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "requestId": "abc123",
  "responseTime": 5
}
```

#### `/api/health/db` Response

```json
{
  "status": "healthy",
  "timestamp": "2025-06-19T15:40:50.405Z",
  "database": "connected",
  "requestId": "def456",
  "responseTime": 45
}
```

## 🚀 Production Verification

### 1. Check Railway Logs

```bash
# View real-time logs
railway logs

# View logs for specific service
railway logs --service greenupp-platform

# Follow logs (real-time)
railway logs --follow
```

### 2. Test Production Endpoints

```bash
# Get your Railway URL
railway status

# Test health check endpoints
curl https://your-app.railway.app/api/health
curl https://your-app.railway.app/api/health/db
curl https://your-app.railway.app/api/test
```

### 3. Monitor Health Check Logs

Look for these log patterns in Railway logs:

#### Successful Health Check

```
🔍 [abc123] Health check request received: {
  method: 'GET',
  path: '/health',
  url: '/api/health',
  headers: { 'user-agent': 'Railway/1.0', ... },
  timestamp: '2025-06-19T15:40:50.405Z',
  environment: 'production'
}
✅ [abc123] Health check successful: {
  status: 'healthy',
  timestamp: '2025-06-19T15:40:50.405Z',
  uptime: 123.456,
  environment: 'production',
  version: '1.0.0',
  requestId: 'abc123',
  responseTime: 5
}
```

#### Failed Health Check

```
❌ [def456] Health check failed: {
  error: 'Database timeout',
  responseTime: 5000,
  timestamp: '2025-06-19T15:40:50.405Z'
}
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Health Check Timeout

**Symptoms**: Railway shows "service unavailable" or deployment fails

**Causes**:

- Database connection issues
- Server startup problems
- Authentication middleware blocking requests

**Solutions**:

```bash
# Check Railway logs
railway logs

# Verify database connection
railway variables get DATABASE_URL

# Test database connectivity
curl https://your-app.railway.app/api/health/db
```

#### 2. Wrong Health Check Path

**Symptoms**: Health checks never reach your endpoint

**Verification**:

```bash
# Check Railway configuration
cat railway.json
cat railway.toml

# Verify the path is correct
# Should be: "healthcheckPath": "/api/health"
```

#### 3. Authentication Middleware Blocking

**Symptoms**: Health checks return 401 Unauthorized

**Solution**: Health check routes are already configured to bypass authentication middleware in `server/routes.ts`:

```typescript
// Set up health check routes FIRST (no auth required) - BEFORE authentication
app.use("/api", healthRoutes);
```

#### 4. Server Not Starting

**Symptoms**: No health check logs appear

**Debugging**:

```bash
# Check Railway logs for startup errors
railway logs

# Verify environment variables
railway variables list

# Check if required variables are set
railway variables get DATABASE_URL
railway variables get SESSION_SECRET
```

### Debugging Steps

#### 1. Enable Debug Mode

Set `DEBUG_APP=true` in Railway variables to get more detailed logs.

#### 2. Check Environment Variables

```bash
# List all variables
railway variables list

# Check specific variables
railway variables get DATABASE_URL
railway variables get SESSION_SECRET
```

#### 3. Test Database Connection

```bash
# Test database health check
curl https://your-app.railway.app/api/health/db

# Check database logs
railway logs | grep -i database
```

#### 4. Verify Server Startup

Look for these log messages in Railway logs:

```
✅ Database connection successful
2025-06-19 17:40:50:4050 info: Server running on port 5000
```

## 📊 Monitoring Health Checks

### Railway Dashboard

1. Go to your Railway project dashboard
2. Click on your service
3. Check the "Deployments" tab for health check status
4. Monitor the "Metrics" tab for response times

### Custom Monitoring

You can set up external monitoring using:

- UptimeRobot
- Pingdom
- Custom scripts

Example monitoring script:

```bash
#!/bin/bash
URL="https://your-app.railway.app/api/health"
RESPONSE=$(curl -s -w "%{http_code}" $URL)
HTTP_CODE="${RESPONSE: -3}"
BODY="${RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Health check passed: $HTTP_CODE"
    echo "Response: $BODY"
else
    echo "❌ Health check failed: $HTTP_CODE"
    echo "Response: $BODY"
    exit 1
fi
```

## 🎯 Best Practices

### 1. Keep Health Checks Fast

- `/api/health` should respond in < 100ms
- Avoid database queries in basic health check
- Use timeouts for database health checks

### 2. Comprehensive Logging

- Log all health check requests with unique IDs
- Include response times
- Log failures with detailed error information

### 3. Proper Error Handling

- Return appropriate HTTP status codes
- Include meaningful error messages
- Don't expose sensitive information

### 4. Regular Testing

- Test health checks before deployment
- Monitor health check performance
- Set up alerts for failures

## 🚨 Emergency Procedures

### If Health Checks Fail in Production

1. **Immediate Actions**:

   ```bash
   # Check Railway logs
   railway logs --follow

   # Check service status
   railway status

   # Verify environment variables
   railway variables list
   ```

2. **Quick Fixes**:

   - Restart the service: `railway up`
   - Check database connectivity
   - Verify all required environment variables are set

3. **Rollback if Needed**:

   ```bash
   # List recent deployments
   railway deployments

   # Rollback to previous deployment
   railway rollback <deployment-id>
   ```

## 📞 Support

If you're still having issues:

1. Check Railway documentation: https://docs.railway.app/
2. Review Railway logs for specific error messages
3. Verify all environment variables are correctly set
4. Test health checks locally before deploying

---

**Remember**: Health checks are critical for Railway deployments. Always test them locally before deploying to production!
