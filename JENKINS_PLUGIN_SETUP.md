# 🔧 Jenkins Plugin Prerequisites & Setup

> Verify and install all required Jenkins plugins for the Link Validator pipeline

---

## **Step 1: Access Jenkins Plugin Manager**

```
1. Open Jenkins: http://localhost:8080
2. Click: "Manage Jenkins" (left sidebar)
3. Click: "Manage Plugins"
4. You'll see 4 tabs: Updates | Available | Installed | Advanced

Status bar at bottom shows: "Jenkins is running normally"
```

---

## **Step 2: Verify Required Plugins**

Switch to **"Installed"** tab and search for each plugin below.

### **REQUIRED PLUGINS** (Core)

#### 1️⃣ Pipeline
```
Search for: "Pipeline"
Full name: "Pipeline"
Status: ✓ Should be installed (Jenkins built-in)

If missing:
1. Go to "Available" tab
2. Search "Pipeline"
3. Check: Pipeline
4. Click "Install without restart"
```

#### 2️⃣ Pipeline: Declarative
```
Search for: "Declarative"
Full name: "Pipeline: Declarative Agent API"
Link: Allows Jenkinsfile syntax we're using

If missing:
1. Go to "Available" tab
2. Search "Pipeline: Declarative"
3. Check both options that appear
4. Click "Install without restart"
```

#### 3️⃣ Pipeline: Groovy
```
Search for: "Groovy"
Full name: "Pipeline Groovy"
Status: Should be installed

If missing:
1. Install same way as above
```

#### 4️⃣ Git
```
Search for: "Git"
Full name: "Git"
Status: ✓ Essential for repo access

If missing:
1. Go to "Available" tab
2. Search "Git plugin"
3. Check "Git" (should be first result)
4. Install without restart
```

---

## **RECOMMENDED PLUGINS** (Enhanced Experience)

#### 5️⃣ Blue Ocean (UI)
```
Search for: "Blue Ocean"
Full name: "Blue Ocean"
Status: Highly recommended for beautiful UI

Installation:
1. Go to "Available" tab
2. Search "Blue Ocean"
3. Check: "Blue Ocean"
4. Click "Install without restart"

Features:
- Beautiful pipeline visualization
- Real-time step progress
- Easy artifact downloads
- Integrated Git integration
```

#### 6️⃣ Blue Ocean: GitHub Extension
```
Search for: "GitHub Extension"
Full name: "Blue Ocean: GitHub Extension Pack"

Installation:
If using GitHub repos:
1. Search "Blue Ocean GitHub"
2. Check the checkbox
3. Install without restart
```

#### 7️⃣ GitHub Integration
```
Search for: "GitHub Integration"
Full name: "GitHub Integration Plugin"

Installation:
For webhook support:
1. Search "GitHub plugin"
2. Check "GitHub plugin"
3. Install without restart
```

#### 8️⃣ Email Extension
```
Search for: "Email Extension"
Full name: "Email Extension Plugin"

Installation:
For build notifications:
1. Search "Email Extension"
2. Check "Email Extension Plugin"
3. Install without restart
```

#### 9️⃣ AnsiColor
```
Search for: "AnsiColor"
Full name: "AnsiColor"

Installation:
For colored console output:
1. Search "AnsiColor"
2. Check "AnsiColor"
3. Install without restart
```

#### 🔟 Timestamper
```
Search for: "Timestamper"
Full name: "Timestamper"

Installation:
For timestamped logs:
1. Search "Timestamper"
2. Check "Timestamper"
3. Install without restart
```

---

## **Step 3: Plugin Installation Checklist**

### Quick Copy-Paste Plugin Names
```
Required (Must Have):
✓ Pipeline
✓ Pipeline: Declarative Agent API
✓ Git

Recommended (Should Have):
✓ Blue Ocean
✓ Blue Ocean GitHub Extension
✓ GitHub Integration Plugin
✓ Email Extension
✓ AnsiColor
✓ Timestamper
```

### Installation Steps (for each plugin)

```
1. Go to "Manage Jenkins" > "Manage Plugins"
2. Click "Available" tab
3. In search box, type plugin name
4. Check the checkbox(es) that appear
5. Click "Install without restart" (button at bottom)
6. Wait for installation to complete (shows progress)
7. Repeat for next plugin
```

---

## **Step 4: Restart Jenkins (if needed)**

### When to Restart
```
Blue Ocean requires restart:
1. Go to "Manage Jenkins" > "Restart Jenkins"
2. Or check "Restart when installation is complete"
   on the plugin installation page
```

### Sign of Successful Restart
```
After restart, Jenkins shows:
"Jenkins is running normally" at top of page
```

---

## **Step 5: Verify Installation**

