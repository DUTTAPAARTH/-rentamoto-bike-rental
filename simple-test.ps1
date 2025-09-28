# RENTAMOTO API Test Script
Write-Host "Testing RENTAMOTO API..." -ForegroundColor Cyan

# Test Health Check
Write-Host "1. Testing Health Endpoint..." -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
    Write-Host "Health Check: SUCCESS ($($health.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Health Check: FAILED" -ForegroundColor Red
    exit 1
}

# Test Bikes Endpoint
Write-Host "2. Testing Bikes Endpoint..." -ForegroundColor Yellow
try {
    $bikes = Invoke-WebRequest -Uri "http://localhost:3001/bikes" -Method GET
    Write-Host "Bikes Endpoint: SUCCESS ($($bikes.StatusCode))" -ForegroundColor Green
    $bikesData = $bikes.Content | ConvertFrom-Json
    Write-Host "Found $($bikesData.bikes.Count) bikes" -ForegroundColor Gray
} catch {
    Write-Host "Bikes Endpoint: FAILED" -ForegroundColor Red
}

Write-Host "API Testing Complete!" -ForegroundColor Cyan