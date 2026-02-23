# 🚀 Jenkins Job Creation - Step-by-Step Guide

> Complete walkthrough for setting up the Multi-Locale Link Validator pipeline in Jenkins

---

## **Prerequisites Checklist**

Before starting, verify you have:

- [ ] Jenkins 2.361+ installed and running
- [ ] Git plugin enabled in Jenkins
- [ ] Pipeline plugin installed (`Manage Jenkins > Manage Plugins > Pipeline`)
- [ ] Blue Ocean plugin installed (optional but recommended: `Blue Ocean`)
- [ ] Node.js 14+ installed on Jenkins agents
- [ ] Chrome/Chromium browser available on Jenkins agents
- [ ] Repository pushed to GitHub/GitLab/Bitbucket

---

## **OPTION 1: Create Job Using Blue Ocean (RECOMMENDED - 5 min)**

### Step 1: Access Jenkins
```
1. Open Jenkins dashboard: http://localhost:8080
2. Look for "Create a new pipeline" button (blue button on home)
3. Click it
```

### Step 2: Select Repository Source
```
1. Choose your Git provider:
   - GitHub
   - GitLab
   - Bitbucket
   - Or "I have a Jenkinsfile"
   
2. Click on your provider
```

### Step 3: Authenticate
```
For GitHub:
1. Click "Create an access token here"
2. Paste your GitHub personal access token
3. Click "Connect"

For GitLab/Bitbucket:
Follow similar steps for your platform
```

### Step 4: Select Repository
```
1. Select your organization
2. Find and click: "Michelin-Multilocale-LinkValidator"
3. Click "Create Pipeline"
```

### Step 5: Jenkins Auto-Detects Jenkinsfile
```
Jenkins will automatically:
- Detect Jenkinsfile in repo root
- Create job with all parameters
- Enable Blue Ocean visualization

That's it! Job is created.
```

### Step 6: Run First Build
```
1. In Blue Ocean, click "Run" button
2. Blue Ocean will prompt for parameters:
   - LOCALE: Choose "en-IN" (or "ALL")
   - ENVIRONMENT: Choose "Production"
   - BASE_URL: Keep default
   - GENERATE_COMPARISON_REPORT: false (for now)
3. Click "Run"
```

---

## **OPTION 2: Create Job Using Classic UI (10 min)**

### Step 1: Create New Job
```
1. Click "New Item" (top-left)
2. Enter job name:
   Link-Validator-Multi-Locale
   
3. Select: "Pipeline"
4. Click "OK"
```

### Step 2: Configure General Settings
```
1. In the job config page:

Description:
"Multi-locale link validation using Cypress, 
powered by OpenAI for intelligent insights"

[✓] Discard old builds
    Strategy: Days to keep builds = 30
    
[✓] Build Name and Description
    Build name: #${BUILD_NUMBER} - ${LOCALE}
```

### Step 3: Add Build Parameters
```
Scroll to "Build Parameters" section
Click: "Add Parameter" button

ADD PARAMETER 1:
Type: Choice Parameter
Name: LOCALE
Choices: (enter each on new line)
ALL
en-IN
en-US
fr-FR
de-DE
es-ES
pt-BR
ja-JP
zh-CN

ADD PARAMETER 2:
Type: Choice Parameter
Name: ENVIRONMENT
Choices: (enter each on new line)
Production
Staging
Development

ADD PARAMETER 3:
Type: String Parameter
Name: BASE_URL
Default value: https://automated-vehicle-inspection.michelin.com/

ADD PARAMETER 4:
Type: Boolean Parameter
Name: GENERATE_COMPARISON_REPORT
Default: false
```

### Step 4: Configure Pipeline Script
```
Scroll to "Pipeline" section

Definition: Pipeline script from SCM

SCM: Git
  Repository URL: <your-repo-url>
  
  Credentials: (create if needed)
    - Username: your-github-username
    - Password: your-github-token
  
  Branches to build: */main (or your branch)

Script path: Jenkinsfile

Lightweight checkout: false
```

### Step 5: Save Job
```
Click: "Save" button (bottom)
```

### Step 6: Run First Build
```
1. On job page, click: "Build with Parameters"
2. Select parameters:
   - LOCALE: en-IN
   - ENVIRONMENT: Production
3. Click: "Build"
```

