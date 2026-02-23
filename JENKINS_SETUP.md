# 🚀 Jenkins Setup Guide - Link Validator Pipeline

## Prerequisites

- ✅ Jenkins 2.361+ installed
- ✅ Git plugin enabled
- ✅ Pipeline plugin enabled (Blue Ocean recommended)
- ✅ Node.js & npm installed on Jenkins agents
- ✅ Chrome/Chromium browser installed (for Cypress)

---

## Step 1: Create Jenkins Job

### Option A: Using Blue Ocean (Recommended)
```
1. Click "Create a new pipeline" in Jenkins homepage
2. Select "GitHub" (or your git provider)
3. Authenticate and select your repository
4. Jenkins will auto-detect Jenkinsfile
5. Save and run
```

### Option B: Using Classic Pipeline Job
```
1. New Item
2. Enter job name: "Link-Validator-Pipeline"
3. Select "Pipeline"
4. Click OK
5. Scroll to "Pipeline" section
6. Definition: "Pipeline script from SCM"
7. SCM: Git
8. Repository URL: <your-repo-url>
9. Branch: */main (or your branch)
10. Script Path: Jenkinsfile
11. Save
```

---

## Step 2: Configure Build Parameters

Jenkins will auto-read parameters from Jenkinsfile, but you can customize:

### In Job Configuration > General:

✅ **Check: "This project is parameterized"**

Parameters should appear automatically:
- `LOCALE` (choice)
- `ENVIRONMENT` (choice)
- `BASE_URL` (string)
- `GENERATE_COMPARISON_REPORT` (boolean)

---

## Step 3: Configure Build Triggers (Optional)

### For Scheduled Scans:
**Configure > Build Triggers**

- ✅ Check "Build periodically"
- Schedule: `H 2 * * *` (Daily at 2 AM)

Or use cron expressions:
```
# Every day at 2 AM
H 2 * * *

# Every 6 hours
H */6 * * *

# Monday-Friday at 9 AM
H 9 * * 1-5
```

### For GitHub Push Triggers:
- ✅ Check "GitHub hook trigger for GITScm polling"
- Add webhook to GitHub repo

---

## Step 4: Configure Node.js on Jenkins Agent

### Ensure Node.js is installed:
```bash
# On Jenkins agent machine
node --version  # Should be v14+
npm --version   # Should be v6+
```

### If not installed:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# MacOS
brew install node

# Windows
# Download from https://nodejs.org/
```

---

## Step 5: First Build

### Option 1: Manual Build with Parameters
```
1. Go to job
2. Click "Build with Parameters"
3. Select:
   - LOCALE: en-IN (or ALL for multi-locale)
   - ENVIRONMENT: Production
   - BASE_URL: https://automated-vehicle-inspection.michelin.com/
   - GENERATE_COMPARISON_REPORT: false (or true)
4. Click "Build"
```

### Option 2: CLI Trigger
```bash
# Using Jenkins CLI
java -jar jenkins-cli.jar -s http://localhost:8080 \
  build "Link-Validator-Pipeline" \
  -p LOCALE=en-IN \
  -p ENVIRONMENT=Production \
  -p BASE_URL=https://automated-vehicle-inspection.michelin.com/ \
  -p GENERATE_COMPARISON_REPORT=false
```

---

## Step 6: Access Reports

### Dashboard URL (After Build Success):
```
http://<jenkins-host>:8080/job/Link-Validator-Pipeline/123/artifact/dashboard/index.html
```

### Direct API Report:
```
http://<jenkins-host>:8080/job/Link-Validator-Pipeline/123/artifact/api_summary.json
```

### Build Logs:
```
http://<jenkins-host>:8080/job/Link-Validator-Pipeline/123/console
```

---

## Step 7: Set Up Multi-Locale Automation

### Create Multiple Jobs (One per Locale):

**Job 1: Scan en-IN**
```
Parameters:
  LOCALE: en-IN
  ENVIRONMENT: Production
Schedule: H 2 * * * (daily 2 AM)
```

**Job 2: Scan fr-FR**
```
Parameters:
  LOCALE: fr-FR
  ENVIRONMENT: Production
Schedule: H 3 * * * (daily 3 AM)
```

**Job 3: Generate Comparison**
```
Parameters:
  LOCALE: ALL
  ENVIRONMENT: Production
  GENERATE_COMPARISON_REPORT: true
