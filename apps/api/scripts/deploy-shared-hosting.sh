#!/bin/bash

# Afrihost Gold Home Linux Hosting Deployment Script
echo "🚀 Deploying NextGenOutreach to Afrihost Gold Home..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# 2. Build the application
echo "🔨 Building application..."
npm run build

# 3. Setup logs directory
echo "📝 Setting up logs..."
mkdir -p logs

# 4. Setup PM2 (if not available)
if ! command -v pm2 &> /dev/null; then
    echo "🔧 Installing PM2..."
    npm install -g pm2
fi

# 5. Start application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save

# 6. Setup PM2 startup (for auto-restart)
echo "🔧 Setting up auto-restart..."
pm2 startup
echo "⚠️  Run the command above to enable auto-restart"

echo "✅ Deployment complete!"
echo "🌐 Your API is running on port 3000"
echo "📊 Monitor with: pm2 monit"
echo "📋 View logs: pm2 logs"
