# SMTP Email Configuration Guide

The app uses **Google SMTP (Gmail)** by default. If `SMTP_HOST` is not set, it defaults to `smtp.gmail.com` and port `587`.

## Gmail SMTP Setup (Default)

### Step 1: Enable 2-Factor Authentication

1. Go to your [Google Account](https://myaccount.google.com) → Security
2. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password

1. Go to Google Account → Security → 2-Step Verification
2. Scroll to **App passwords**
3. Generate a new app password for **Mail**
4. Copy the 16-character password (no spaces)

### Step 3: Set Environment Variables

In `.env` (or your deployment env):

```env
# Optional: defaults to Gmail if omitted
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Required
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM=GreenUpp <your-email@gmail.com>
```

If you only set `SMTP_USER` and `SMTP_PASS`, the server still defaults to `smtp.gmail.com` and port `587`.

## Alternative SMTP Providers

### SendGrid

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
SMTP_FROM=GreenUpp <noreply@yourdomain.com>
```

### Mailgun

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASS=your-mailgun-password
SMTP_FROM=GreenUpp <noreply@yourdomain.com>
```

### AWS SES

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-access-key
SMTP_PASS=your-ses-secret-key
SMTP_FROM=GreenUpp <noreply@yourdomain.com>
```

## Testing Email Configuration

After setting up SMTP, test with:

```bash
curl -X POST http://localhost:5000/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

## Production Deployment

For Railway deployment, set environment variables in the Railway dashboard:

1. Go to your Railway project
2. Click on "Variables" tab
3. Add each SMTP variable
4. Redeploy the application