---

## **OPTION 3: Create Job Using Jenkins CLI (Advanced - 5 min)**

### Prerequisites
```powershell
# Download Jenkins CLI JAR
Invoke-WebRequest `
  -Uri "http://localhost:8080/jnlpJars/jenkins-cli.jar" `
  -OutFile "jenkins-cli.jar"

# Verify
java -jar jenkins-cli.jar -s http://localhost:8080/ help
```

### Create Job from Jenkinsfile
```powershell
java -jar jenkins-cli.jar -s http://localhost:8080/ `
  create-job "Link-Validator-Multi-Locale" < Jenkinsfile
```

### Configure Parameters (Via Script)
```powershell
# Create config XML with parameters
$jobConfig = @'
<?xml version="1.0" encoding="UTF-8"?>
<org.jenkinsci.plugins.workflow.job.WorkflowJob plugin="workflow-job@1343.v622901d5a_939">
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition">
    <scm class="hudson.plugins.git.GitSCM">
      <repositories>
        <hudson.plugins.git.GitRepository>
          <url>YOUR_REPO_URL</url>
        </hudson.plugins.git.GitRepository>
      </repositories>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
  </definition>
  <properties>
    <hudson.model.ParametersDefinitionProperty>
      <parameterDefinitions>
        <hudson.model.ChoiceParameterDefinition>
          <name>LOCALE</name>
          <choices><a-item>ALL</a-item><a-item>en-IN</a-item></choices>
        </hudson.model.ChoiceParameterDefinition>
      </parameterDefinitions>
    </hudson.model.ParametersDefinitionProperty>
  </properties>
</org.jenkinsci.plugins.workflow.job.WorkflowJob>
'@

$jobConfig | java -jar jenkins-cli.jar -s http://localhost:8080/ `
  update-job "Link-Validator-Multi-Locale"
