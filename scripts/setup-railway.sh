#!/bin/bash

# Greenupp Railway Setup Script
# This script helps set up Railway deployment

set -e

echo "🚀 Setting up Railway deployment for Greenupp..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if user is logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please log in to Railway..."
    railway login
fi

# Initialize Railway project
echo "📦 Initializing Railway project..."
railway init

# Set up environment variables
echo "🔧 Setting up environment variables..."

# Required variables
read -p "Enter your Neon DATABASE_URL: " DATABASE_URL
read -p "Enter your SESSION_SECRET: " SESSION_SECRET

# Set required variables
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set SESSION_SECRET="$SESSION_SECRET"
railway variables set NODE_ENV=production
railway variables set PORT=5000

# Optional variables
echo "📝 Setting up optional environment variables..."

read -p "Enter your OpenAI API Key (optional): " OPENAI_API_KEY
if [ ! -z "$OPENAI_API_KEY" ]; then
    railway variables set OPENAI_API_KEY="$OPENAI_API_KEY"
fi

read -p "Enter your SendGrid API Key (optional): " SENDGRID_API_KEY
if [ ! -z "$SENDGRID_API_KEY" ]; then
    railway variables set SENDGRID_API_KEY="$SENDGRID_API_KEY"
fi

read -p "Enter your OpenWeather API Key (optional): " OPENWEATHER_API_KEY
if [ ! -z "$OPENWEATHER_API_KEY" ]; then
    railway variables set OPENWEATHER_API_KEY="$OPENWEATHER_API_KEY"
fi

read -p "Enter your Stripe Secret Key (optional): " STRIPE_SECRET_KEY
if [ ! -z "$STRIPE_SECRET_KEY" ]; then
    railway variables set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
fi

read -p "Enter your Stripe Public Key (optional): " VITE_STRIPE_PUBLIC_KEY
if [ ! -z "$VITE_STRIPE_PUBLIC_KEY" ]; then
    railway variables set VITE_STRIPE_PUBLIC_KEY="$VITE_STRIPE_PUBLIC_KEY"
fi

read -p "Enter your Stream API Key (optional): " STREAM_API_KEY
if [ ! -z "$STREAM_API_KEY" ]; then
    railway variables set STREAM_API_KEY="$STREAM_API_KEY"
    railway variables set VITE_STREAM_API_KEY="$STREAM_API_KEY"
fi

read -p "Enter your Stream API Secret (optional): " STREAM_API_SECRET
if [ ! -z "$STREAM_API_SECRET" ]; then
    railway variables set STREAM_API_SECRET="$STREAM_API_SECRET"
fi

read -p "Enter your Anthropic API Key (optional): " ANTHROPIC_API_KEY
if [ ! -z "$ANTHROPIC_API_KEY" ]; then
    railway variables set ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
fi

# Get project info for GitHub secrets
echo "🔑 Getting Railway project info for GitHub secrets..."
PROJECT_ID=$(railway status --json | jq -r '.project.id')
TOKEN=$(railway whoami --json | jq -r '.token')

echo ""
echo "✅ Railway setup complete!"
echo ""
echo "📋 Add these secrets to your GitHub repository:"
echo "   Settings → Secrets and variables → Actions"
echo ""
echo "   RAILWAY_TOKEN=$TOKEN"
echo "   RAILWAY_PROJECT_ID=$PROJECT_ID"
echo ""
echo "🚀 To deploy:"
echo "   1. Push your code to GitHub"
echo "   2. The GitHub Actions workflow will automatically deploy to Railway"
echo "   3. Or deploy manually: railway up"
echo ""
echo "📊 Monitor deployment:"
echo "   - Railway dashboard: https://railway.app"
echo "   - GitHub Actions: Check the Actions tab in your repository"
echo ""
echo "🔍 Useful commands:"
echo "   railway logs          # View application logs"
echo "   railway status        # Check deployment status"
echo "   railway variables     # Manage environment variables"
echo "   railway domains       # Manage custom domains" 