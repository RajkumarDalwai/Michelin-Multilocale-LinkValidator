import PageRedirectionPage from '../../Pages/PageRedirectionPage';
import '../../../support/commands';

describe('Page Redirection Suit', () => {
  
  it('1. Verify Page redirections Under Homepage', () => {
    cy.viewport(1280, 800);
    cy.visit(Cypress.env('baseUrl'));
    cy.wait(2000);
    cy.get('#didomi-notice-agree-button').click();
    cy.validateAllLinks(PageRedirectionPage.headerLinksSelector);
  });

});