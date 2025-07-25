// Validate required environment variables
if (!process.env.REACT_APP_XAI_API_KEY) {
  throw new Error("REACT_APP_XAI_API_KEY is required in .env file");
}

export const config = {
  apiKey: process.env.REACT_APP_XAI_API_KEY,
  appName: process.env.REACT_APP_NAME || "QuestRex backstoryr",
  appVersion: process.env.REACT_APP_VERSION || "1.0.0",
  appDescription:
    process.env.REACT_APP_DESCRIPTION ||
    "Fantasy RPG Character Generator and Prompt Creator",
};
