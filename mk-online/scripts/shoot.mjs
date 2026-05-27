// Take screenshots of the running dev server via Playwright.
// Usage:
//   node scripts/shoot.mjs              -> just the lobby
//   node scripts/shoot.mjs game         -> click through lobby and shoot the game
import { chromium } from "playwright";

const URL = "http://localhost:5173/";
const mode = process.argv[2] ?? "lobby";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
await page.goto(URL, { waitUntil: "domcontentloaded" });

if (mode === "lobby") {
  await page.waitForSelector(".lobby-card", { timeout: 10_000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `screens/lobby.png`, fullPage: true });
  console.log(`Saved screens/lobby.png`);
} else {
  // Click Start Game in the lobby first.
  await page.waitForSelector(".lobby-start", { timeout: 10_000 });
  await page.click(".lobby-start");
  await page.waitForSelector(".dmark", { timeout: 10_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `screens/${mode}.png`, fullPage: true });
  console.log(`Saved screens/${mode}.png`);
  const map = await page.$(".board-map");
  if (map) {
    await map.screenshot({ path: `screens/${mode}-map.png` });
    console.log(`Saved screens/${mode}-map.png`);
  }
}

await browser.close();
