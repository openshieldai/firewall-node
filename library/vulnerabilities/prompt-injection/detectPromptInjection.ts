import { request } from "https";

export async function detectPromptInjection(prompt: object) {
  console.log("detectPromptInjection");
  console.log("Detect prompt: " + JSON.stringify(prompt))

  const data = JSON.stringify({ prompt });

  const options = {
    hostname: "api.openshield.ai",
    port: 443,
    path: `/v1/${process.env.OPENSHIELD_PRODUCT_ID}/scan`,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENSHIELD_API_KEY}`,
      "Content-Length": Buffer.byteLength(data),
    },
  };

  const req = request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      try {
        const result = JSON.parse(body);
        console.log("OpenShield scan result:", result);
      } catch (e) {
        console.error("Failed to parse OpenShield response:", e);
      }
    });
  });

  req.on("error", (e) => {
    console.error("OpenShield scan error:", e);
  });

  req.write(data);
  req.end();
}
