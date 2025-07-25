// Get API key from WordPress if available, otherwise from environment
const getApiKey = () => {
  // Check if running in WordPress
  if (typeof window !== "undefined" && window.questRexBackstoryrData) {
    return window.questRexBackstoryrData.apiKey;
  }

  // Fallback to environment variable for local development
  if (!process.env.REACT_APP_XAI_API_KEY) {
    throw new Error(
      "REACT_APP_XAI_API_KEY is required in .env file for local development"
    );
  }
  return process.env.REACT_APP_XAI_API_KEY;
};

export const config = {
  apiKey: getApiKey(),
  appName: process.env.REACT_APP_NAME || "QuestRex backstoryr",
  appVersion: process.env.REACT_APP_VERSION || "1.0.0",
  appDescription:
    process.env.REACT_APP_DESCRIPTION ||
    "Fantasy RPG Character Generator and Prompt Creator",
};
