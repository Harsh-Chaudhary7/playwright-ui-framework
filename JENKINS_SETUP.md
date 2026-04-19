# Jenkins Setup Guide for Playwright Tests

## Overview
This guide helps you set up a Jenkins job to run your Playwright UI automation tests with reporting and notifications.

## Prerequisites
- Jenkins 2.300+ installed
- Node.js 18+ plugin installed in Jenkins
- Git plugin installed in Jenkins
- Pipeline plugin installed in Jenkins
- HTML Publisher plugin installed in Jenkins

## Setup Steps

### 1. Create a New Pipeline Job

1. Go to Jenkins Dashboard
2. Click **New Item**
3. Enter job name: `Playwright-UI-Tests`
4. Select **Pipeline**
5. Click **OK**

### 2. Configure Pipeline

1. In the job configuration, scroll to **Pipeline** section
2. Select **Pipeline script from SCM**
3. Choose **Git** as SCM
4. Enter your repository URL:
   ```
   https://github.com/YOUR_USERNAME/playwright-ui-framework.git
   ```
5. Set Script Path to: `Jenkinsfile`
6. Click **Save**

### 3. Configure Build Parameters

The Jenkinsfile includes parameters for flexibility:

- **TEST_SUITE**: Choose which tests to run
  - `smoke` - Run quick smoke tests (recommended for every commit)
  - `all` - Run all 40 tests
  - `login` - Run only login tests (12 tests)
  - `inventory` - Run only inventory tests (13 tests)
  - `checkout` - Run only checkout tests (15 tests)
  - `e2e` - Run end-to-end tests (1 test)

- **HEADED_MODE**: Run tests in headed mode (see browser)
  - Default: `false` (headless - faster)
  - Set to `true` for debugging

### 4. Trigger the Job

**Manual Trigger:**
1. Click **Build with Parameters**
2. Select your test suite and options
3. Click **Build**

**Automatic Triggers:**

#### Trigger on Git Push (Webhook)
1. In Jenkins job, go to **Build Triggers**
2. Check **GitHub hook trigger for GITScm polling**
3. In your GitHub repo settings:
   - Go to Settings → Webhooks
   - Add webhook: `https://YOUR_JENKINS_URL/github-webhook/`
   - Content type: `application/json`
   - Events: `Push events`

#### Poll Repository Regularly
1. Check **Poll SCM** under Build Triggers
2. Set schedule: `H/15 * * * *` (every 15 minutes)

#### Scheduled Nightly Tests
1. Check **Build periodically**
2. Set schedule: `0 2 * * *` (daily at 2 AM)

### 5. View Test Reports

After the job completes:

1. **HTML Report**: Click **Playwright Test Report** in build artifacts
2. **Test Results**: View individual test results in Jenkins interface
3. **Build Logs**: Check console output for detailed execution logs

## Job Execution Examples

### Run Smoke Tests (Recommended for CI)
```bash
# This runs 4 critical tests, usually completes in ~30 seconds
npx playwright test --grep @smoke
```

### Run All Tests
```bash
# This runs all 40 tests, takes ~2-3 minutes
npx playwright test
```

### Run Specific Test File
```bash
# Run only login tests
npx playwright test tests/login.spec.ts
```

## Troubleshooting

### Build Fails with "npm: command not found"
- Install Node.js plugin in Jenkins
- Configure Node.js in Jenkins settings:
  1. Manage Jenkins → Tools
  2. NodeJS installations → Add NodeJS
  3. Choose a recent version (18+)

### Tests Timeout
- Increase timeout in Jenkins job configuration
- Default is 30 minutes (can increase in `options` section of Jenkinsfile)

### No Test Reports Generated
- Check if `playwright-report/` directory exists
- Verify `publishHTML` step is configured correctly
- Check Jenkins plugin: **HTML Publisher** is installed

### Browser Doesn't Close
- Ensure `headless: true` in playwright.config.ts
- Check `afterEach` cleanup in test files
- Monitor process count: `ps aux | grep chrome`

## Advanced Configurations

### Email Notifications
Add to `post` section in Jenkinsfile:
```groovy
post {
    always {
        emailext(
            subject: "Test Results: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
            body: "Build: ${env.BUILD_URL}\n\nTests: ${env.BUILD_LOG}",
            to: "your-email@example.com"
        )
    }
}
```

### Slack Notifications
Uncomment in Jenkinsfile:
```groovy
slackSend(color: 'good', message: "Tests passed: ${env.BUILD_URL}")
```

Install Slack plugin first, then configure in Jenkins.

### Parallel Execution
Modify Jenkinsfile to run multiple test suites in parallel:
```groovy
stage('Run Tests') {
    parallel {
        stage('Login Tests') {
            steps {
                sh 'npx playwright test tests/login.spec.ts'
            }
        }
        stage('Inventory Tests') {
            steps {
                sh 'npx playwright test tests/inventory.spec.ts'
            }
        }
        stage('Checkout Tests') {
            steps {
                sh 'npx playwright test tests/checkout.spec.ts'
            }
        }
    }
}
```

## Best Practices

1. **Use Smoke Tests in CI**: Run `@smoke` tests on every commit (fast feedback)
2. **Schedule Full Tests**: Run all 40 tests nightly or on demand
3. **Archive Results**: Keep last 10 builds for historical analysis
4. **Monitor Flaky Tests**: Review logs for intermittent failures
5. **Update Dependencies**: Regularly update Playwright and Node.js
6. **Review Reports**: Check HTML reports after each run for insights

## Environment Variables

The Jenkinsfile sets these variables:
- `NODE_ENV=test`
- `BASE_URL=https://www.saucedemo.com`

To add more:
1. Update the `environment` section in Jenkinsfile
2. Or create a `.env` file in the repository

## Next Steps

1. ✅ Created `Jenkinsfile` in your project
2. 📋 Set up Jenkins job as described above
3. 🚀 Trigger first build with smoke tests
4. 📊 Review test reports
5. 🔧 Configure notifications (optional)
6. 📅 Set up scheduled runs (optional)

---

**Support**: For issues, check Jenkins logs and Playwright documentation at https://playwright.dev/docs/ci
