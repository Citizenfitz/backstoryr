import { config } from "../config";

// Rate limiting configuration
const RATE_LIMIT = 100; // requests per hour
const RATE_WINDOW = 3600000; // 1 hour in milliseconds

class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = [];
  }

  canMakeRequest() {
    const now = Date.now();
    // Remove requests outside the current window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);
    return this.requests.length < this.limit;
  }

  addRequest() {
    this.requests.push(Date.now());
  }

  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter((time) => now - time < this.windowMs);
    return this.limit - this.requests.length;
  }

  getResetTime() {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    return oldestRequest + this.windowMs;
  }
}

const rateLimiter = new RateLimiter(RATE_LIMIT, RATE_WINDOW);

async function generateBackstoryLocal(prompt) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3-latest",
      messages: [
        {
          role: "system",
          content:
            "You are a creative writing assistant specializing in fantasy RPG character backstories.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    switch (response.status) {
      case 401:
        throw new Error("Invalid API key. Check your environment variables.");
      case 429:
        throw new Error("Rate limit exceeded on the API side.");
      default:
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateBackstoryWordPress(prompt) {
  const wpData = window.questRexBackstoryrData;
  if (!wpData) {
    throw new Error("WordPress configuration not found");
  }

  const formData = new FormData();
  formData.append("action", "questrex_backstoryr_generate");
  formData.append("prompt", prompt);
  formData.append("nonce", wpData.nonce);

  const response = await fetch(wpData.ajaxUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.data || "Failed to generate backstory");
  }

  return data.data.backstory;
}

export async function generateBackstory(prompt) {
  if (!rateLimiter.canMakeRequest()) {
    const resetTime = new Date(rateLimiter.getResetTime());
    throw new Error(
      `Rate limit exceeded. Try again after ${resetTime.toLocaleTimeString()}`
    );
  }

  try {
    // Check if we're in WordPress or local development
    const isWordPress =
      typeof window !== "undefined" && window.questRexBackstoryrData;

    const backstory = isWordPress
      ? await generateBackstoryWordPress(prompt)
      : await generateBackstoryLocal(prompt);

    rateLimiter.addRequest();

    return {
      backstory,
      remaining: rateLimiter.getRemaining(),
    };
  } catch (error) {
    throw new Error(`Failed to generate backstory: ${error.message}`);
  }
}
