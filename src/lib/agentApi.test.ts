import { sendMessageToAgent, hasRealAgentEndpoint } from "@/lib/agentApi";

describe("Agent API", () => {
  describe("hasRealAgentEndpoint", () => {
    it("should return true for k8s-ops agent", () => {
      expect(hasRealAgentEndpoint("k8s-ops")).toBe(true);
    });

    it("should return false for agents without configured endpoints", () => {
      expect(hasRealAgentEndpoint("project-mgr")).toBe(false);
      expect(hasRealAgentEndpoint("unknown-agent")).toBe(false);
    });
  });

  describe("sendMessageToAgent", () => {
    it("should throw error for agent without endpoint", async () => {
      await expect(
        sendMessageToAgent("project-mgr", "test message")
      ).rejects.toThrow("No endpoint configured");
    });

    it("should handle network errors gracefully", async () => {
      // This test requires a mock server, currently skipped
      // In a real scenario, you would use fetch-mock or similar
      await expect(
        sendMessageToAgent("k8s-ops", "test message")
      ).rejects.toThrow();
    });
  });
});
