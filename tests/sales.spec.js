const { test, expect } = require("@playwright/test");

test("sales voice trigger opens and closes overlay", async ({ page }) => {
  await page.route(
    "https://elevenlabs.io/convai-widget/index.js",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: [
          "class ElevenLabsConvai extends HTMLElement {",
          "  startConversation() {",
          "    document.dispatchEvent(new CustomEvent('voiceStateChange', { detail: { active: true } }));",
          "  }",
          "  start() { this.startConversation(); }",
          "  open() { this.startConversation(); }",
          "}",
          "if (!customElements.get('elevenlabs-convai')) customElements.define('elevenlabs-convai', ElevenLabsConvai);",
        ].join("\n"),
      });
    },
  );

  await page.route(
    "https://api.us.elevenlabs.io/v1/convai/agents/**/widget",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ widget_config: { agent_id: "test-agent" } }),
      });
    },
  );

  await page.goto("/sales.html", { waitUntil: "domcontentloaded" });

  await page.click("#abe-trigger");

  await expect(page.locator("#voice-overlay")).toHaveClass(/active/);
  await expect(page.locator("#mic-status")).toContainText(/Listen|Voice ready/);

  await page.keyboard.press("Escape");
  await expect(page.locator("#voice-overlay")).not.toHaveClass(/active/);
});