### Check Installed Plugins
```
1. Go to "Manage Jenkins" > "Manage Plugins"
2. Click "Installed" tab
3. Search for each plugin name
4. Verify checkbox is marked ✓
```

### Test Blue Ocean (if installed)
```
1. Go to Jenkins home
2. Look for "Open Blue Ocean" button (left sidebar)
3. Click it
4. You should see beautiful modern UI
5. Back button returns to classic UI
```

### Test Pipeline Support
```
1. Go to "Manage Jenkins" > "Manage Plugins" > "Available"
2. Search "Declarative"
3. If you see results, declarative pipeline is supported
```

---

## **Step 6: Configure Global Settings (Optional)**

### Email Configuration
```
If you installed "Email Extension Plugin":

1. Go to "Manage Jenkins" > "Configure System"
2. Scroll to "Email Notification"
3. Enter your SMTP settings:
   
   SMTP Server: smtp.gmail.com (or your mail server)
   SMTP Port: 587
   [✓] Use SMTP Authentication
   Username: your-email@gmail.com
   Password: your-app-password
   [✓] Use TLS
   
4. Click "Test Configuration"
5. Check success message
```

### GitHub Integration (Optional)
```
If you have GitHub repos:

1. Go to "Manage Jenkins" > "Configure System"
2. Scroll to "GitHub"
3. Click "Add GitHub Server"
4. Name: github.com
5. API URL: https://api.github.com
6. Credentials: Create new (Personal Access Token)
   - Go to GitHub > Settings > Developer Settings
   - Create token with 'repo' scope
   - Paste in Jenkins
7. Click "Test Connection"
```

---

## **Troubleshooting Plugin Issues**

### Problem: Plugin won't install
```
Solution:
1. Check Jenkins version compatibility
2. Go to "Available" tab
3. Click on plugin name (not checkbox)
4. Read requirements section
5. If incompatible, update Jenkins first
```

### Problem: "Dependency issues"
```
Solution:
1. Jenkins auto-installs dependencies
2. Let it finish installing
3. If error persists, restart Jenkins
```

### Problem: Blue Ocean not appearing after install
```
Solution:
1. Restart Jenkins
   - Go to "Manage Jenkins" > "Restart Jenkins"
   - Or http://localhost:8080/restart
2. Wait 30 seconds for restart
3. Refresh page
4. Look for "Open Blue Ocean" button
```

---

## **Quick Installation Summary**

### For Fastest Setup (15 min):

1. **Required plugins** (required for pipeline):
   ```
   - Pipeline
   - Git
   - Pipeline: Declarative Agent API
   ```

2. **Recommended plugins** (for better experience):
   ```
   - Blue Ocean (must-have for UI)
   - GitHub Integration (if using GitHub)
   - Email Extension (for notifications)
   ```

### Installation Command (if Jenkins API available):
```powershell
# Alternative: Install via Jenkins CLI
$plugins = @(
    "workflow-aggregator",      # Pipeline
    "git",                       # Git
    "blueocean",                 # Blue Ocean
    "github:1.35.0",            # GitHub
    "email-ext"                 # Email
)

foreach ($plugin in $plugins) {
    java -jar jenkins-cli.jar -s http://localhost:8080/ `
        install-plugin $plugin
}

# Then restart
java -jar jenkins-cli.jar -s http://localhost:8080/ restart
```

---

## **Verify All Plugins Ready**

Run this checklist:

```
REQUIRED - All must show ✓
┌─────────────────────────────────────┐
│ Pipeline                    ✓ Found │
│ Git                         ✓ Found │
│ Pipeline: Declarative       ✓ Found │
└─────────────────────────────────────┘

RECOMMENDED - Should have ✓
┌─────────────────────────────────────┐
│ Blue Ocean                  ✓ Found │
│ GitHub Integration          ✓ Found │
│ Email Extension             ✓ Found │
└─────────────────────────────────────┘

Blue Ocean UI
┌─────────────────────────────────────┐
│ Open Blue Ocean button visible  ✓   │
│ Clickable and loads properly    ✓   │
└─────────────────────────────────────┘
```

---

## **Next Step: Create Jenkins Job**

Once all plugins installed and verified:

1. Go to **Jenkins Home**
2. Look for **"Create a new pipeline"** button (Blue Ocean UI)
3. Or click **"New Item"** (classic UI)
4. Follow **Option 1** from JENKINS_JOB_CREATION.md

---

## **Questions?**

If plugins won't install:
1. Check Jenkins version: `Manage Jenkins > About Jenkins`
2. Check plugin compatibility on:
   https://plugins.jenkins.io/
3. Update Jenkins if needed:
   https://www.jenkins.io/download/

**Once plugins ready, let me know and I'll guide you through job creation!** 🚀
