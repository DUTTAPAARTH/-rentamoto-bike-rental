# PowerShell API Test Commands for RENTAMOTO
# Use these commands to test your API

Write-Host "🚀 RENTAMOTO API Testing Commands" -ForegroundColor Cyan
Write-Host "Copy and paste these commands one by one:" -ForegroundColor White

Write-Host "`n1. Test Health Endpoint:" -ForegroundColor Yellow
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/health'" -ForegroundColor Green

Write-Host "`n2. Get All Bikes:" -ForegroundColor Yellow
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/bikes'" -ForegroundColor Green

Write-Host "`n3. Register a New User:" -ForegroundColor Yellow
Write-Host "`$body = @{email='test@example.com'; password='password123'; name='Test User'} | ConvertTo-Json" -ForegroundColor Green
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/auth/signup' -Method POST -ContentType 'application/json' -Body `$body" -ForegroundColor Green

Write-Host "`n4. Login User:" -ForegroundColor Yellow
Write-Host "`$loginBody = @{email='test@example.com'; password='password123'} | ConvertTo-Json" -ForegroundColor Green
Write-Host "`$response = Invoke-WebRequest -Uri 'http://localhost:3001/auth/login' -Method POST -ContentType 'application/json' -Body `$loginBody" -ForegroundColor Green
Write-Host "`$token = (`$response.Content | ConvertFrom-Json).token" -ForegroundColor Green

Write-Host "`n5. Get User's Bookings (requires token from step 4):" -ForegroundColor Yellow
Write-Host "`$headers = @{Authorization = 'Bearer ' + `$token}" -ForegroundColor Green
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/my-bookings' -Headers `$headers" -ForegroundColor Green

Write-Host "`n6. Rent a Bike (requires token):" -ForegroundColor Yellow
Write-Host "`$rentBody = @{bike_id=1} | ConvertTo-Json" -ForegroundColor Green
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/rent' -Method POST -ContentType 'application/json' -Body `$rentBody -Headers `$headers" -ForegroundColor Green

Write-Host "`n📝 Quick Test:" -ForegroundColor White
Write-Host "Run this first to verify everything is working:" -ForegroundColor Gray
Write-Host "Invoke-WebRequest -Uri 'http://localhost:3001/health'" -ForegroundColor Cyan