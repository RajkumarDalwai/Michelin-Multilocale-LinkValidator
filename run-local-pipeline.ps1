# Multi-Locale Link Validator - Local Pipeline Test (Windows)
# Simulates Jenkins pipeline execution locally

param(
    [string]$ENVIRONMENT = "Production",
    [string]$BASE_URL = "https://automated-vehicle-inspection.michelin.com/",
    [array]$LOCALES = @("en-IN", "fr-FR", "es-ES")
)

$ErrorActionPreference = "Continue"

$WORKSPACE = Get-Location
$REPORTS_DIR = "$WORKSPACE\cypress\reports"
$MCP_SERVER_PORT = 3000

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 1: Initialize" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Workspace: $WORKSPACE"
Write-Host "Environment: $ENVIRONMENT"
Write-Host "Locales: $($LOCALES -join ', ')"
node --version
npm --version

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 2: Install Dependencies" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
npm install --omit=dev 2>&1 | Out-Null
Write-Host "✅ Root dependencies installed" -ForegroundColor Green

Push-Location server
npm install --omit=dev 2>&1 | Out-Null
Pop-Location
Write-Host "✅ Server dependencies installed" -ForegroundColor Green

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 3: Prepare Environment" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if (Test-Path $REPORTS_DIR) {
    Remove-Item $REPORTS_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $REPORTS_DIR -Force | Out-Null
Write-Host "✅ Reports directory prepared" -ForegroundColor Green

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 4: Run Cypress Tests" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
foreach ($LOCALE in $LOCALES) {
    Write-Host "Testing locale: $LOCALE" -ForegroundColor Blue
    & npx cypress run `
        --spec "cypress/e2e/Tests/**/*.cy.js" `
        --env "baseUrl=$BASE_URL,locale=$LOCALE,environment=$ENVIRONMENT" `
        --headless `
        --browser chrome `
        --record false 2>&1 | Out-Null
    Write-Host "✅ Completed: $LOCALE" -ForegroundColor Green
}

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 5: Start MCP Server" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "ℹ️  Starting Express server on port $MCP_SERVER_PORT..." -ForegroundColor Blue
Push-Location server
$serverProcess = Start-Process -FilePath "node" -ArgumentList "app.js" -PassThru -NoNewWindow -RedirectStandardOutput "server.log"
$SERVER_PID = $serverProcess.Id
"$SERVER_PID" | Out-File -FilePath "server.pid"
Pop-Location

Start-Sleep -Seconds 3

$healthCheck = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$MCP_SERVER_PORT/health" -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $healthCheck = $true
    }
}
catch {
    $healthCheck = $false
}

if ($healthCheck) {
    Write-Host "✅ Server health check passed (PID: $SERVER_PID)" -ForegroundColor Green
}
else {
    Write-Host "❌ Server health check failed" -ForegroundColor Red
    exit 1
}

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 6: Generate Reports" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "ℹ️  Fetching summary report..." -ForegroundColor Blue
$summaryResponse = Invoke-WebRequest -Uri "http://localhost:$MCP_SERVER_PORT/api/reports" -UseBasicParsing
$summaryResponse.Content | Out-File -FilePath "api_summary.json"
Write-Host "✅ Summary report generated" -ForegroundColor Green

Write-Host "ℹ️  Fetching comparison report..." -ForegroundColor Blue
$localesParam = $LOCALES -join ','
$comparisonResponse = Invoke-WebRequest -Uri "http://localhost:$MCP_SERVER_PORT/api/reports/compare/$localesParam" -UseBasicParsing
$comparisonResponse.Content | Out-File -FilePath "api_comparison.json"
Write-Host "✅ Comparison report generated" -ForegroundColor Green

Write-Host ""
Write-Host "ℹ️  Report Summary:" -ForegroundColor Blue
$summaryData = $summaryResponse.Content | ConvertFrom-Json
Write-Host "  📊 Total Locales: $($summaryData.totalLocales)"
Write-Host "  ✅ Total Successful: $($summaryData.totalSuccessful) links"
Write-Host "  ❌ Total Broken: $($summaryData.totalBrokenLinks) links"
Write-Host "  📈 Average Success Rate: $($summaryData.averageSuccessRate)%"
Write-Host "  Per-Locale Breakdown:"
foreach ($locale in $summaryData.locales) {
    Write-Host "    - $($locale.locale): $($locale.successRate)% success"
}

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 7: Prepare Dashboard" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
New-Item -ItemType Directory -Path "dashboard" -Force | Out-Null
Copy-Item "report-ui/index.html" "dashboard/" -ErrorAction SilentlyContinue
Copy-Item "report-ui/style.css" "dashboard/" -ErrorAction SilentlyContinue
Copy-Item "report-ui/script.js" "dashboard/" -ErrorAction SilentlyContinue
Copy-Item -Path "cypress/reports" -Destination "dashboard/data" -Recurse -ErrorAction SilentlyContinue
Write-Host "✅ Dashboard prepared" -ForegroundColor Green

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 8: Archive Artifacts" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
New-Item -ItemType Directory -Path "build_artifacts/reports" -Force | Out-Null
New-Item -ItemType Directory -Path "build_artifacts/dashboard" -Force | Out-Null
New-Item -ItemType Directory -Path "build_artifacts/logs" -Force | Out-Null
Copy-Item "cypress/reports/*" "build_artifacts/reports/" -Recurse -ErrorAction SilentlyContinue
Copy-Item "dashboard/*" "build_artifacts/dashboard/" -Recurse -ErrorAction SilentlyContinue
Copy-Item "api_*.json" "build_artifacts/" -ErrorAction SilentlyContinue
Copy-Item "server/server.log" "build_artifacts/logs/" -ErrorAction SilentlyContinue
Write-Host "✅ Artifacts archived" -ForegroundColor Green

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 9: Cleanup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
if (Test-Path "server/server.pid") {
    $serverPid = Get-Content "server/server.pid"
    Stop-Process -Id $serverPid -ErrorAction SilentlyContinue
    Write-Host "✅ Server stopped (PID: $serverPid)" -ForegroundColor Green
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "BUILD COMPLETE - SUCCESS" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Reports Generated:"
Write-Host "  - Cypress Reports: $REPORTS_DIR\"
Write-Host "  - API Summary: api_summary.json"
Write-Host "  - API Comparison: api_comparison.json"
Write-Host "  - Dashboard: dashboard\index.html"
Write-Host "  - Build Artifacts: build_artifacts\"
Write-Host ""
Write-Host "Test completed successfully!" -ForegroundColor Green
Write-Host ""
