param(
  [string]$Visibility = 'public'
)

$ErrorActionPreference = 'Stop'
$Repository = 'nameZhj/RobotOps-AI-Vue'
$RemoteUrl = "https://github.com/$Repository.git"

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'GitHub CLI (gh) not found. Install it from https://cli.github.com/ and run: gh auth login'
}
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  throw 'Git not found. Install Git before publishing.'
}
if ($Visibility -notin @('private', 'public')) {
  throw "Visibility must be 'private' or 'public'."
}

gh auth status | Out-Null
if (-not (Test-Path '.git')) { git init -b main }
git branch -M main
git add .
git rev-parse --verify HEAD *> $null
if ($LASTEXITCODE -ne 0) {
  git commit -m 'chore: bootstrap RobotOps AI Vue framework'
}

$visibilityArg = if ($Visibility -eq 'private') { '--private' } else { '--public' }
$repoExists = $false
gh repo view $Repository --json name *> $null
if ($LASTEXITCODE -eq 0) { $repoExists = $true }

if ($repoExists) {
  Write-Host "Repository $Repository already exists. Pushing main."
  $currentRemote = git remote get-url origin 2>$null
  if ($LASTEXITCODE -eq 0 -and $currentRemote) {
    git remote set-url origin $RemoteUrl
  } else {
    git remote add origin $RemoteUrl
  }
  git push -u origin main
} else {
  gh repo create $Repository $visibilityArg --source . --remote origin --push
}
Write-Host "Published: https://github.com/$Repository"
