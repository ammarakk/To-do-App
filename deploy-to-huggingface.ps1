# Hugging Face Deployment Script
# Run this script to prepare backend for Hugging Face Spaces

Write-Host "🚀 Preparing backend for Hugging Face Spaces deployment..." -ForegroundColor Green

# Create HF deployment directory
$hfDir = "huggingface-deploy"
if (Test-Path $hfDir) {
    Remove-Item -Recurse -Force $hfDir
}
New-Item -ItemType Directory -Path $hfDir | Out-Null

Write-Host "📁 Copying backend files..." -ForegroundColor Yellow

# Copy necessary files
Copy-Item "backend\Dockerfile" -Destination "$hfDir\Dockerfile"
Copy-Item "backend\requirements.txt" -Destination "$hfDir\requirements.txt"
Copy-Item -Path "backend\src" -Destination "$hfDir\src" -Recurse

# Create README for Hugging Face
Copy-Item "backend\README_HF.md" -Destination "$hfDir\README.md"

Write-Host "✅ Files prepared!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Deployment Package Created: $hfDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to: https://huggingface.co/spaces" -ForegroundColor White
Write-Host "2. Click 'Create new Space'" -ForegroundColor White
Write-Host "3. Name: todo-api-backend (or your choice)" -ForegroundColor White
Write-Host "4. SDK: Docker" -ForegroundColor White
Write-Host "5. Hardware: CPU Basic (Free)" -ForegroundColor White
Write-Host "6. Upload all files from '$hfDir' folder" -ForegroundColor White
Write-Host "7. Add environment variables (see HUGGINGFACE_DEPLOYMENT.md)" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Your API will be live at:" -ForegroundColor Green
Write-Host "   https://your-username-todo-api-backend.hf.space" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to open the folder
$response = Read-Host "Open deployment folder now? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    explorer $hfDir
}

Write-Host "✨ Ready to deploy!" -ForegroundColor Green
