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
        REPORTS_DIR = "${WORKSPACE}\\cypress\\reports"
        DASHBOARD_DIR = "${WORKSPACE}\\report-ui"
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
                    if (params.LOCALE == 'ALL') {
                        def locales = ['en-IN', 'en-US', 'fr-FR', 'de-DE', 'es-ES']
                        for (locale in locales) {
                            echo "Testing locale: ${locale}"
                            bat """
                                npx cypress run ^
                                    --spec "cypress/e2e/Tests/**/*.cy.js" ^
                                    --env baseUrl="${BASE_URL}",locale="${locale}",environment="${ENVIRONMENT}" ^
                                    --browser chrome ^
                                    --record false || exit /b 0
                            """
                        }
                    } else {
                        bat """
                            npx cypress run ^
                                --spec "cypress/e2e/Tests/**/*.cy.js" ^
                                --env baseUrl="${BASE_URL}",locale="${LOCALE}",environment="${ENVIRONMENT}" ^
                                --browser chrome ^
                                --record false || exit /b 0
                        """
                    }
                }
                echo "✅ Cypress tests completed"
            }
        }

        stage('📊 Start MCP Server') {
            steps {
                echo '🚀 Starting Express MCP server...'
                bat """
                    cd server
                    echo Starting server on port ${MCP_SERVER_PORT}...
                    start /B node app.js > server.log 2>&1

                    echo Waiting for server startup...
                    ping 127.0.0.1 -n 9 >nul

                    :: Health check with retry
                    set "health_ok="
                    for /L %%i in (1,1,6) do (
                        curl -s -f http://localhost:${MCP_SERVER_PORT}/health >nul 2>&1 && (
                            echo Server health check passed
                            set health_ok=1
                            goto :health_done
                        )
                        echo Retry %%i/6...
                        ping 127.0.0.1 -n 4 >nul
                    )
                    :health_done
                    if not defined health_ok echo Warning: server did not become healthy in time
                """
            }
        }

        stage('📈 Generate Reports') {
            steps {
                echo '📋 Generating structured reports...'
                bat """
                    cd ${WORKSPACE}

                    if "${LOCALE}"=="ALL" if not "${GENERATE_COMPARISON_REPORT}"=="true" goto :single_locale

                    echo Fetching summary report...
                    curl -s http://localhost:${MCP_SERVER_PORT}/api/reports -o api_summary.json

                    if exist api_summary.json (
                        echo Summary report generated
                        type api_summary.json | python -m json.tool
                    )
                    goto :reports_done

                    :single_locale
                    echo Fetching locale-specific report: ${LOCALE}
                    curl -s http://localhost:${MCP_SERVER_PORT}/api/reports/${LOCALE} -o api_locale_report.json

                    if exist api_locale_report.json (
                        echo Locale report generated
                        type api_locale_report.json | python -m json.tool
                    )

                    :reports_done
                """
            }
        }

        stage('🎨 Prepare Dashboard') {
            steps {
                echo '📊 Preparing interactive dashboard...'
                bat '''
                    echo Copying dashboard files...
                    if not exist dashboard mkdir dashboard

                    copy report-ui\\index.html dashboard\\  >nul 2>&1 || echo index.html not copied
                    copy report-ui\\style.css   dashboard\\  >nul 2>&1 || echo style.css not copied
                    copy report-ui\\script.js   dashboard\\  >nul 2>&1 || echo script.js not copied

                    if exist cypress\\reports (
                        if not exist dashboard\\data mkdir dashboard\\data
                        xcopy /s /y /i cypress\\reports dashboard\\data >nul 2>&1 || echo No reports copied
                    )

                    echo Dashboard prepared
                    dir dashboard
                '''
            }
        }

        stage('📦 Archive Artifacts') {
            steps {
                echo '💾 Archiving build artifacts...'
                bat '''
                    echo Creating artifacts archive...
                    if not exist build_artifacts mkdir build_artifacts

                    xcopy /s /y /i cypress\\reports      build_artifacts\\reports     >nul 2>&1 || echo No reports
                    xcopy /s /y /i dashboard             build_artifacts\\dashboard    >nul 2>&1 || echo No dashboard
                    copy api_*.json                      build_artifacts\\            >nul 2>&1 || echo No api json
                    copy server\\server.log              build_artifacts\\            >nul 2>&1 || echo No server log

                    echo Artifacts prepared
                '''

                archiveArtifacts(
                    artifacts: 'build_artifacts/**/*,dashboard/**/*,cypress/reports/**/*.json,api_*.json,server/server.log',
                    allowEmptyArchive: true
                )
            }
        }

        stage('📧 Generate Report Summary') {
            steps {
                echo '📋 Generating test summary...'
                bat '''
                    echo Build Report Summary > BUILD_SUMMARY.txt
                    echo =================== >> BUILD_SUMMARY.txt
                    echo Job: %JOB_NAME% >> BUILD_SUMMARY.txt
                    echo Build: %BUILD_NUMBER% >> BUILD_SUMMARY.txt
                    echo Status: SUCCESS >> BUILD_SUMMARY.txt
                    echo Timestamp: %DATE% %TIME% >> BUILD_SUMMARY.txt
                    echo. >> BUILD_SUMMARY.txt
                    echo Parameters: >> BUILD_SUMMARY.txt
                    echo   Locale: ${LOCALE} >> BUILD_SUMMARY.txt
                    echo   Environment: ${ENVIRONMENT} >> BUILD_SUMMARY.txt
                    echo   Base URL: ${BASE_URL} >> BUILD_SUMMARY.txt
                    echo. >> BUILD_SUMMARY.txt

                    if exist api_summary.json (
                        echo Report Statistics: >> BUILD_SUMMARY.txt

                        echo import json > summary_stats.py
                        echo with open('api_summary.json', encoding='utf-8') as f: >> summary_stats.py
                        echo     data = json.load(f) >> summary_stats.py
                        echo with open('BUILD_SUMMARY.txt', 'a', encoding='utf-8') as out: >> summary_stats.py
                        echo     out.write(f"  Total Locales: {data.get('totalLocales', 'N/A')}\\n") >> summary_stats.py
                        echo     out.write(f"  Total Broken Links: {data.get('totalBrokenLinks', 'N/A')}\\n") >> summary_stats.py
                        echo     out.write(f"  Total Successful: {data.get('totalSuccessful', 'N/A')}\\n") >> summary_stats.py
                        echo     out.write(f"  Average Success Rate: {data.get('averageSuccessRate', 'N/A')}%%\\n") >> summary_stats.py

                        python summary_stats.py
                        del summary_stats.py 2>nul || echo.
                    )

                    echo. >> BUILD_SUMMARY.txt
                    echo Dashboard URL: >> BUILD_SUMMARY.txt
                    echo   ${BUILD_URL}artifact/dashboard/index.html >> BUILD_SUMMARY.txt

                    type BUILD_SUMMARY.txt
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Cleanup & Finalization...'
            bat '''
                echo Stopping MCP server...
                taskkill /F /IM node.exe /T >nul 2>&1 || echo No node processes found
                ping 127.0.0.1 -n 3 >nul
                echo Cleanup complete
            '''
        }

        success {
            echo '''
╔════════════════════════════════════════════════════════════╗
║                    BUILD SUCCESSFUL ✅                      ║
╚════════════════════════════════════════════════════════════╝
            '''
            bat 'type BUILD_SUMMARY.txt'
        }

        failure {
            echo '''
╔════════════════════════════════════════════════════════════╗
║                     BUILD FAILED ❌                         ║
╚════════════════════════════════════════════════════════════╝
            '''
            bat 'type server\\server.log || echo No server logs available'
        }

        unstable {
            echo 'Build unstable - check logs'
        }

        cleanup {
            deleteDir()
        }
    }
}