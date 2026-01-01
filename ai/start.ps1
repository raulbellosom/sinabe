# ==============================================
# Sinabe AI - Quick Start Script (Windows PowerShell)
# ==============================================

Write-Host "🚀 Sinabe AI - Quick Start (Windows)" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env from .env.example..." -ForegroundColor Yellow
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        Write-Host "⚠️  No .env.example found. Creating basic .env..." -ForegroundColor Yellow
        @"
MYSQL_HOST=host.docker.internal
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=sinabe_db
USE_OLLAMA=true
OLLAMA_BASE_URL=http://sinabe-ollama:11434
OLLAMA_CHAT_MODEL=llama3.2:3b
USE_QDRANT=false
"@ | Out-File -FilePath ".env" -Encoding UTF8
    }
    Write-Host "⚠️  Please edit .env with your MySQL credentials!" -ForegroundColor Yellow
    Write-Host "   Open .env and configure MYSQL_PASSWORD" -ForegroundColor Yellow
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    exit 1
}

# Check Docker
$dockerExists = Get-Command docker -ErrorAction SilentlyContinue
if (-not $dockerExists) {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker not running"
    }
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Check USE_OLLAMA setting
$envContent = Get-Content ".env" -Raw
$useOllama = $envContent -match "USE_OLLAMA\s*=\s*true"

Write-Host ""
if ($useOllama) {
    Write-Host "🧠 LLM Mode enabled - Starting with Ollama (llama3.2:3b)..." -ForegroundColor Magenta
    Write-Host "   ⚠️  First run will download the model (~2GB)" -ForegroundColor Yellow
    Write-Host "   ⏳ This may take 5-10 minutes on first run" -ForegroundColor Yellow
    Write-Host ""
    docker compose up -d --build
} else {
    Write-Host "⚡ Heuristic Mode - Starting without Ollama (faster)..." -ForegroundColor Green
    docker compose up -d --build sinabe-ai
}

Write-Host ""
Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Health check with retries
$maxRetries = 10
$retryCount = 0
$healthy = $false
$health = $null

while ($retryCount -lt $maxRetries -and -not $healthy) {
    try {
        $health = Invoke-RestMethod -Uri "http://localhost:4080/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($health.ok -eq $true) {
            $healthy = $true
        }
    } catch {
        $retryCount++
        Write-Host "   Waiting... ($retryCount/$maxRetries)" -ForegroundColor Gray
        Start-Sleep -Seconds 3
    }
}

Write-Host ""
if ($healthy) {
    Write-Host "✅ Sinabe AI is running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Service Status:" -ForegroundColor Cyan
    Write-Host "   MySQL:  $($health.mysql)" -ForegroundColor White
    Write-Host "   Ollama: $($health.ollama)" -ForegroundColor White
    Write-Host "   Qdrant: $($health.qdrant)" -ForegroundColor White
    
    Write-Host ""
    Write-Host "🌐 Endpoints:" -ForegroundColor Cyan
    Write-Host "   - Health: http://localhost:4080/health" -ForegroundColor White
    Write-Host "   - Query:  POST http://localhost:4080/ai/query" -ForegroundColor White
    Write-Host "   - Config: http://localhost:4080/ai/config" -ForegroundColor White
    
    Write-Host ""
    Write-Host "📖 Example queries:" -ForegroundColor Yellow
    Write-Host '   curl -X POST http://localhost:4080/ai/query -H "Content-Type: application/json" -d "{\"q\":\"cuantos inventarios hay\"}"' -ForegroundColor Gray
    Write-Host '   curl -X POST http://localhost:4080/ai/query -H "Content-Type: application/json" -d "{\"q\":\"laptops por marca\"}"' -ForegroundColor Gray
} else {
    Write-Host "❌ Service health check failed!" -ForegroundColor Red
    Write-Host "📋 Checking logs..." -ForegroundColor Yellow
    docker logs sinabe-ai --tail 50
}

Write-Host ""
Write-Host "📌 Useful commands:" -ForegroundColor Cyan
Write-Host "   docker logs sinabe-ai -f     # Ver logs en tiempo real" -ForegroundColor Gray
Write-Host "   docker compose down          # Detener servicio" -ForegroundColor Gray
Write-Host "   docker compose restart       # Reiniciar servicio" -ForegroundColor Gray
if ($useOllama) {
    Write-Host "   docker logs sinabe-ollama -f # Ver logs de Ollama" -ForegroundColor Gray
    Write-Host "   curl http://localhost:11434/api/tags  # Ver modelos cargados" -ForegroundColor Gray
}
Write-Host ""
