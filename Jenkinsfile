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
            description: 'Run tests in headed mode'
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

        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Harsh-Chaudhary7/playwright-ui-framework.git'
            }
        }

        stage('Setup') {
            steps {
                echo "🚀 Setting up Playwright environment..."
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
                    } else if (params.TEST_SUITE != 'all') {
                        command += " tests/${params.TEST_SUITE}.spec.ts"
                    }

                    if (params.HEADED_MODE) {
                        command += ' --headed'
                    }

                    sh command
                }
            }
        }

        stage('Report Info') {
            steps {
                echo "📊 Playwright report generated in playwright-report/"
            }
        }
    }

    post {
        always {
            echo "📋 Collecting test results..."

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
                    echo "⚠️ Report not found"
                }
            }

            junit(
                testResults: 'test-results/results.xml',
                allowEmptyResults: true
            )

            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
        }

        success {
            echo "✅ Tests passed successfully!"
        }

        failure {
            echo "❌ Tests failed. Check the report."
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