param([string]$msg = "update site")

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
gh auth switch --user alhusseinalsaadi | Out-Null
git add .
git commit -m $msg
git push render master

Write-Host "Deploying to EC2..." -ForegroundColor Cyan
ssh -i "C:\Users\DTG\legal-site\key.pem" ubuntu@16.171.113.27 "bash ~/deploy.sh"

gh auth switch --user mustafabushra | Out-Null
Write-Host "Done! https://alhusseinalsaadi.sa" -ForegroundColor Green
