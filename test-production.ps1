# Test RENTAMOTO Production Deployment
Write-Host "🚀 Testing RENTAMOTO Production Deployment" -ForegroundColor Green
Write-Host ""

$BackendURL = "https://rentamoto-fs5mftwpr-duttapaarths-projects.vercel.app"
$FrontendURL = "https://rentamoto-frontend-rh1mqb5d2-duttapaarths-projects.vercel.app"

# Test 1: Backend Health
Write-Host "1. Testing Backend Health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$BackendURL/health" -Method GET -TimeoutSec 15 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Backend Health Status: $($healthResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   📊 Response: $($healthResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend Health Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Backend Root
Write-Host ""
Write-Host "2. Testing Backend Root..." -ForegroundColor Yellow
try {
    $rootResponse = Invoke-WebRequest -Uri "$BackendURL/" -Method GET -TimeoutSec 15 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Backend Root Status: $($rootResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   📊 Response: $($rootResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend Root Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: User Signup
Write-Host ""
Write-Host "3. Testing User Signup..." -ForegroundColor Yellow
$signupData = @{
    email = "test@production.com"
    password = "TestPassword123!"
    name = "Production Test User"
    role = "customer"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-WebRequest -Uri "$BackendURL/auth/signup" -Method POST -Body $signupData -ContentType "application/json" -TimeoutSec 20 -ErrorAction SilentlyContinue
    Write-Host "   ✅ Signup Status: $($signupResponse.StatusCode)" -ForegroundColor Green
    Write-Host "   📊 Signup Response: $($signupResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Signup Error: $($_.Exception.Message)" -ForegroundColor Red
}
}

# Summary
Write-Host ""
Write-Host "🔗 Deployment URLs:" -ForegroundColor Cyan
Write-Host "   Backend:  $BackendURL" -ForegroundColor White
Write-Host "   Frontend: $FrontendURL" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open frontend URL in browser" -ForegroundColor White
Write-Host "   2. Try creating an account" -ForegroundColor White
Write-Host "   3. Test bike rentals" -ForegroundColor White
Write-Host "   4. Verify full authentication flow" -ForegroundColor White