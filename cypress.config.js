const fs = require('fs');
const path = require('path');

module.exports = {

env: {
    baseUrl: "https://automated-vehicle-inspection.michelin.com/",
    locale: "en-IN",
    environment: "Production",
  },

retries: {
    runMode: 1,
    openMode: 0,
  }, 

e2e: {
    chromeWebSecurity: false,
    watchForFileChanges: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 60000,

    setupNodeEvents(on, config) {
      // Task: Save link validation report as JSON
      on('task', {
        saveReport(reportData) {
          const reportsDir = path.join(__dirname, 'cypress', 'reports');
          
          // Create reports directory if it doesn't exist
          if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
          }

          // Save report with locale as filename
          const filename = `${reportData.locale}.json`;
          const filepath = path.join(reportsDir, filename);
          fs.writeFileSync(filepath, JSON.stringify(reportData, null, 2));
          
          console.log(`✅ Report saved: ${filepath}`);
          return null;
        },
      });
    },

  specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',

  },
  
};