```

---

## **STEP 7: Access Build Results**

### During Build
```
1. Click on build number (e.g., #1)
2. View console output
3. See real-time test progress
```

### After Build (Success)
```
Build page shows:

Build Status: SUCCESS (blue checkmark)

Artifacts available:
├── dashboard/
│   ├── index.html        <- Click to view dashboard
│   ├── style.css
│   └── script.js
├── cypress/reports/
│   ├── en-IN.json
│   └── ...
└── api_summary.json
```

### View Dashboard Report
```
1. On build page, look for "Artifacts" section
2. Click: dashboard/index.html
3. Opens interactive dashboard with:
   - Charts and metrics
   - Broken links table
   - AI insights (if enabled)
   - Locale comparison
```

### Download Artifacts
```
1. Click: "Last successful artifacts"
2. Select files to download
3. Or use direct URL:
   
   http://localhost:8080/job/Link-Validator-Multi-Locale/123/artifact/dashboard/index.html
```

---

## **STEP 8: Configure Build Triggers (Optional)**

### Schedule Daily Scans
```
On job configuration page:
Scroll to "Build Triggers"

[✓] Build periodically
    Schedule: H 2 * * *
    
This runs the job every day at 2 AM
```

### Schedule by Locale
```
Create 3 separate scheduled jobs:

Job 1: Link-Validator-en-IN
  Schedule: H 2 * * * (2:00 AM)
  Parameters: LOCALE=en-IN
  
Job 2: Link-Validator-fr-FR
  Schedule: H 3 * * * (3:00 AM)
  Parameters: LOCALE=fr-FR
  
Job 3: Link-Validator-Comparison
  Schedule: H 4 * * * (4:00 AM)
  Parameters: LOCALE=ALL, GENERATE_COMPARISON_REPORT=true
```

### GitHub Push Trigger (Auto-trigger on code changes)
```
[✓] GitHub hook trigger for GITScm polling

Then in your GitHub repo:
1. Go to Settings > Webhooks
2. Add webhook:
   Payload URL: http://your-jenkins.com/github-webhook/
   Content type: application/json
   Events: Push events
   [✓] Active
3. Click "Add webhook"
```

---

## **STEP 9: Configure Notifications (Optional)**

### Email Notifications
```
On job configuration page:
Scroll to "Post-build Actions"

Click: "Add post-build action"
Select: "Email Notification"

Recipient list: team@company.com
Include test results: ✓

Advanced settings:
┌─────────────────────────────┐
│ Send e-mail for every        │
│ unsuccessful build           │
└─────────────────────────────┘
```

### Slack Notifications
```
Prerequisites:
- Install "Slack Notification Plugin"
- Get Slack webhook URL

Configuration:
Scroll to "Post-build Actions"
Click: "Add post-build action"
Select: "Slack Notification"

Workspace: your-workspace.slack.com
Channel: #dev-alerts
Webhook URL: https://hooks.slack.com/services/...

Message template:
Build *${BUILD_DISPLAY_NAME}* ${BUILD_STATUS}
Locale: ${LOCALE}
Success Rate: Check dashboard
```

---

## **STEP 10: First Build Walkthrough**

### Run Build
```
1. On job page, click "Build with Parameters"
2. Select:
   - LOCALE: en-IN
   - ENVIRONMENT: Production
   - BASE_URL: (keep default)
   - GENERATE_COMPARISON_REPORT: false
3. Click "Build"
```

### Watch Progress
```
Console output will show:

STEP 1: Initialize
  ✓ Workspace initialized
  ✓ Dependencies ready

STEP 2: Install Dependencies
  ✓ npm packages installed

STEP 3: Run Cypress Tests
  Testing locale: en-IN
  ✓ 108 links validated
  ✓ 0 broken links

STEP 4: Start MCP Server
  ✓ Server running on port 3000

STEP 5: Generate Reports
  ✓ Summary report generated
  
STEP 6: Archive Artifacts
  ✓ Reports archived

BUILD COMPLETE - SUCCESS
```

### View Results
```
1. Build finished successfully
2. Click "Artifacts" button
3. Download or view dashboard/index.html
```

---

## **Troubleshooting**

### Build Fails: "Cannot find module 'cypress'"
```
Solution:
1. Ensure Node.js 14+ installed on agent
2. npm install should run successfully
3. Check: npm list cypress
```

### Build Fails: "Chrome not found"
```
Solution:
Jenkins agent needs Chrome/Chromium:

Ubuntu/Debian:
sudo apt-get install chromium-browser

MacOS:
brew install chromium

Windows:
Download from https://www.chromium.org/
```

### Build Fails: "Git repository not accessible"
```
Solution:
1. Verify Git credentials in Jenkins
2. Test SSH key or personal token
3. Check repository URL is accessible
```

### Dashboard Not Loading
```
Solution:
1. Verify build completed successfully
2. Check "Artifacts" button shows files
3. Try direct URL: job/123/artifact/dashboard/index.html
```

---

## **Quick Reference: Jenkins URLs**

```
Jenkins Dashboard:
http://localhost:8080

Job Page:
http://localhost:8080/job/Link-Validator-Multi-Locale

Build Results:
http://localhost:8080/job/Link-Validator-Multi-Locale/123

Dashboard Report:
http://localhost:8080/job/Link-Validator-Multi-Locale/123/artifact/dashboard/index.html

Console Output:
http://localhost:8080/job/Link-Validator-Multi-Locale/123/console
```

---

## **Next: Advanced Configuration**

After successful first build:

1. **Multi-Locale Automation** (1 hour)
   - Create jobs for each locale
   - Schedule them to run in sequence
   - Generate daily comparison reports

2. **CI/CD Integration** (1 hour)
   - Link to GitHub/GitLab webhooks
   - Auto-trigger on code changes
   - Enforce tests before merge

3. **AI Insights** (30 min)
   - Add OpenAI API key to Jenkins credentials
   - Enable SmartAnalyzer plugin
   - Get intelligent recommendations

4. **Team Dashboard** (1 hour)
   - Create Jenkins views for team
   - Aggregate reports across locales
   - Real-time status monitoring

---

## **Questions?**

If you encounter issues:
1. Check Jenkins logs: `Manage Jenkins > System Log`
2. Verify agent has all prerequisites
3. Check Jenkinsfile syntax: `Validate Declarative Pipeline`
4. Review console output of failed build

---

**Ready to create your first job? Let's go! 🚀**
