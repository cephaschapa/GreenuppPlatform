# Railway Environment Variables Setup Script
# This script helps you set up the required environment variables for Railway deployment

Write-Host "🚀 Setting up Railway Environment Variables" -ForegroundColor Green
Write-Host ""

# Required environment variables
$requiredVars = @{
    "DATABASE_URL" = "postgresql://username:password@localhost:5432/greenupp"
    "SESSION_SECRET" = "your-super-secret-session-key-change-this-in-production"
    "OPENAI_API_KEY" = "sk-your-openai-api-key"
    "SENDGRID_API_KEY" = "SG.your-sendgrid-api-key"
    "OPENWEATHER_API_KEY" = "your-openweather-api-key"
}

# Optional environment variables
$optionalVars = @{
    "STRIPE_SECRET_KEY" = "sk_test_your-stripe-secret-key"
    "VITE_STRIPE_PUBLIC_KEY" = "pk_test_your-stripe-public-key"
    "STREAM_API_KEY" = "your-stream-api-key"
    "STREAM_API_SECRET" = "your-stream-api-secret"
    "VITE_STREAM_API_KEY" = "your-stream-api-key"
    "ANTHROPIC_API_KEY" = "sk-ant-your-anthropic-api-key"
}

Write-Host "📋 Required Environment Variables:" -ForegroundColor Yellow
Write-Host "These must be set for the application to work properly:" -ForegroundColor Gray
Write-Host ""

foreach ($var in $requiredVars.GetEnumerator()) {
    Write-Host "  $($var.Key)=$($var.Value)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Optional Environment Variables:" -ForegroundColor Yellow
Write-Host "These enable additional features:" -ForegroundColor Gray
Write-Host ""

foreach ($var in $optionalVars.GetEnumerator()) {
    Write-Host "  $($var.Key)=$($var.Value)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🔧 To set these in Railway:" -ForegroundColor Green
Write-Host "1. Go to your Railway project dashboard" -ForegroundColor White
Write-Host "2. Click on your service" -ForegroundColor White
Write-Host "3. Go to the 'Variables' tab" -ForegroundColor White
Write-Host "4. Add each variable with its corresponding value" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Important Notes:" -ForegroundColor Red
Write-Host "- DATABASE_URL: Must be a valid PostgreSQL connection string" -ForegroundColor White
Write-Host "- SESSION_SECRET: Should be a long, random string for security" -ForegroundColor White
Write-Host "- API Keys: Get these from their respective service providers" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Minimum Setup for Basic Functionality:" -ForegroundColor Green
Write-Host "At minimum, you need to set:" -ForegroundColor White
Write-Host "  DATABASE_URL" -ForegroundColor Cyan
Write-Host "  SESSION_SECRET" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Setup guide completed!" -ForegroundColor Green 