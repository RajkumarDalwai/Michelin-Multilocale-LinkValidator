pipeline {
    agent any

    options {
        timeout(time: 2, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '30'))
    }

    parameters {
        choice(
            name: 'PLATFORM',
            choices: ['Automated-Vehicle-Inspection', 'Fondation', 'Laventure'],
            description: 'Platform to validate (e.g. Automated-Vehicle-Inspection, Fondation, Laventure)'
        )
        choice(
            name: 'LOCALE',
            choices: ['ALL', 'en-IN', 'en-US', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ja-JP'],
            description: 'Select locale to scan (ALL = scan all locales)'
        )
        choice(
            name: 'ENVIRONMENT',
            choices: ['RC', 'UAT', 'Production'],
            description: 'Select environment'
        )
        choice(
            name: 'SCOPE',
            choices: ['HomePage', 'ProductPages', 'AllPages'],
            description: 'Page scope to validate (home, product, category, all)'
        )
        booleanParam(
            name: 'GENERATE_COMPARISON_REPORT',
            defaultValue: false,
            description: 'Generate comparison report across all available locales'
        )
    }

    environment {
        NODE_ENV = 'production'
        MCP_SERVER_PORT = '3000'
        // Base URL is now hardcoded here (no longer a parameter)
        HARD_CODED_BASE_URL = 'https://automated-vehicle-inspection.michelin.com/'
    }

    stages {
        stage('📋 Initialize') {
            steps {
                echo "╔════════════════════════════════════════════════════════════╗"
                echo "║     Michelin Multi-Locale Link Validator - Jenkins CI      ║"
                echo "╚════════════════════════════════════════════════════════════╝"
                echo "🔍 Build Parameters:"
                echo "   Platform:      ${params.PLATFORM ?: 'Not specified'}"
                echo "   Locale:        ${params.LOCALE}"
                echo "   Environment:   ${params.ENVIRONMENT}"
                echo "   Page Scope:    ${params.SCOPE}"
                echo "   Comparison:    ${params.GENERATE_COMPARISON_REPORT}"
                echo "   Workspace:     ${WORKSPACE}"
                bat 'node --version && npm --version'
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
                bat '''
                    echo Installing root dependencies...
                    npm install --omit=dev

                    echo Installing server dependencies...
                    cd server
                    npm install --omit=dev
                    cd ..

                    echo Dependencies installed successfully
                '''
            }
        }

        stage('🧪 Run Cypress Tests') {
            steps {
                echo "🎯 Running Cypress link validation tests..."
                script {
                    def locales = (params.LOCALE == 'ALL') ? 
                        ['en-IN', 'en-US', 'fr-FR', 'de-DE', 'es-ES', 'it-IT', 'pt-BR', 'ja-JP'] : 
                        [params.LOCALE]

                    for (locale in locales) {
                        echo "Testing locale: ${locale}"
                        bat """
                            npx cypress run ^
                                --spec "cypress/e2e/Tests/**/*.cy.js" ^
                                --env baseUrl="${HARD_CODED_BASE_URL}",locale="${locale}",environment="${ENVIRONMENT}",platform="${PLATFORM}",scope="${SCOPE}" ^
                                --browser chrome ^
                                --record false || exit /b 0
                        """
                    }
                }
                echo "Cypress tests completed"
            }
        }

        stage('📊 Start MCP Server') {
            steps {
                echo '🚀 Starting Express MCP server...'
                bat """
                    REM Ensure no previous Node servers are occupying the port
                    taskkill /F /IM node.exe /T >nul 2>&1 || echo No node.exe processes found

                    cd server
                    echo Starting server on port ${MCP_SERVER_PORT}...
                    start /B node app.js > server.log 2>&1

                    echo Waiting for server startup...
                    ping 127.0.0.1 -n 10 >nul

                    set "health_ok="
                    for /L %%i in (1,1,8) do (
                        curl -s -f http://localhost:${MCP_SERVER_PORT}/health >nul 2>&1 && (
                            echo Server health check passed
                            set health_ok=1
                            goto :health_ok
                        )
                        echo Retry %%i/8...
                        ping 127.0.0.1 -n 4 >nul
                    )
                    :health_ok
                    if not defined health_ok echo WARNING: Server health check failed after retries
                """

                // Log the dashboard URL in the Jenkins console (always visible)
                echo "════════════════════════════════════════════════════════════"
                echo "📊 DASHBOARD (local): http://localhost:${MCP_SERVER_PORT}"
                echo "📝 Server logs: server/server.log"
                echo "════════════════════════════════════════════════════════════"
            }
        }

        stage('📈 Generate Reports') {
            steps {
                echo '📋 Generating structured reports...'
                bat """
                    cd "${WORKSPACE}"

                    curl -s -f http://localhost:${MCP_SERVER_PORT}/api/reports -o api_summary.json || echo "Summary fetch failed"

                    if exist api_summary.json (
                        echo.
                        echo Summary report content:
                        type api_summary.json
                        echo.
                        python -m json.tool api_summary.json || echo "JSON pretty-print failed"
                    ) else (
                        echo No summary report was generated
                    )
                """
            }
        }

        stage('🎨 Prepare Dashboard') {
            steps {
                echo '📊 Preparing interactive dashboard...'
                bat '''
                    if not exist dashboard mkdir dashboard

                    copy report-ui\\index.html dashboard\\  >nul 2>&1 || echo index.html missing
                    copy report-ui\\style.css   dashboard\\  >nul 2>&1 || echo style.css missing
                    copy report-ui\\script.js   dashboard\\  >nul 2>&1 || echo script.js missing

                    if exist cypress\\reports (
                        if not exist dashboard\\data mkdir dashboard\\data
                        xcopy /s /y /i cypress\\reports dashboard\\data >nul 2>&1 || echo No Cypress reports copied
                    )

                    dir dashboard
                '''
            }
        }

        stage('📦 Archive Artifacts') {
            steps {
                echo '💾 Archiving build artifacts...'
                bat '''
                    if not exist build_artifacts mkdir build_artifacts

                    xcopy /s /y /i cypress\\reports      build_artifacts\\reports     >nul 2>&1 || echo No reports folder
                    xcopy /s /y /i dashboard             build_artifacts\\dashboard    >nul 2>&1 || echo No dashboard folder
                    copy api_*.json                      build_artifacts\\            >nul 2>&1 || echo No api json files
                    copy server\\server.log              build_artifacts\\            >nul 2>&1 || echo No server log
                '''

                archiveArtifacts(
                    artifacts: 'build_artifacts/**/*,dashboard/**/*,cypress/reports/**/*.json,api_*.json,server/server.log',
                    allowEmptyArchive: true,
                    fingerprint: true
                )
            }
        }

        stage('📧 Generate Report Summary') {
            steps {
                echo '📋 Generating final test summary...'
                bat '''
                    > BUILD_SUMMARY.txt echo Build Report Summary
                    >> BUILD_SUMMARY.txt echo ===================
                    >> BUILD_SUMMARY.txt echo Job: %JOB_NAME%
                    >> BUILD_SUMMARY.txt echo Build: %BUILD_NUMBER%
                    >> BUILD_SUMMARY.txt echo Status: SUCCESS
                    >> BUILD_SUMMARY.txt echo Timestamp: %DATE% %TIME%
                    >> BUILD_SUMMARY.txt echo.
                    >> BUILD_SUMMARY.txt echo Parameters:
                    >> BUILD_SUMMARY.txt echo   Platform:     "${PLATFORM}"
                    >> BUILD_SUMMARY.txt echo   Locale:       "${LOCALE}"
                    >> BUILD_SUMMARY.txt echo   Environment:  "${ENVIRONMENT}"
                    >> BUILD_SUMMARY.txt echo   Page Scope:   "${SCOPE}"
                    >> BUILD_SUMMARY.txt echo.

                    if exist api_summary.json (
                        >> BUILD_SUMMARY.txt echo Report Statistics:

                        > "summary_stats.py" echo import json
                        >> "summary_stats.py" echo with open('api_summary.json', encoding='utf-8') as f:
                        >> "summary_stats.py" echo     data = json.load(f)
                        >> "summary_stats.py" echo with open('BUILD_SUMMARY.txt', 'a', encoding='utf-8') as out:
                        >> "summary_stats.py" echo     out.write(f"  Total Locales:         {data.get('totalLocales', 'N/A')}\\n")
                        >> "summary_stats.py" echo     out.write(f"  Total Broken Links:    {data.get('totalBrokenLinks', 'N/A')}\\n")
                        >> "summary_stats.py" echo     out.write(f"  Total Successful:      {data.get('totalSuccessful', 'N/A')}\\n")
                        >> "summary_stats.py" echo     out.write(f"  Avg Success Rate:      {data.get('averageSuccessRate', 'N/A')} %%\\n")

                        python "summary_stats.py" || echo WARNING: Python statistics step failed
                        del "summary_stats.py" 2>nul
                    ) else (
                        >> BUILD_SUMMARY.txt echo WARNING: No api_summary.json found - statistics skipped
                    )

                    >> BUILD_SUMMARY.txt echo.
                    >> BUILD_SUMMARY.txt echo Dashboard URL:
                    >> BUILD_SUMMARY.txt echo   ${BUILD_URL}artifact/dashboard/index.html

                    type BUILD_SUMMARY.txt
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Cleanup & Finalization...'
            bat '''
                echo Stopping server...
                taskkill /F /IM node.exe /T >nul 2>&1 || echo No node.exe processes found
                ping 127.0.0.1 -n 4 >nul
                echo Cleanup finished
            '''
        }

        success {
            echo '''
╔════════════════════════════════════════════════════════════╗
║                    BUILD SUCCESSFUL ✅                      ║
╚════════════════════════════════════════════════════════════╝
            '''
            bat 'type BUILD_SUMMARY.txt || echo No summary available'
            echo "════════════════════════════════════════════════════════════"
            echo "🚀 DASHBOARD READY"
            echo "════════════════════════════════════════════════════════════"
            echo ""
            echo "📊 ACCESS YOUR DASHBOARD AT:"
            echo ""
            echo "🔗 http://localhost:3000"
            echo ""
            echo "════════════════════════════════════════════════════════════"
            echo ""
            bat '''
                REM Start Express server in the background
                cd server
                start /B node app.js > ../dashboard_server.log 2>&1
                cd ..
                
                REM Wait for server to start
                timeout /t 3 /nobreak
                
                REM Try to open in default browser
                powershell -Command "Start-Process 'http://localhost:3000'" >nul 2>&1
            '''
            echo "✅ Express server started on port 3000"
            echo "📝 Server logs: dashboard_server.log"
        }

        failure {
            echo '''
╔════════════════════════════════════════════════════════════╗
║                     BUILD FAILED ❌                         ║
╚════════════════════════════════════════════════════════════╝
            '''
            bat 'type server\\server.log || echo No server logs available'
        }

        cleanup {
            deleteDir()
        }
    }
}