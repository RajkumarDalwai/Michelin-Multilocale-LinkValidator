pipeline {
    agent any

    options {
        timeout(time: 2, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '30'))
    }

    parameters {
        choice(
            name: 'LOCALE',
            choices: ['ALL', 'en-IN', 'en-US', 'fr-FR', 'de-DE', 'es-ES', 'pt-BR', 'ja-JP', 'zh-CN'],
            description: 'Select locale to scan (ALL = scan all locales)'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['Production', 'Staging', 'Development'],
            description: 'Select environment'
        )
        string(
            name: 'BASE_URL',
            defaultValue: 'https://automated-vehicle-inspection.michelin.com/',
            description: 'Base URL to scan'
        )
        booleanParam(
            name: 'GENERATE_COMPARISON_REPORT',
            defaultValue: false,
            description: 'Generate comparison report across all available locales'
        )
    }

    environment {
        NODE_ENV = 'production'
        REPORTS_DIR = "${WORKSPACE}/cypress/reports"
        DASHBOARD_DIR = "${WORKSPACE}/report-ui"
        MCP_SERVER_PORT = '3000'
    }

    stages {
        stage('📋 Initialize') {
            steps {
                echo "╔════════════════════════════════════════════════════════════╗"
                echo "║     Michelin Multi-Locale Link Validator - Jenkins CI      ║"
                echo "╚════════════════════════════════════════════════════════════╝"
                echo "🔍 Configuration:"
                echo "   Locale: ${LOCALE}"
                echo "   Environment: ${ENVIRONMENT}"
                echo "   Base URL: ${BASE_URL}"
                echo "   Comparison Report: ${GENERATE_COMPARISON_REPORT}"
                echo "   Workspace: ${WORKSPACE}"
                sh 'node --version && npm --version'
            }
        }

        stage('📦 Checkout') {
            steps {
                echo '📥 Checking out repository...'
                checkout scm
            }
        }

        stage('🔧 Install Dependencies') {
            steps {
                echo '📥 Installing project dependencies...'
                sh '''
                    echo "Installing root dependencies..."
                    npm install --omit=dev
                    
                    echo "Installing server dependencies..."
                    cd server && npm install --omit=dev && cd ..
                    
                    echo "✅ Dependencies installed successfully"
                '''
            }
        }

        stage('🧪 Run Cypress Tests') {
            steps {
                echo "🎯 Running Cypress link validation tests..."
                script {
                    if (params.LOCALE == 'ALL') {
                        def locales = ['en-IN', 'en-US', 'fr-FR', 'de-DE', 'es-ES']
                        for (locale in locales) {
                            echo "Testing locale: ${locale}"
                            sh '''
                                npx cypress run \
                                    --spec "cypress/e2e/Tests/**/*.cy.js" \
                                    --env baseUrl="${BASE_URL}",locale="${locale}",environment="${ENVIRONMENT}" \
                                    --headed=false \
                                    --browser chrome \
                                    --record false || true
                            '''
                        }
                    } else {
                        sh '''
                            npx cypress run \
                                --spec "cypress/e2e/Tests/**/*.cy.js" \
                                --env baseUrl="${BASE_URL}",locale="${LOCALE}",environment="${ENVIRONMENT}" \
                                --headed=false \
                                --browser chrome \
                                --record false
                        '''
                    }
                }
                echo "✅ Cypress tests completed"
            }
        }

        stage('📊 Start MCP Server') {
            steps {
                echo '🚀 Starting Express MCP server...'
                sh '''
                    cd server
                    echo "Starting server on port ${MCP_SERVER_PORT}..."
                    nohup node app.js > server.log 2>&1 &
                    SERVER_PID=$!
                    echo $SERVER_PID > server.pid
                    
                    echo "Waiting for server startup..."
                    sleep 3
                    
                    # Health check with retry
                    for i in {1..5}; do
                        if curl -s http://localhost:${MCP_SERVER_PORT}/health > /dev/null 2>&1; then
                            echo "✅ Server health check passed"
                            break
                        fi
                        echo "Retry $i/5..."
                        sleep 2
                    done
                '''
            }
        }

        stage('📈 Generate Reports') {
            steps {
                echo '📋 Generating structured reports...'
                sh '''
                    cd ${WORKSPACE}
                    
                    if [ "${LOCALE}" = "ALL" ] || [ "${GENERATE_COMPARISON_REPORT}" = "true" ]; then
                        echo "Fetching summary report..."
                        curl -s http://localhost:${MCP_SERVER_PORT}/api/reports > api_summary.json
                        
                        if [ -f api_summary.json ]; then
                            echo "✅ Summary report generated"
                            cat api_summary.json | python3 -m json.tool
                        fi
                    else
                        echo "Fetching locale-specific report: ${LOCALE}"
                        curl -s http://localhost:${MCP_SERVER_PORT}/api/reports/${LOCALE} > api_locale_report.json
                        
                        if [ -f api_locale_report.json ]; then
                            echo "✅ Locale report generated"
                            cat api_locale_report.json | python3 -m json.tool
                        fi
                    fi
                '''
            }
        }

        stage('🎨 Prepare Dashboard') {
            steps {
                echo '📊 Preparing interactive dashboard...'
                sh '''
                    echo "Copying dashboard files..."
                    mkdir -p dashboard
                    cp -v report-ui/index.html dashboard/ || true
                    cp -v report-ui/style.css dashboard/ || true
                    cp -v report-ui/script.js dashboard/ || true
                    
                    # Copy reports for offline access
                    cp -r cypress/reports dashboard/data 2>/dev/null || true
                    
                    echo "✅ Dashboard prepared"
                    ls -la dashboard/
                '''
            }
        }

        stage('📦 Archive Artifacts') {
            steps {
                echo '💾 Archiving build artifacts...'
                sh '''
                    echo "Creating artifacts archive..."
                    mkdir -p build_artifacts
                    
                    # Copy reports
                    cp -r cypress/reports build_artifacts/ 2>/dev/null || true
                    
                    # Copy dashboard
                    cp -r dashboard build_artifacts/ 2>/dev/null || true
                    
                    # Copy API responses
                    cp api_*.json build_artifacts/ 2>/dev/null || true
                    
                    # Copy server logs
                    cp server/server.log build_artifacts/ 2>/dev/null || true
                    
                    echo "✅ Artifacts archived"
                '''
                
                archiveArtifacts artifacts: '''
                    build_artifacts/**/*,
                    dashboard/**/*,
                    cypress/reports/**/*.json,
                    api_*.json,
                    server/server.log
                ''', allowEmptyArchive: true
            }
        }

        stage('📧 Generate Report Summary') {
            steps {
                echo '📋 Generating test summary...'
                sh '''
                    echo "Build Report Summary" > ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "===================" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "Job: ${JOB_NAME}" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "Build: ${BUILD_NUMBER}" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "Status: SUCCESS" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "Timestamp: $(date)" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "Parameters:" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "  Locale: ${LOCALE}" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "  Environment: ${ENVIRONMENT}" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "  Base URL: ${BASE_URL}" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    
                    if [ -f api_summary.json ]; then
                        echo "Report Statistics:" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                        python3 << 'EOF'
import json
with open('api_summary.json') as f:
    data = json.load(f)
    with open('${WORKSPACE}/BUILD_SUMMARY.txt', 'a') as out:
                        out.write(f"  Total Locales: {data.get('totalLocales', 'N/A')}\n")
                        out.write(f"  Total Broken Links: {data.get('totalBrokenLinks', 'N/A')}\n")
                        out.write(f"  Total Successful: {data.get('totalSuccessful', 'N/A')}\n")
                        out.write(f"  Average Success Rate: {data.get('averageSuccessRate', 'N/A')}%\n")
EOF
                    fi
                    
                    echo "" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "Dashboard URL:" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    echo "  ${BUILD_URL}artifact/dashboard/index.html" >> ${WORKSPACE}/BUILD_SUMMARY.txt
                    
                    cat ${WORKSPACE}/BUILD_SUMMARY.txt
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Cleanup & Finalization...'
            sh '''
                echo "Stopping MCP server..."
                if [ -f server/server.pid ]; then
                    kill $(cat server/server.pid) 2>/dev/null || true
                fi
                pkill -f "node app.js" || true
                sleep 1
                echo "✅ Cleanup complete"
            '''
        }

        success {
            echo '''
╔════════════════════════════════════════════════════════════╗
║                    BUILD SUCCESSFUL ✅                      ║
╚════════════════════════════════════════════════════════════╝
            '''
            sh 'cat ${WORKSPACE}/BUILD_SUMMARY.txt'
        }

        failure {
            echo '''
╔════════════════════════════════════════════════════════════╗
║                     BUILD FAILED ❌                         ║
╚════════════════════════════════════════════════════════════╝
            '''
            sh 'cat server/server.log || echo "No server logs available"'
        }

        unstable {
            echo 'Build unstable - check logs'
        }

        cleanup {
            deleteDir()
        }
    }
}
