import { calculateSimilarity, extractTags, formatDate } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("calculateSimilarity", () => {
    it("should return 1 for identical texts", () => {
      const text = "This is a test";
      expect(calculateSimilarity(text, text)).toBe(1);
    });

    it("should return 0 for completely different texts", () => {
      expect(calculateSimilarity("abc", "xyz")).toBe(0);
    });

    it("should return a value between 0 and 1 for similar texts", () => {
      const similarity = calculateSimilarity(
        "I love programming",
        "I love coding"
      );
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });
  });

  describe("extractTags", () => {
    it("should extract relevant tags from text", () => {
      const text = "I fear the future and think about death";
      const tags = extractTags(text);
      expect(tags).toContain("fear");
      expect(tags).toContain("death");
    });

    it("should return empty array for text with no matching tags", () => {
      const text = "This is a random sentence";
      const tags = extractTags(text);
      expect(tags).toEqual([]);
    });
  });

  describe("formatDate", () => {
    it("should format date correctly", () => {
      const dateString = "2024-01-15T10:30:00Z";
      const formatted = formatDate(dateString);
      expect(formatted).toMatch(/\w{3} \d{1,2}, \d{4}/);
    });
  });
});

