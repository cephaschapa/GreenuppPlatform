# SendGrid Sender Identity Setup Guide

## Issue

You're getting this error when sending emails:

```
550 The from address does not match a verified Sender Identity. Mail cannot be sent until this error is resolved.
```

## Solution

SendGrid requires you to verify the sender identity (email address) before you can send emails from it.

## Steps to Fix

### Option 1: Single Sender Verification (Recommended for development)

1. **Go to SendGrid Dashboard**

   - Log in to [SendGrid](https://app.sendgrid.com/)
   - Navigate to **Settings** > **Sender Authentication**

2. **Verify a Single Sender**

   - Click **Verify a Single Sender**
   - Enter the email address you want to send from (e.g., `noreply@greenupp.earth` or your Gmail)
   - Fill in the required information:
     - From Name: `GreenUpp`
     - From Email: Your verified email (must be an email you control)
     - Reply To: Same as From Email
     - Company Address, City, State, ZIP, Country

3. **Check Your Email**

   - SendGrid will send a verification email
   - Click the verification link

4. **Update Environment Variables**
   ```bash
   SMTP_FROM=your-verified-email@example.com
   ```

### Option 2: Domain Authentication (Recommended for production)

1. **Go to SendGrid Dashboard**

   - Navigate to **Settings** > **Sender Authentication**

2. **Authenticate Your Domain**

   - Click **Authenticate Your Domain**
   - Enter your domain (e.g., `greenupp.earth`)
   - Follow the DNS setup instructions

3. **Update DNS Records**

   - Add the provided CNAME records to your domain's DNS
   - Wait for verification (can take up to 48 hours)

4. **Update Environment Variables**
   ```bash
   SMTP_FROM=noreply@greenupp.earth
   ```

## Current System Configuration

The alert system has been updated to use your verified `SMTP_FROM` environment variable:

- ✅ **Pest Alerts**: `GreenUpp Pest Alerts <your-verified-email>`
- ✅ **Weather Alerts**: `GreenUpp Weather Alerts <your-verified-email>`
- ✅ **Emergency Alerts**: `GreenUpp Emergency Alerts <your-verified-email>`
- ✅ **General Announcements**: `GreenUpp Announcements <your-verified-email>`

## Testing

After setting up the verified sender:

1. **Restart your server** to load the new environment variables
2. **Test the alert system** through the admin dashboard
3. **Check the logs** to ensure no more 550 errors

## Quick Fix for Development

If you want to test immediately, you can use your Gmail address:

1. **Verify your Gmail** in SendGrid as a single sender
2. **Set environment variable**:
   ```bash
   SMTP_FROM=your-gmail@gmail.com
   ```
3. **Restart the server**

## Notes

- The display name (e.g., "GreenUpp Pest Alerts") can be anything
- Only the email address part needs to be verified in SendGrid
- For production, domain authentication is more professional and reliable
- Single sender verification is fine for development and testing

## Troubleshooting

If you still get errors:

1. Double-check the email address in `SMTP_FROM` matches exactly what you verified in SendGrid
2. Make sure you clicked the verification link in the email SendGrid sent
3. Restart your server after changing environment variables
4. Check SendGrid dashboard to confirm the sender is verified (green checkmark)
