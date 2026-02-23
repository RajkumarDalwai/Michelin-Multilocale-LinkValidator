# 🔍 Michelin Multi-Locale Link Validator

> **AI-powered, CI/CD-integrated, multi-locale link validation system**
> 
> Automated daily scanning of website links across 10+ locales with intelligent insights, comprehensive reporting, and Jenkins integration.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm 6+
- Chrome/Chromium browser (for Cypress)
- Git
- Jenkins (optional, for CI/CD)

### Installation

```bash
# Clone repository
git clone <your-repo-url>
cd Michelin-Multilocale-LinkValidator

# Install dependencies
npm install
cd server && npm install && cd ..

# Start the Express server
cd server && node app.js

# In another terminal, run Cypress tests
npx cypress run --env locale=en-IN,environment=Production
```

### Access Dashboard
```
http://localhost:3000
```

---

## 📋 Project Structure

```
.
├── cypress/
│   ├── e2e/
│   │   ├── Pages/
│   │   │   └── PageRedirectionPage.js      # Page locators
│   │   └── Tests/
│   │       └── Automated-Vehicle-Inspection/
│   │           └── Homepage.cy.js          # Test suite
│   ├── reports/                             # Generated reports (JSON)
│   ├── fixtures/
│   ├── support/
│   │   ├── commands.js                     # Custom Cypress commands
│   │   └── e2e.js
│   └── config.js
├── server/
│   ├── app.js                              # Express MCP server
│   ├── routes/
│   │   └── report.js                       # API endpoints
│   ├── controllers/
│   │   └── reportController.js             # Business logic
│   └── package.json
├── ai/
│   └── insightGenerator.js                 # OpenAI integration
├── report-ui/
│   ├── index.html                          # Dashboard UI
│   ├── style.css                           # Professional styling
│   └── script.js                           # Charts & interactions
├── Jenkinsfile                             # CI/CD pipeline
├── cypress.config.js                       # Cypress configuration
├── package.json
├── JENKINS_SETUP.md                        # Jenkins guide
├── INTEGRATION_GUIDE.md                    # Integration options
└── README.md                               # This file
```

---

## 🎯 Key Features

### ✅ Link Validation
- **Multi-locale support** - Test 10+ language versions
- **HTTP status detection** - Identify 404s, 5xx, timeouts
- **Response time tracking** - Monitor performance
- **Skipped link detection** - Exclude non-HTTP URLs

### 📊 Reporting
- **Structured JSON output** - Machine-readable reports
- **Real-time metrics** - Success rates, broken counts
- **Historical data** - Accumulate reports over time
- **Comparison reports** - Benchmark across locales

### 🤖 AI Insights (Optional)
- **OpenAI integration** - Intelligent pattern analysis
- **Root cause detection** - Why links fail
- **Recommendations** - How to fix issues
- **Severity classification** - Prioritize fixes

### 🚀 CI/CD Integration
- **Jenkins pipeline** - Automated daily scans
- **Parameter-driven** - Flexible locale/environment selection
- **Artifact archival** - 30-day build history
- **Notifications** - Email & Slack alerts

### 📈 Dashboard
- **Professional UI** - Beautiful, responsive design
- **Interactive charts** - Chart.js visualizations
- **Broken links table** - Detailed failure info
- **Summary metrics** - Key stats at a glance

---

## 🔧 Configuration

### Environment Variables
Create `.env` file in `server/` directory:

```bash
# Required
PORT=3000

# Optional (for AI insights)
OPENAI_API_KEY=sk-your-api-key-here

# Optional
NODE_ENV=production
```

### Cypress Environment Variables
```bash
# Set in Jenkinsfile or via --env flag
baseUrl=https://automated-vehicle-inspection.michelin.com/
locale=en-IN
environment=Production
```

---

## 📚 Usage

### 1. Run Tests Locally

```bash
# Single locale
npx cypress run --env locale=en-IN,environment=Production

# Multiple locales (manual loop)
for locale in en-IN fr-FR es-ES; do
  npx cypress run --env locale=$locale
done
```

### 2. Start Express Server

```bash
cd server
npm install  # if needed
node app.js
```

### 3. Access Dashboard

```
http://localhost:3000
```

Enter locale name (e.g., `en-IN`) and click "Load Report"

### 4. API Endpoints

```bash
# Get specific locale report
curl http://localhost:3000/api/reports/en-IN

# Get summary across all locales
curl http://localhost:3000/api/reports

# Compare multiple locales
curl http://localhost:3000/api/reports/compare/en-IN,fr-FR,es-ES

# Health check
curl http://localhost:3000/health
```

---

## 🚀 Jenkins Deployment

### Quick Setup (5 minutes)

1. **Create Jenkins Job**
   - New Item > Pipeline
   - Repository URL: `<your-repo>`
   - Script path: `Jenkinsfile`

2. **Build with Parameters**
   ```
   LOCALE: en-IN (or ALL)
   ENVIRONMENT: Production
   BASE_URL: https://automated-vehicle-inspection.michelin.com/
   ```

