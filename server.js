const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const port = 5000;
const dotenv = require("dotenv");

dotenv.config();
const puppeteer = require("puppeteer");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "Amadeus.nm2024@gmail.com",
    pass: "wkzl kyol tclv leut",
  },
});

// CORS Configuration
app.use(
  cors({
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
  })
);

const sendMail = (an, mail) => {
  let mailOptions = {
    from: "Amadeus.nm2024@gmail.com",
    to: mail,
    subject: `you got DK1 on ${an}`,
    text: `go to browser..`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      res.send("error"); // If error occurs, send error response
    } else {
      console.log("Email sent: " + info.response);
      res.send("success"); // If success, send success response
    }
  });
};

const pup = async (
  an,
  ss,
  mail,
  userName,
  officeId,
  password,
  doRunAnAfterOneTime
) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--start-maximized"],
  }); // Set headless: false to see the browser

  const page = await browser.newPage();

  // const [page] = await browser.pages();
  // const dimensions = await page.evaluate(() => {
  //   return {
  //     width: window.screen.availWidth,
  //     height: window.screen.availHeight,
  //   };
  // });

  // await page.setViewport(dimensions);

  await page.setViewport({ width: 1920, height: 800 });

  await page.goto("https://www.sellingplatformconnect.amadeus.com/login", {
    waitUntil: "networkidle0",
    timeout: 60000,
  }); // Replace with your URL

  await page.waitForSelector("#usernameInput", { visible: true });

  // Type into input fields
  await page.type("#usernameInput", userName);
  await page.type("#officeIdInput", officeId);
  await page.type("#passwordInput", password);

  // Click the sign in button
  //   await Promise.all([
  //     page.waitForNavigation(), // Wait for page navigation to complete
  //     page.click('button:contains("Sign in")'),
  //   ]);
  await page.click('button[type="submit"]');

  //   await page.waitForSelector("#passwordInput", {
  //     visible: true,
  //     timeout: 80000,
  //   });
  //   await page.type("#passwordInput", "moti2025");

  // Wait for a specific condition or selector
  await page.waitForSelector(".cmdPrompt", { visible: true, timeout: 120000 });

  await page.type(".cmdPrompt", an);
  await page.keyboard.press("Enter");
  await page.evaluate(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, 5000); // waits for 5 second
    });
  });

  let counter = 0;
  let tabRunCounter = 0;
  let tabNum = 1;
  let tabOneStatus = true;
  let tabTwoStatus = process.env.isTwoTabsWork;
  let isNewTabOpen = false;

  const checkAvailability = async () => {
    console.log("Counter: ", counter);

    await page.type(".cmdPrompt", ss);
    await page.keyboard.press("Enter");

    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 3000); // waits for 3 second
      });
    });

    const lastCmdResponseText = await page.evaluate(() => {
      const elements = document.querySelectorAll(".cmdResponse");
      const lastElement = elements[elements.length - 1]; // Get the last element
      return lastElement ? lastElement.innerText : null; // Return its text content, or null if not found
    });

    console.log(lastCmdResponseText);
    if (lastCmdResponseText.includes("DK1")) {
      console.log("Availability confirmed.");
      sendMail(an, mail);
      // Do something after confirmation
      // await browser.close(); // Assuming 'browser' is accessible in this scope

      switch (tabNum) {
        case 1:
          tabOneStatus = false;
          break;
        case 2:
          tabTwoStatus = false;
          break;
      }

      if (!tabOneStatus && !tabTwoStatus) {
        return; // Stop further execution
      }

      if (!isNewTabOpen) {
        // Click on the button that opens a new tab in the UI program
        await page.click("#navbar_desktop_toolbar_new"); // Update the selector for your button
        await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 2000); // waits for 2 seconds
          });
        });

        // await page.evaluate(() => {
        //   const commandPageTab = Array.from(
        //     document.querySelectorAll("li")
        //   ).find((li) => li.getAttribute("title") === "Command page 2");
        //   if (commandPageTab) {
        //     commandPageTab.click();
        //   }
        // });

        // Wait for a specific condition or selector
        await page.waitForSelector(".cmdPrompt", {
          visible: true,
          timeout: 120000,
        });

        await page.type(".cmdPrompt", an);
        await page.keyboard.press("Enter");
        await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 5000); // waits for 5 second
          });
        });

        await checkAvailability();
      } else {
        const tabName = tabNum === 1 ? "Command page 2" : "Command page 1";
        tabNum = tabNum === 1 ? 2 : 1;

        // await page.evaluate((tabName) => {
        //   const commandPageTab = Array.from(
        //     document.querySelectorAll("span")
        //   ).find((span) => span.innerText === tabName);
        //   if (commandPageTab) {
        //     commandPageTab.click();
        //   }
        // }, tabName);

        // Wait for a specific condition or selector
        await page.waitForSelector(".cmdPrompt", {
          visible: true,
          timeout: 120000,
        });

        await page.type(".cmdPrompt", an);
        await page.keyboard.press("Enter");
        await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 5000); // waits for 5 second
          });
        });

        await checkAvailability();
      }
    } else {
      await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 2000); // waits for 1 second
        });
      });

      // await page.click("#navbar_desktop_toolbar_new"); // Update the selector for your button

      counter++;
      if (counter > 2) {
        counter = 0;
        tabRunCounter++;

        console.log("tabRunCounter", tabRunCounter);
        if (tabRunCounter >= 2) {
          tabRunCounter = 0;

          if (
            (tabNum === 1 && tabTwoStatus) ||
            (tabNum === 2 && tabOneStatus)
          ) {
            // Switch to other tab
            if (isNewTabOpen) {
              console.log("new tab open");
              const tabName =
                tabNum === 1 ? "Command page 2" : "Command page 1";

              console.log("tabNum", tabNum);
              console.log("tabName", tabName);

              await page.evaluate((tabName) => {
                const commandPageTab = Array.from(
                  document.querySelectorAll("div.c")
                ).find((div) => {
                  const span = div.querySelector("span");
                  return span && span.innerText === tabName;
                });
                if (commandPageTab) {
                  commandPageTab.click();
                }
              }, tabName);
            } else {
              console.log("new tab not open");
              const tabName =
                tabNum === 1 ? "Command page 2" : "Command page 1";

              // Open new tab
              await page.click("#navbar_desktop_toolbar_new"); // Update the selector for your button
              isNewTabOpen = true;
              // await page.evaluate((tabName) => {
              //   const commandPageTab = Array.from(
              //     document.querySelectorAll("span")
              //   ).find((span) => span.innerText === tabName);
              //   if (commandPageTab) {
              //     commandPageTab.click();
              //   }
              // }, tabName);
            }
            tabNum = tabNum === 1 ? 2 : 1;
            await page.evaluate(() => {
              return new Promise((resolve) => {
                setTimeout(resolve, 5000); // waits for 2 seconds
              });
            });
            // Wait for a specific condition or selector
            // await page.waitForSelector(".cmdPrompt", {
            //   visible: true,
            //   timeout: 120000,
            // });

            await page.type(".cmdPrompt", an);
            await page.keyboard.press("Enter");
            await page.evaluate(() => {
              return new Promise((resolve) => {
                setTimeout(resolve, 5000); // waits for 5 second
              });
            });

            await checkAvailability();
          }
        }

        await page.type(".cmdPrompt", "ig");
        await page.keyboard.press("Enter");
        await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 3000); // waits for 1 second
          });
        });
      }

      if (
        lastCmdResponseText.includes("REQUEST NEW AVAILABILITY") ||
        doRunAnAfterOneTime
      ) {
        console.log("doRunAnAfterOne");
        await page.type(".cmdPrompt", an);
        await page.keyboard.press("Enter");
        await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 5000); // waits for 1 second
          });
        });
      }
      await checkAvailability(); // Recurse
    }
  };

  await checkAvailability();

  // Close the browser when done
  //   await browser.close();
};

const an = process.env.an;
const ss = process.env.ss;
const mail = process.env.mail;
const user_name = process.env.user;
const officeId = process.env.OfficeID;
const password = process.env.Password;
const doRunAnAfterOneTime = process.env.doRunAnAfterOneTime;

console.log(an, ss, mail, user_name, officeId, password, doRunAnAfterOneTime);
pup(an, ss, mail, user_name, officeId, password, doRunAnAfterOneTime);

app.get("/", (req, res) => {
  res.redirect("/he");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
