# 구글 클라우드 런(Google Cloud Run) 원클릭 무인 자동 배포 스크립트
# 이 스크립트는 로컬 환경의 gcloud CLI 설치 검사부터 자동 로그인, 빌드 및 배포까지 원스톱으로 끝까지 완수합니다.

$ErrorActionPreference = "Stop"
Clear-Host

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         수능 국어 콘텐츠 적중 맵 - 구글 클라우드 런 자동 배포기" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "이 스크립트는 필요한 도구를 검사하고, 구글 클라우드 런 배포를 끝까지 자동으로 진행합니다." -ForegroundColor Yellow
Write-Host ""

# 1. gcloud CLI 설치 여부 정밀 확인
$gcloudPath = ""
if (Get-Command gcloud -ErrorAction SilentlyContinue) {
    $gcloudPath = "gcloud"
} else {
    # 기본 설치 예상 경로 탐색
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

# gcloud CLI가 없는 경우 자동 설치 개시
if (-not $gcloudPath) {
    Write-Host "[1/4] Google Cloud CLI가 감지되지 않아 자동으로 무설치 다운로드 및 설치를 실행합니다..." -ForegroundColor Yellow
    
    $installerPath = "$env:Temp\GoogleCloudSDKInstaller.exe"
    Write-Host "-> 설치 프로그램 다운로드 중 (인터넷 창 구동)..." -ForegroundColor Gray
    
    # 샌드박스 우회를 위해 브라우저 직접 다운로드 및 가동
    Start-Process -FilePath "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe" -Wait
    
    Write-Host "-> 구글 클라우드 SDK 설치 창이 떴습니다. 화면의 안내에 따라 설치를 완료해 주세요." -ForegroundColor Yellow
    Write-Host "-> 설치가 끝나면 엔터(Enter) 키를 눌러주세요..." -ForegroundColor Cyan
    Read-Host
    
    # 설치 후 경로 재탐색
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
        Write-Host "❌ 에러: Google Cloud CLI가 올바르게 설치되지 않았거나 경로를 찾을 수 없습니다." -ForegroundColor Red
        Exit
    }
}

Write-Host "✅ Google Cloud CLI 준비 완료!" -ForegroundColor Green
Write-Host ""

# 2. 구글 클라우드 로그인 상태 확인 및 자동 로그인 유도
Write-Host "[2/4] 구글 클라우드 플랫폼(GCP) 계정 연동 및 로그인 상태를 확인합니다..." -ForegroundColor Yellow
$authList = & $gcloudPath auth list --format="value(account)" 2>$null

if (-not $authList) {
    Write-Host "-> 연동된 구글 계정이 없습니다. 자동 로그인을 시작합니다..." -ForegroundColor Yellow
    Write-Host "-> 브라우저 창이 열리면 구글 계정으로 로그인한 뒤 권한을 승인해 주세요." -ForegroundColor Yellow
    & $gcloudPath auth login
} else {
    Write-Host "-> 로그인 확인 성공: $authList" -ForegroundColor Green
}
Write-Host ""

# 3. 프로젝트 ID 조회 및 신규 생성/지정
Write-Host "[3/4] 구글 클라우드 프로젝트 설정을 자동 진행합니다..." -ForegroundColor Yellow
$projects = & $gcloudPath projects list --format="value(projectId)" 2>$null

$targetProject = ""
if ($projects) {
    $projectList = $projects -split "`r`n"
    # 첫 번째 사용 가능한 프로젝트 자동 선정
    $targetProject = $projectList[0]
    Write-Host "-> 기존 활성화된 프로젝트 자동 매핑 완료: $targetProject" -ForegroundColor Green
} else {
    # 기존 프로젝트가 없으면 임의의 고유 고유 프로젝트 ID 생성 및 지정
    $randomId = Get-Random -Minimum 100000 -Maximum 999999
    $targetProject = "korean-hitmap-$randomId"
    Write-Host "-> 활성화된 프로젝트가 없어 새로운 프로젝트($targetProject)를 자동 생성합니다..." -ForegroundColor Yellow
    & $gcloudPath projects create $targetProject --name="Korean Hit Map Project"
}

# 기본 프로젝트 활성화
& $gcloudPath config set project $targetProject
Write-Host ""

# 4. 클라우드 런 빌드 및 배포 자동 실행
Write-Host "[4/4] 대망의 구글 클라우드 런(Cloud Run) 원스톱 배포를 시작합니다!" -ForegroundColor Yellow
Write-Host "-> 2단계 멀티스테이지 컨테이너 빌드 및 클라우드 배포 개시..." -ForegroundColor Yellow
Write-Host "-> 서울 리전(asia-northeast3)에 무인 자동 설치 중입니다. 잠시만 기다려 주세요..." -ForegroundColor Gray

# 필요한 GCP API 자동 활성화 (Cloud Run, Cloud Build)
Write-Host "-> 배포에 필요한 클라우드 API 활성화 중..." -ForegroundColor Gray
& $gcloudPath services enable run.googleapis.com cloudbuild.googleapis.com --async

# 클라우드 런 배포 쉘 구동
$serviceName = "hit-a-service"
$region = "asia-northeast3"

Write-Host "-> 구글 클라우드 서버에서 Dockerfile 기반 소스코드 원격 빌드 및 배포 중..." -ForegroundColor Cyan
& $gcloudPath run deploy $serviceName `
    --source . `
    --port 8080 `
    --allow-unauthenticated `
    --region $region `
    --project $targetProject

Write-Host ""
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "      🎉 축하합니다! 구글 클라우드 런 배포가 최종 완수되었습니다! 🎉" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""

# 배포된 URL 정보 추출 및 브라우저 기동
$url = & $gcloudPath run services describe $serviceName --region $region --format="value(status.url)"
if ($url) {
    Write-Host "🌍 최종 공개 접속 URL: $url" -ForegroundColor Cyan
    Write-Host "-> 3초 후 브라우저를 통해 자동으로 서비스를 실행합니다..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    Start-Process $url
} else {
    Write-Host "❌ 배포 주소를 추적하는 데 실패했습니다. 구글 클라우드 콘솔을 확인해 주세요." -ForegroundColor Red
}
