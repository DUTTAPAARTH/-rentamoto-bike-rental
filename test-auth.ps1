# Test authentication endpoints

# Test signup endpoint
$signupBody = @{
    email = "test@example.com"
    password = "test123"
    name = "Test User"
    role = "customer"
} | ConvertTo-Json

Write-Host "Testing signup endpoint..."
try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "Signup Response:"
    $signupResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Signup Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body:" $errorBody
    }
}

Write-Host "`n---`n"

# Test login endpoint
$loginBody = @{
    email = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Write-Host "Testing login endpoint..."
try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Login Response:"
    $loginResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Login Error:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body:" $errorBody
    }
}