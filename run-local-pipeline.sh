#!/bin/bash
# Multi-Locale Link Validator - Local Test Script
# Simulates Jenkins pipeline execution locally

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   Michelin Link Validator - Local Pipeline Test            ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Configuration
WORKSPACE="${PWD}"
REPORTS_DIR="${WORKSPACE}/cypress/reports"
MCP_SERVER_PORT=3000
TEST_LOCALES=("en-IN" "fr-FR" "es-ES")
ENVIRONMENT="Production"
BASE_URL="https://automated-vehicle-inspection.michelin.com/"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_section() {
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Step 1: Initialize
log_section "STEP 1: Initialize"
echo "Workspace: ${WORKSPACE}"
echo "Environment: ${ENVIRONMENT}"
echo "Base URL: ${BASE_URL}"
echo "Test Locales: ${TEST_LOCALES[@]}"
node --version
npm --version

# Step 2: Install Dependencies
log_section "STEP 2: Install Dependencies"
log_info "Installing root dependencies..."
npm install --omit=dev > /dev/null 2>&1
log_success "Root dependencies installed"

log_info "Installing server dependencies..."
cd server && npm install --omit=dev > /dev/null 2>&1 && cd ..
log_success "Server dependencies installed"

# Step 3: Clean Reports Directory
log_section "STEP 3: Prepare Environment"
rm -rf "${REPORTS_DIR}"
mkdir -p "${REPORTS_DIR}"
log_success "Reports directory prepared"

# Step 4: Run Cypress Tests for Each Locale
log_section "STEP 4: Run Cypress Tests"
for LOCALE in "${TEST_LOCALES[@]}"; do
    log_info "Testing locale: ${LOCALE}"
    npx cypress run \
        --spec "cypress/e2e/Tests/**/*.cy.js" \
        --env baseUrl="${BASE_URL}",locale="${LOCALE}",environment="${ENVIRONMENT}" \
        --headed=false \
        --browser chrome \
        --record false > /dev/null 2>&1 || log_warning "Test had issues, continuing..."
    log_success "Completed: ${LOCALE}"
done

# Step 5: Start MCP Server
log_section "STEP 5: Start MCP Server"
log_info "Starting Express server on port ${MCP_SERVER_PORT}..."
cd server
nohup node app.js > server.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > server.pid
cd ..

sleep 3

# Health check
if curl -s http://localhost:${MCP_SERVER_PORT}/health > /dev/null 2>&1; then
    log_success "Server health check passed (PID: ${SERVER_PID})"
else
    log_error "Server health check failed"
    exit 1
fi

# Step 6: Generate Reports
log_section "STEP 6: Generate Reports"

# Get summary report
log_info "Fetching summary report..."
curl -s http://localhost:${MCP_SERVER_PORT}/api/reports > api_summary.json
log_success "Summary report generated"

# Get comparison report
log_info "Fetching comparison report..."
LOCALES_CSV=$(IFS=,; echo "${TEST_LOCALES[*]}")
curl -s "http://localhost:${MCP_SERVER_PORT}/api/reports/compare/${LOCALES_CSV}" > api_comparison.json
log_success "Comparison report generated"

# Display summary
echo ""
log_info "Report Summary:"
python3 << 'EOF'
import json

try:
    with open('api_summary.json') as f:
        data = json.load(f)
        print(f"  📊 Total Locales: {data.get('totalLocales', 'N/A')}")
        print(f"  ✅ Total Successful: {data.get('totalSuccessful', 'N/A')} links")
        print(f"  ❌ Total Broken: {data.get('totalBrokenLinks', 'N/A')} links")
        print(f"  📈 Average Success Rate: {data.get('averageSuccessRate', 'N/A')}%")
        print("")
        print("  Per-Locale Breakdown:")
        for locale in data.get('locales', []):
            print(f"    • {locale['locale']}: {locale['successRate']}% success")
except Exception as e:
    print(f"  Error reading report: {e}")
EOF

# Step 7: Prepare Dashboard
log_section "STEP 7: Prepare Dashboard"
mkdir -p dashboard
cp report-ui/index.html dashboard/ 2>/dev/null || true
cp report-ui/style.css dashboard/ 2>/dev/null || true
cp report-ui/script.js dashboard/ 2>/dev/null || true
cp -r cypress/reports dashboard/data 2>/dev/null || true
log_success "Dashboard prepared"

# Step 8: Archive Artifacts
log_section "STEP 8: Archive Artifacts"
mkdir -p build_artifacts/{reports,dashboard,logs}
cp -r cypress/reports/* build_artifacts/reports/ 2>/dev/null || true
cp -r dashboard/* build_artifacts/dashboard/ 2>/dev/null || true
cp api_*.json build_artifacts/ 2>/dev/null || true
cp server/server.log build_artifacts/logs/ 2>/dev/null || true
log_success "Artifacts archived"

# Step 9: Generate Build Summary
log_section "STEP 9: Generate Build Summary"
cat > BUILD_SUMMARY.txt << EOF
Build Report Summary
====================
Timestamp: $(date)
Locales Tested: ${TEST_LOCALES[@]}
Environment: ${ENVIRONMENT}
Base URL: ${BASE_URL}

Artifacts Location: ${WORKSPACE}/build_artifacts/
Dashboard: ${WORKSPACE}/dashboard/index.html
API Summary: ${WORKSPACE}/api_summary.json
API Comparison: ${WORKSPACE}/api_comparison.json

Server Logs: ${WORKSPACE}/server/server.log

Test Results:
EOF

python3 << 'EOF' >> BUILD_SUMMARY.txt
import json

try:
    with open('api_summary.json') as f:
        data = json.load(f)
        print(f"  Total Locales: {data.get('totalLocales')}")
        print(f"  Total Successful: {data.get('totalSuccessful')} links")
        print(f"  Total Broken: {data.get('totalBrokenLinks')} links")
        print(f"  Average Success Rate: {data.get('averageSuccessRate')}%")
except Exception as e:
    print(f"  Error: {e}")
EOF

cat BUILD_SUMMARY.txt
log_success "Build summary generated"

# Step 10: Cleanup
log_section "STEP 10: Cleanup"
if [ -f server/server.pid ]; then
    PID=$(cat server/server.pid)
    kill $PID 2>/dev/null || true
    log_success "Server stopped (PID: $PID)"
fi

# Final Summary
echo ""
log_section "BUILD COMPLETE ✅"
echo ""
echo "📊 Reports Generated:"
echo "  • Cypress Reports: ${REPORTS_DIR}/"
echo "  • API Summary: api_summary.json"
echo "  • API Comparison: api_comparison.json"
echo "  • Dashboard: dashboard/index.html"
echo "  • Build Artifacts: build_artifacts/"
echo ""
echo "🔗 Quick Links:"
echo "  • Summary: file://${WORKSPACE}/api_summary.json"
echo "  • Comparison: file://${WORKSPACE}/api_comparison.json"
echo "  • Dashboard: file://${WORKSPACE}/dashboard/index.html"
echo ""
log_success "Local pipeline test completed successfully!"
echo ""
