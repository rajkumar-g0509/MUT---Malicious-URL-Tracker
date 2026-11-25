const axios = require("axios");

const API_KEY = "YOUR_API_KEY_HERE";

async function checkThreat(url) {
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
      {
        client: {
          clientId: "phishblock",
          clientVersion: "1.0"
        },
        threatInfo: {
          threatTypes: [
            "MALWARE",
            "SOCIAL_ENGINEERING",
            "UNWANTED_SOFTWARE"
          ],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [
            { url: url }
          ]
        }
      }
    );

    if (response.data && response.data.matches) {
      return {
        threatDetected: true,
        threatType: response.data.matches[0].threatType
      };
    }

    return {
      threatDetected: false
    };

  } catch (error) {
    return {
      threatDetected: false
    };
  }
}

module.exports = { checkThreat };