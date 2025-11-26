import { moderateContent, sanitizeText } from "@/lib/content-moderation";

describe("Content Moderation", () => {
  describe("moderateContent", () => {
    it("should allow safe content", () => {
      const result = moderateContent("This is a normal thought");
      expect(result.isSafe).toBe(true);
    });

    it("should flag harmful content", () => {
      const result = moderateContent("I want to harm myself");
      expect(result.isSafe).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it("should be case insensitive", () => {
      const result = moderateContent("I WANT TO KILL");
      expect(result.isSafe).toBe(false);
    });
  });

  describe("sanitizeText", () => {
    it("should remove HTML tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const output = sanitizeText(input);
      expect(output).not.toContain("<script>");
      expect(output).toContain("Hello");
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      const output = sanitizeText(input);
      expect(output).toBe("Hello World");
    });
  });
});

