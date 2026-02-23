// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


//-==================================== 🔧 Custom Commands : URL Validation ============================//

Cypress.Commands.add('validateAllLinks', (locator) => {
  const brokenLinks = [];
  const reportData = {
    platform: 'Web',
    locale: Cypress.env('locale') || 'en-US',
    environment: Cypress.env('environment') || 'Development',
    pagesScanned: 1,
    totalLinks: 0,
    successCount: 0,
    brokenLinks: [],
    skipped: 0,
    timestamp: new Date().toISOString(),
  };

  let currentPage = '';

  // Get current page URL
  cy.url().then((url) => {
    currentPage = url;
  });

  cy.get(locator).each(($span) => {
    const $link = $span.closest('a');

    if (!$link.length) {
      reportData.skipped++;
      cy.log(`Skipped (no parent <a>): ${$span.text().trim()}`);
      return;
    }

    const href = $link.prop('href') || $link.attr('href') || '';
    const linkText = $span.text().trim();

    if (!href || !/^https?:\/\//i.test(href)) {
      reportData.skipped++;
      cy.log(`Skipping non-HTTP URL: ${href || '(empty)'} → "${linkText}"`);
      return;
    }

    reportData.totalLinks++;

    cy.request({
      url: href,
      failOnStatusCode: false,
      timeout: 20000,
    }).then((response) => {
      const responseTime = response.duration || 0;
      const status = response.status;

      if (status === 404) {
        brokenLinks.push({
          page: currentPage,
          url: href,
          status: 404,
          responseTime,
        });
      } else if (status >= 500 && status < 600) {
        brokenLinks.push({
          page: currentPage,
          url: href,
          status,
          responseTime,
        });
      } else if ([200, 201, 204, 301, 302, 307, 308].includes(status)) {
        reportData.successCount++;
      } else {
        brokenLinks.push({
          page: currentPage,
          url: href,
          status,
          responseTime,
        });
      }
    });
  });

  cy.then(() => {
    // Compile final report
    reportData.brokenLinks = brokenLinks;

    cy.log('───────────────────────────────');
    cy.log('📊 Link Validation Summary');
    cy.log(`Platform: ${reportData.platform}`);
    cy.log(`Locale: ${reportData.locale}`);
    cy.log(`Environment: ${reportData.environment}`);
    cy.log(`Total Links: ${reportData.totalLinks}`);
    cy.log(`✅ Successfully validated: ${reportData.successCount}`);
    cy.log(`❌ Broken Links: ${reportData.brokenLinks.length}`);
    cy.log(`⏭️ Skipped: ${reportData.skipped}`);
    cy.log('───────────────────────────────');

    // Save report to JSON file
    cy.task('saveReport', reportData).then(() => {
      cy.log(`💾 Report saved for locale: ${reportData.locale}`);
    });
  });
});