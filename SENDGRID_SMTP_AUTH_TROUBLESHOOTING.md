# SendGrid SMTP Authentication Troubleshooting

## Current Error

```
535 Authentication failed: Bad username / password
```

This means your SMTP credentials are incorrect or not properly configured.

## SendGrid SMTP Configuration

### Correct SMTP Settings for SendGrid:

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_actual_sendgrid_api_key_here
SMTP_FROM=your_verified_email@example.com
```

**Important Notes:**

- ✅ **SMTP_USER** must be exactly `apikey` (not your SendGrid username)
- ✅ **SMTP_PASS** must be your SendGrid API Key (not your SendGrid password)
- ✅ **SMTP_HOST** must be `smtp.sendgrid.net`
- ✅ **SMTP_PORT** should be `587` (or `465` for SSL)

## How to Get Your SendGrid API Key

### Step 1: Create an API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Choose **Restricted Access** or **Full Access**
   - For **Restricted Access**: Enable "Mail Send" permissions
5. Give it a name like "GreenUpp Platform SMTP"
6. Click **Create & View**
7. **Copy the API key immediately** (you won't see it again!)

### Step 2: Update Your Environment Variables

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_long_api_key_starting_with_SG
SMTP_FROM=your_verified_email@example.com
```

## Alternative: Gmail SMTP (If you prefer Gmail)

If you want to use Gmail instead of SendGrid:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_app_password_not_regular_password
SMTP_FROM=your_gmail@gmail.com
```

**For Gmail, you need an App Password:**

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account Settings → Security → App Passwords
3. Generate an app password for "Mail"
4. Use that 16-character password (not your regular Gmail password)

## Testing Your Configuration

After updating your environment variables:

1. **Restart your server**
2. **Test with a simple email endpoint**
3. **Check the logs for authentication success**

## Common Mistakes

❌ **Wrong SMTP_USER**: Using your SendGrid username instead of `apikey`
❌ **Wrong SMTP_PASS**: Using your SendGrid password instead of API key
❌ **Old API Key**: Using a deleted or expired API key
❌ **Wrong Host**: Using `smtp.gmail.com` with SendGrid credentials
❌ **Permissions**: API key doesn't have "Mail Send" permissions

## Quick Test

You can test your SMTP settings with a simple curl command:

```bash
# Test SendGrid SMTP authentication
curl -X POST https://api.sendgrid.com/v3/mail/send \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "personalizations": [{"to": [{"email": "test@example.com"}]}],
    "from": {"email": "your_verified_email@example.com"},
    "subject": "Test",
    "content": [{"type": "text/plain", "value": "Test"}]
  }'
```

## Next Steps

1. **Check your current environment variables**
2. **Create a new SendGrid API key** if needed
3. **Update your `.env` file** with correct credentials
4. **Restart your server**
5. **Test the alert system**

## Environment Variable Format

Make sure your `.env` file looks like this:

```env
# SendGrid SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.your_sendgrid_api_key_here_very_long_string
SMTP_FROM=your_verified_sender@example.com

# Other variables...
```

Remember to restart your server after making changes!
