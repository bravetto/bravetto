const { test, expect } = require("@playwright/test");

test("sales voice trigger opens and closes overlay", async ({ page }) => {
  await page.route("https://esm.sh/@elevenlabs/client", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: [
        "export class Conversation {",
        "  static async startSession(options) {",
        "    if (options && typeof options.onConnect === 'function') options.onConnect();",
        "    if (options && typeof options.onModeChange === 'function') options.onModeChange({ mode: 'speaking' });",
        "    return {",
        "      endSession() {",
        "        if (options && typeof options.onDisconnect === 'function') options.onDisconnect();",
        "      }",
        "    };",
        "  }",
        "}",
      ].join("\n"),
    });
  });

  await page.addInitScript(() => {
    navigator.mediaDevices = navigator.mediaDevices || {};
    navigator.mediaDevices.getUserMedia = async () => ({
      getTracks: () => [
        {
          stop: () => {},
        },
      ],
    });

    class fake_audio_context {
      constructor() {
        this.state = "running";
      }
      createAnalyser() {
        return {
          fftSize: 64,
          smoothingTimeConstant: 0.7,
          frequencyBinCount: 32,
          getByteFrequencyData(array) {
            for (let i = 0; i < array.length; i += 1) {
              array[i] = 64;
            }
          },
        };
      }
      createMediaStreamSource() {
        return { connect: () => {} };
      }
      close() {
        this.state = "closed";
        return Promise.resolve();
      }
    }

    window.AudioContext = fake_audio_context;
    window.webkitAudioContext = fake_audio_context;
  });

  await page.goto("/sales.html", { waitUntil: "domcontentloaded" });

  await page.click("#abe-trigger");

  await expect(page.locator("#voice-overlay")).toHaveClass(/active/);
  await expect(page.locator("#mic-status")).toContainText(
    /Listen|Microphone active/,
  );

  await page.keyboard.press("Escape");
  await expect(page.locator("#voice-overlay")).not.toHaveClass(/active/);
});