3. **Access Reports**
   ```
   http://jenkins.company.com/job/link-validator/123/artifact/dashboard/index.html
   ```

### Detailed Setup
See [JENKINS_SETUP.md](JENKINS_SETUP.md)

---

## 🤖 OpenAI Integration

### Setup (Optional)

1. **Get API Key**
   - Visit https://platform.openai.com/api/keys
   - Create new secret key

2. **Configure**
   ```bash
   # In server/.env
   OPENAI_API_KEY=sk-...
   ```

3. **Restart Server**
   ```bash
   cd server && node app.js
   ```

4. **AI Features Enabled**
   - Dashboard shows AI insights
   - Severity classification
   - Recommended actions
   - Pattern detection

---

## 📊 Report Format

### JSON Structure

```json
{
  "platform": "Web",
  "locale": "en-IN",
  "environment": "Production",
  "pagesScanned": 1,
  "totalLinks": 108,
  "successCount": 105,
  "brokenLinks": [
    {
      "page": "https://example.com/",
      "url": "https://broken.com/page",
      "status": 404,
      "responseTime": 245
    }
  ],
  "skipped": 3,
  "timestamp": "2026-02-21T17:08:48.345Z"
}
```

---

## 🧪 Test Locally (Like Jenkins)

### Windows PowerShell
```powershell
.\run-local-pipeline.ps1 -ENVIRONMENT Production -LOCALES @("en-IN", "fr-FR", "es-ES")
```

### Linux/Mac Bash
```bash
chmod +x run-local-pipeline.sh
./run-local-pipeline.sh
```

---

## 📖 Documentation

- **[Jenkins Setup Guide](JENKINS_SETUP.md)** - Complete Jenkins integration
- **[Integration Guide](INTEGRATION_GUIDE.md)** - OpenAI vs Jenkins comparison
- **[Cypress Config](cypress.config.js)** - Test configuration

---

## 🐛 Troubleshooting

### Chrome not found
```bash
# Ubuntu
sudo apt-get install chromium-browser

# macOS
brew install chromium
```

### Port 3000 already in use
```bash
# Kill process using port 3000
lsof -i :3000 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### Reports not generating
```bash
# Check permissions
ls -la cypress/reports/
chmod 755 cypress/reports/

# Verify Cypress config has saveReport task
cat cypress.config.js | grep saveReport
```

### Server won't start
```bash
# Check dependencies
npm list

# Reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 Scaling & Performance

### Multi-Locale Scanning
- **Sequential**: 1 locale at a time (safe, slower)
- **Parallel**: Multiple locales simultaneously (faster, Jenkins native)

### Optimization Tips
```bash
# Use npm ci instead of npm install (faster)
npm ci --prefer-offline

# Cache dependencies in Jenkins
npm cache add <package>

# Run tests in headless mode (already configured)
npx cypress run --headed=false
```

---

## 🔒 Security

### Best Practices
- ✅ Keep OpenAI key in `.env` (never commit)
- ✅ Use GitHub secrets for CI/CD
- ✅ Rotate API keys regularly
- ✅ Monitor Jenkins logs for errors
- ✅ Restrict dashboard to VPN

### Environment Variable Security
```bash
# .env (local) - NEVER commit
OPENAI_API_KEY=sk-...

# Jenkins - Use Secret Manager
# Configure > Secret text
```

---

## 📞 Support

### Getting Help

1. **Check Logs**
   ```bash
   # Server logs
   cat server/server.log
   
   # Jenkins logs
   # Job > Build #X > Console Output
   ```

2. **Common Issues**
   - See [JENKINS_SETUP.md](JENKINS_SETUP.md#troubleshooting)
   - See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)

3. **Debug Mode**
   ```bash
   # Verbose Cypress output
   npx cypress run --headed
   
   # Server debug
   DEBUG=* node server/app.js
   ```

---

## 🎓 Learning Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Express.js Guide](https://expressjs.com/)
- [Jenkins Pipeline](https://www.jenkins.io/doc/book/pipeline/)
- [OpenAI API](https://platform.openai.com/docs/api-reference)

---

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Multi-locale link validation
- ✅ Express MCP server with REST APIs
- ✅ Professional dashboard UI
- ✅ Jenkins CI/CD pipeline
- ✅ OpenAI integration (optional)
- ✅ JSON report generation
- ✅ Comprehensive documentation

---

## 📄 License

This project is proprietary to Michelin. Unauthorized use is prohibited.

---

## 🙏 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Push to branch: `git push origin feature/your-feature`
4. Submit pull request

---

## 🎉 Ready to Deploy?

### Next Steps
1. ✅ Configure Jenkins (see [JENKINS_SETUP.md](JENKINS_SETUP.md))
2. ✅ Set environment variables
3. ✅ Run first test: `npm test`
4. ✅ Deploy to production
5. ✅ Schedule daily scans
6. ✅ Monitor reports

**Start today!** 🚀

---

**Last Updated**: February 21, 2026
**Maintained By**: QA Automation Team
**Support**: automation-team@michelin.com
