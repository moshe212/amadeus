const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");
const port = 3000;
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

const pup = async (an, ss, mail, userName, officeId, password) => {
  // const an = "AN25MARTLVLON";
  // const ss = "SS1G2";
  // const mail = "148mor@gmail.com";

  const browser = await puppeteer.launch({ headless: false }); // Set headless: false to see the browser
  const page = await browser.newPage();

  await page.goto(
    "https://www.sellingplatformconnect.amadeus.com/login/?err=2026322",
    { waitUntil: "networkidle0", timeout: 60000 }
  ); // Replace with your URL

  await page.waitForSelector("#usernameInput", { visible: true });

  // Type into input fields
  await page.type("#usernameInput", userName);
  await page.type("#officeIdInput", officeId);
  await page.type("#passwordInput", password);

  // await page.type("#usernameInput", "3009922");
  // await page.type("#officeIdInput", "TLVI32159");
  // await page.type("#passwordInput", "moti2025");

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
      setTimeout(resolve, 5000); // waits for 1 second
    });
  });

  let counter = 0;
  const checkAvailability = async () => {
    console.log("Counter: ", counter);

    await page.type(".cmdPrompt", ss);
    await page.keyboard.press("Enter");

    await page.evaluate(() => {
      return new Promise((resolve) => {
        setTimeout(resolve, 3000); // waits for 1 second
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
      return; // Stop further execution
    } else {
      await page.evaluate(() => {
        return new Promise((resolve) => {
          setTimeout(resolve, 2000); // waits for 1 second
        });
      });

      counter++;
      if (counter > 10) {
        counter = 0;
        await page.type(".cmdPrompt", "ig");
        await page.keyboard.press("Enter");
        await page.evaluate(() => {
          return new Promise((resolve) => {
            setTimeout(resolve, 3000); // waits for 1 second
          });
        });
      }

      if (lastCmdResponseText.includes("REQUEST NEW AVAILABILITY")) {
        await page.type(".cmdPrompt", "an08martlvnyc");
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
const userName = process.env.userName;
const officeId = process.env.OfficeID;
const password = process.env.Password;

console.log(an, ss, mail, userName, officeId, password);
pup(an, ss, mail, userName, officeId, password);

app.get("/", (req, res) => {
  res.redirect("/he");
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
