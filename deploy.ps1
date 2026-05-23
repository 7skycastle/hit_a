# Google Cloud Run One-Click Deployment Script
# Detects gcloud CLI, authenticates, maps project, builds & deploys container to Cloud Run.

$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         KOREAN HIT MAP - GOOGLE CLOUD RUN DEPLOYER" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "This script will automatically deploy the application to Google Cloud Run." -ForegroundColor Yellow
Write-Host ""

# 1. Check if gcloud CLI is installed
$gcloudPath = ""
if (Get-Command gcloud -ErrorAction SilentlyContinue) {
    $gcloudPath = "gcloud"
} else {
    # Default installation paths
    $defaultPaths = @(
        "$env:SystemDrive\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
        "$env:SystemDrive\Program Files\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
        "$env:LocalAppData\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    )
    foreach ($path in $defaultPaths) {
        if (Test-Path $path) {
            $gcloudPath = $path
            break
        }
    }
}

if (-not $gcloudPath) {
    Write-Host "[1/4] Google Cloud CLI not detected. Starting downloader..." -ForegroundColor Yellow
    
    # Download and start installer
    Start-Process -FilePath "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -Wait
    
    Write-Host "-> Please complete the Google Cloud SDK installation wizard." -ForegroundColor Yellow
    Write-Host "-> Once installation is finished, press [Enter] to continue..." -ForegroundColor Cyan
    Read-Host
    
    # Re-evaluate path
    $defaultPaths = @(
        "$env:SystemDrive\Program Files (x86)\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
        "$env:SystemDrive\Program Files\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd",
        "$env:LocalAppData\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"
    )
    foreach ($path in $defaultPaths) {
        if (Test-Path $path) {
            $gcloudPath = $path
            break
        }
    }
    
    if (-not $gcloudPath) {
        Write-Host "Error: Google Cloud CLI not found. Please install it manually." -ForegroundColor Red
        Exit
    }
}

Write-Host "Google Cloud CLI is ready!" -ForegroundColor Green
Write-Host ""

# 2. Check Authentication
Write-Host "[2/4] Verifying Google Cloud Platform (GCP) authentication..." -ForegroundColor Yellow
$authList = & $gcloudPath auth list --format="value(account)" 2>$null

if (-not $authList) {
    Write-Host "-> No active GCP account detected. Starting login process..." -ForegroundColor Yellow
    Write-Host "-> Browser window will open. Please sign in and allow permissions." -ForegroundColor Yellow
    & $gcloudPath auth login
} else {
    Write-Host "-> Active account: $authList" -ForegroundColor Green
}
Write-Host ""

# 3. Configure Project ID
Write-Host "[3/4] Configuring GCP Project..." -ForegroundColor Yellow
$projects = & $gcloudPath projects list --format="value(projectId)" 2>$null

$targetProject = ""
if ($projects) {
    $projectList = $projects -split "`r`n"
    $targetProject = $projectList[0]
    Write-Host "-> Automatically mapped to existing project: $targetProject" -ForegroundColor Green
} else {
    $randomId = Get-Random -Minimum 100000 -Maximum 999999
    $targetProject = "korean-hitmap-$randomId"
    Write-Host "-> No project found. Creating a new project: $targetProject" -ForegroundColor Yellow
    & $gcloudPath projects create $targetProject --name="Korean Hit Map Project"
}

& $gcloudPath config set project $targetProject
Write-Host ""

# 4. Build & Deploy to Cloud Run
Write-Host "[4/4] Starting Cloud Run Deploy..." -ForegroundColor Yellow
Write-Host "-> Enabling required GCP APIs (Cloud Run, Cloud Build)..." -ForegroundColor Gray
& $gcloudPath services enable run.googleapis.com cloudbuild.googleapis.com --async

$serviceName = "hit-a-service"
$region = "asia-northeast3"

Write-Host "-> Uploading source and building container remotely on Cloud Build..." -ForegroundColor Cyan
& $gcloudPath run deploy $serviceName `
    --source . `
    --port 8080 `
    --allow-unauthenticated `
    --region $region `
    --project $targetProject

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "      CONGRATULATIONS! DEPLOYMENT SUCCESSFULLY COMPLETED! " -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

$url = & $gcloudPath run services describe $serviceName --region $region --format="value(status.url)"
if ($url) {
    Write-Host "Public URL: $url" -ForegroundColor Cyan
    Write-Host "-> Opening browser in 3 seconds..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process $url
} else {
    Write-Host "Failed to retrieve service URL. Please check your GCP Console." -ForegroundColor Red
}