Schedule: H 4 * * * (daily 4 AM)
```

### Or use Single "ALL" Job:
```
Set LOCALE: ALL
Jenkinsfile will loop through all locales
```

---

## Step 8: Notifications & Alerts

### Email Notifications:
**Configure > Post-build Actions**

- ✅ Add post-build action: "Email Notification"
- Recipients: team@company.com
- Send when build fails or is unstable

### Slack Integration:
```groovy
// In Jenkinsfile post section (already included)

post {
    success {
        slackSend(
            color: 'good',
            message: "✅ Link Validation Passed\nJob: ${JOB_NAME}\nBuild: ${BUILD_NUMBER}"
        )
    }
    failure {
        slackSend(
            color: 'danger',
            message: "❌ Link Validation Failed\nJob: ${JOB_NAME}\nBuild: ${BUILD_NUMBER}\nCheck: ${BUILD_URL}"
        )
    }
}
```

---

## Step 9: Dashboard Customization

### Access Reports:
1. Build completes successfully
2. Click "Artifacts" in build page
3. Open `dashboard/index.html`

### Features Available:
- 📊 Load specific locale report
- 📈 View summary across all locales
- 🔗 See broken links with HTTP status
- ⏱️ Check response times
- 🤖 AI insights (if OpenAI configured)

### Load Report in Dashboard:
1. Input field: `en-IN` (or other locale)
2. Click "Load Report"
3. View metrics, charts, broken links

---

## Step 10: Production Checklist

- [ ] Jenkins job created and tested
- [ ] Build parameters configured
- [ ] Build triggers set up (schedule or webhook)
- [ ] Notifications configured (email/Slack)
- [ ] Node.js installed on agent
- [ ] Chrome/Chromium installed on agent
- [ ] Reports directory readable
- [ ] Dashboard accessible via artifacts
- [ ] Git credentials configured
- [ ] First successful build completed

---

## Troubleshooting

### Issue: "Cannot find module 'X'"
```bash
# Clean install on agent
cd /path/to/workspace
rm -rf node_modules package-lock.json
npm install
```

### Issue: Chrome not found for Cypress
```bash
# Ubuntu
sudo apt-get install -y chromium-browser

# CentOS
yum install -y chromium

# Or use headless mode (already configured in Jenkinsfile)
```

### Issue: Server fails to start
```bash
# Check port 3000 is available
lsof -i :3000
# Kill if needed: kill -9 <PID>
```

### Issue: Reports not archived
```bash
# Verify permissions
ls -la ${WORKSPACE}/cypress/reports/
chmod 755 ${WORKSPACE}/cypress/reports/*
```

---

## Performance Optimization

### Parallel Multi-Locale Testing:
```groovy
// Advanced: Run multiple locales in parallel
parallel {
    'en-IN': {
        sh 'npx cypress run --env locale=en-IN'
    },
    'fr-FR': {
        sh 'npx cypress run --env locale=fr-FR'
    },
    'es-ES': {
        sh 'npx cypress run --env locale=es-ES'
    }
}
```

### Cache Dependencies:
```groovy
// Speed up builds with npm cache
sh 'npm ci --prefer-offline --no-audit'
```

---

## Scaling to Multiple Environments

### Use Matrix/Declarative Matrix (Jenkins 2.361+):

```groovy
pipeline {
    agent any
    
    matrix {
        axes {
            axis {
                name 'LOCALE'
                values 'en-IN', 'fr-FR', 'es-ES'
            }
            axis {
                name 'ENVIRONMENT'
                values 'Development', 'Staging', 'Production'
            }
        }
        stages {
            stage('Test') {
                steps {
                    echo "Testing ${LOCALE} in ${ENVIRONMENT}"
                    sh 'npm test'
                }
            }
        }
    }
}
```

---

## Advanced: Webhook Integration

### GitHub Webhook Setup:
1. GitHub Repo > Settings > Webhooks > Add webhook
2. Payload URL: `http://<jenkins-host>/github-webhook/`
3. Content type: application/json
4. Trigger on: Push events
5. Active: ✅

---

## Support & Next Steps

✅ **System Ready to:**
- Run daily automated link validation
- Generate reports across locales
- Archive historical data
- Alert on failures
- Integrate with team workflows

🎯 **Optional Enhancements:**
- Add OpenAI for AI insights
- Create dashboard aggregation
- Set up trend analysis
- Configure email reports
- Add Slack notifications

---

**Need help? Check logs in Jenkins:**
```
Job > Build #X > Console Output
```

Good luck! 🚀
