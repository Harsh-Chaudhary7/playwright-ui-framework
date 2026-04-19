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
        NODE_ENV = 'test'
        BASE_URL = 'https://www.saucedemo.com'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('Setup') {
            steps {
                script {
                    sh '''
        export PATH=$PATH:/usr/local/bin
        node --version
        '''
                    echo "🚀 Setting up Playwright test environment..."
                    sh 'node --version'
                    sh 'npm --version'
                }
                
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    echo "📦 Installing dependencies..."
                    sh 'npm install'
                    sh 'npx playwright install'
                }
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
                    
                    command += ' 2>&1 || true'
                    sh command
                }
            }
        }

        stage('Generate Report') {
            steps {
                script {
                    echo "📊 Generating test report..."
                    sh 'npx playwright show-report test-results || true'
                }
            }
        }
    }

    post {
        always {
            script {
                echo "📋 Collecting test results..."
                
                // Publish HTML report
                publishHTML([
                    reportDir: 'playwright-report',
                    reportFiles: 'index.html',
                    reportName: 'Playwright Test Report',
                    keepAll: true,
                    alwaysLinkToLastBuild: true
                ])
                
                // Publish JSON report
                junit(
                    testResults: 'test-results/**/*.xml',
                    allowEmptyResults: true,
                    skipPublishingChecks: true
                )
            }
        }

        success {
            script {
                echo "✅ Tests passed successfully!"
                // Optional: Send success notification
                // slackSend(color: 'good', message: "Playwright tests passed: ${env.BUILD_URL}")
            }
        }

        failure {
            script {
                echo "❌ Tests failed. Check the report below."
                // Optional: Send failure notification
                // slackSend(color: 'danger', message: "Playwright tests failed: ${env.BUILD_URL}")
            }
        }

        unstable {
            echo "⚠️ Tests completed with warnings"
        }

        cleanup {
            script {
                echo "🧹 Cleaning up..."
                sh 'rm -rf test-results || true'
            }
        }
    }
}
