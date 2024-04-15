describe("template spec", () => {
  it("passes", () => {
    cy.visit("/");
    cy.get("#usernameInput").type(Cypress.env("UserName"));
    cy.get("#officeIdInput").type(Cypress.env("OfficeID"));
    cy.get("#passwordInput").type(Cypress.env("Password"));
    cy.contains("button", "Sign in").click();
    cy.wait(80000); // Consider using cy.intercept() to wait for specific network calls instead of a fixed wait
    cy.get(".cmdPrompt").type("an08martlvnyc");
    cy.get(".cmdPrompt").type("{enter}");
    cy.wait(5000);

    let Counter = 0;

    // Define a function to check the condition and recurse if not met
    const checkAvailability = () => {
      console.log("Counter: ", Counter);

      cy.get(".cmdPrompt").type("ss1v3");
      cy.get(".cmdPrompt").type("{enter}");

      cy.wait(5000); // Again, consider using cy.intercept()

      cy.get(".cmdResponse")
        .last()
        .invoke("text")
        .then((text) => {
          console.log(text);
          if (text.includes("DK1")) {
            // Condition met, proceed with the test or finish
            cy.log("Availability confirmed.");
          } else {
            // Condition not met, wait a bit and then try again
            cy.wait(2000).then(() => {
              Counter++;

              if (Counter > 10) {
                Counter = 0;
                cy.get(".cmdPrompt").type("ig");
                cy.get(".cmdPrompt").type("{enter}");
                cy.wait(3000);
              }
              checkAvailability(); // Recurse
            });
          }
        });
    };

    // Initial call to start the check

    checkAvailability();
  });
});
