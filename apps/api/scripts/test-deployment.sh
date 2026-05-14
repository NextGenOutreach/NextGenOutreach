#!/bin/bash

echo "🧪 Testing NextGenOutreach deployment..."

# Test health endpoint
echo "📊 Testing health endpoint..."
curl -s https://api.yourdomain.com/health | jq .

# Test authentication
echo "🔐 Testing authentication..."
curl -s -X POST https://api.yourdomain.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"tshepo@nextgenoutreach.co.za","password":"NextGen2026!"}' | jq .

# Test marketplace
echo "🏪 Testing marketplace..."
curl -s https://api.yourdomain.com/v1/reps | jq .

echo "✅ All tests completed!"
