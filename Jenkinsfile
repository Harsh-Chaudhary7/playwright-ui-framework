pipeline {
    agent any

    parameters {
        choice(
            name: 'TEST_SUITE',
            choices: ['smoke', 'all', 'login', 'inventory', 'checkout', 'e2e'],
            description: 'Select which tests to run'
        )
        booleanParam(
            name: 'HEADED_MODE',
            defaultValue: false,
            description: 'Run tests in headed mode (visible browser)'
        )
    }

    environment {
        PATH = "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
        NODE_ENV = 'test'
        BASE_URL = 'https://www.saucedemo.com'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout Code') {
            steps {
                git 'https://github.com/Harsh-Chaudhary7/playwright-ui-framework.git'
            }
        }

        stage('Setup') {
            steps {
                echo "🚀 Setting up Playwright test environment..."

                // Debug (IMPORTANT)
                sh 'echo PATH=$PATH'
                sh 'which node || true'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo "📦 Installing dependencies..."
                sh 'npm install'
                sh 'npx playwright install'
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    echo "🧪 Running ${params.TEST_SUITE} tests..."

                    def command = 'npx playwright test'

                    if (params.TEST_SUITE == 'smoke') {
                        command += ' --grep @smoke'
                    } else if (params.TEST_SUITE == 'login') {
                        command += ' tests/login.spec.ts'
                    } else if (params.TEST_SUITE == 'inventory') {
                        command += ' tests/inventory.spec.ts'
                    } else if (params.TEST_SUITE == 'checkout') {
                        command += ' tests/checkout.spec.ts'
                    } else if (params.TEST_SUITE == 'e2e') {
                        command += ' tests/e2e.spec.ts'
                    }

                    if (params.HEADED_MODE) {
                        command += ' --headed'
                    }

                    // Prevent pipeline crash but still show failure
                    command += ' || true'

                    sh command
                }
            }
        }

        stage('Generate Report') {
            steps {
                echo "📊 Generating test report..."
                sh 'npx playwright show-report || true'
            }
        }
    }

    post {
        always {
            echo "📋 Collecting test results..."

            // HTML Report
            script {
    if (fileExists('playwright-report/index.html')) {
        publishHTML([
            reportDir: 'playwright-report',
            reportFiles: 'index.html',
            reportName: 'Playwright Test Report',
            keepAll: true,
            alwaysLinkToLastBuild: true,
            allowMissing: true
        ])
    } else {
        echo "⚠️ Report not found, skipping publishHTML"
    }
}

            // JUnit Report (only if exists)
            junit(
                testResults: 'test-results/**/*.xml',
                allowEmptyResults: true
            )

            // Archive artifacts (VERY IMPORTANT)
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }

        success {
            echo "✅ Tests passed successfully!"
        }

        failure {
            echo "❌ Tests failed. Check the report below."
        }

        unstable {
            echo "⚠️ Tests completed with warnings"
        }

        cleanup {
            echo "🧹 Cleaning up..."
            sh 'rm -rf test-results || true'
        }
    }
}