const { defineConfig } = require("cypress");

module.exports = defineConfig({
  // projectId: "q4b2gx",
  chromeWebSecurity: false,
  env: {
    UserName: "3009922",
    OfficeID: "TLVI32159",
    Password: "moti2025",
    loginEmail_facebook: "moshe212@gmail.com",
  },
  e2e: {
    baseUrl:
      "https://www.sellingplatformconnect.amadeus.com/login/?err=2026322",
    experimentalSessionAndOrigin: true,
    defaultCommandTimeout: 30000,
    requestTimeout: 5000,
    redirectionLimit: 50000,
    failOnStatusCode: false,
    // retries: 2,
    // retries: 2,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
