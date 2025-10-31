Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Firebase Setup Instructions" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Get Firebase Service Account Key" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "1. Go to https://console.firebase.google.com/" -ForegroundColor White
Write-Host "2. Create or select your project" -ForegroundColor White
Write-Host "3. Enable Firestore Database (Build -> Firestore Database)" -ForegroundColor White
Write-Host "4. Go to Project Settings (gear icon) -> Service Accounts" -ForegroundColor White
Write-Host "5. Click 'Generate new private key'" -ForegroundColor White
Write-Host "6. Save the file as 'serviceAccountKey.json' in the backend folder" -ForegroundColor White
Write-Host ""

$keyPath = ".\backend\serviceAccountKey.json"
if (Test-Path $keyPath) {
    Write-Host "✓ Service account key found!" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Step 2: Initialize Database" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    $response = Read-Host "Do you want to create admin user and sample products? (y/n)"
    
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "Creating admin user..." -ForegroundColor Cyan
        Set-Location backend
        node createAdmin.js
        
        Write-Host ""
        Write-Host "Creating sample products..." -ForegroundColor Cyan
        node createSampleProducts.js
        
        Set-Location ..
        
        Write-Host ""
        Write-Host "✓ Database initialized successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Admin Credentials:" -ForegroundColor Yellow
        Write-Host "Email: admin@example.com" -ForegroundColor White
        Write-Host "Password: admin123" -ForegroundColor White
    }
} else {
    Write-Host "✗ Service account key NOT found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please complete Step 1 above and save 'serviceAccountKey.json' in the backend folder." -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "For more details, see:" -ForegroundColor Cyan
Write-Host "backend/FIREBASE_SETUP.md" -ForegroundColor White
Write-Host "==================================" -ForegroundColor Cyan
