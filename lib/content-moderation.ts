// Content moderation utilities

const harmfulPatterns = [
  /\b(kill|suicide|self-harm|cutting)\b/gi,
  /\b(violence|attack|harm)\b/gi,
  /\b(hate|racist|discriminat)\b/gi,
];

const blockedWords = [
  "explicit",
  "nsfw",
  // Add more as needed
];

export function moderateContent(text: string): {
  isSafe: boolean;
  reason?: string;
} {
  const lowerText = text.toLowerCase();

  // Check for blocked words
  for (const word of blockedWords) {
    if (lowerText.includes(word)) {
      return {
        isSafe: false,
        reason: "Contains inappropriate content",
      };
    }
  }

  // Check for harmful patterns
  for (const pattern of harmfulPatterns) {
    if (pattern.test(text)) {
      return {
        isSafe: false,
        reason: "Contains potentially harmful content",
      };
    }
  }

  return { isSafe: true };
}

export function sanitizeText(text: string): string {
  // Remove potentially harmful HTML/scripts
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .trim();
}

