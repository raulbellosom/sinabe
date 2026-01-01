#!/bin/bash

# ==============================================
# Sinabe AI - Quick Start Script
# ==============================================

set -e

echo "🚀 Sinabe AI - Quick Start"
echo "=========================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your MySQL credentials before continuing!"
    echo "   Then run this script again."
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "🔨 Building and starting Sinabe AI..."
docker compose up -d --build

echo ""
echo "⏳ Waiting for service to start..."
sleep 5

echo ""
echo "🔍 Checking health..."
HEALTH=$(curl -s http://localhost:4080/health || echo '{"ok":false}')

if echo "$HEALTH" | grep -q '"ok":true'; then
    echo "✅ Sinabe AI is running!"
    echo ""
    echo "📊 Service Status:"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
    echo ""
    echo "🌐 Endpoints:"
    echo "   - Health: http://localhost:4080/health"
    echo "   - Query:  POST http://localhost:4080/ai/query"
    echo "   - Config: http://localhost:4080/ai/config"
    echo ""
    echo "📖 Example query:"
    echo '   curl -X POST http://localhost:4080/ai/query \'
    echo '     -H "Content-Type: application/json" \'
    echo '     -d '\''{"q":"Cuántos inventarios hay por ubicación"}'\'''
else
    echo "❌ Service health check failed!"
    echo "📋 Checking logs..."
    docker logs sinabe-ai --tail 50
fi
