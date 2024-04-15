///<reference types="cypress"/>

// beforeEach(() => {
//   //login
//   cy.login(Cypress.env("loginEmail"), Cypress.env("loginPassword"));
// });

it(`should be able to add candidate to list `, () => {
  cy.visit("/agent/186013/candidates");
  cy.get(".add_candidate").click();
});
