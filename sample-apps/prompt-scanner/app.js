require("dotenv").config();
require("@aikidosec/firewall");


const express = require("express");
const asyncHandler = require("express-async-handler");
const openai = require("openai");



require("@aikidosec/firewall/nopp");

async function main(port) {
  const app = express();
  app.post(
    "/agent",
    express.urlencoded({ extended: false }),
    asyncHandler(async (req, res) => {
      const client = new openai({
        apiKey: process.env["OPENAI_API_KEY"], // This is the default and can be omitted
      });

      const response = await client.responses.create({
        model: "gpt-4o",
        instructions: "You are a coding assistant that talks like a pirate",
        input: "Are semicolons optional in JavaScript?",
      });
      res.send(response)
    })
  );

  return new Promise((resolve, reject) => {
    try {
      app.listen(port, () => {
        console.log(`Listening on port ${port}`);
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

function getPort() {
  const port = parseInt(process.argv[2], 10) || 4000;

  if (isNaN(port)) {
    console.error("Invalid port");
    process.exit(1);
  }

  return port;
}

main(getPort());
