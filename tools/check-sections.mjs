import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});

await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForFunction(
  () => document.getElementById("body-wrap")?.classList.contains("is-ready"),
  { timeout: 60000 }
);

// Scroll through entire page
await page.evaluate(async () => {
  const step = window.innerHeight;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 200));
  }
  window.scrollTo(0, document.body.scrollHeight);
});

await page.waitForTimeout(1000);

const report = await page.evaluate(() => {
  const ids = ["hero-scroll", "about", "work", "testimonials", "contact"];
  return ids.map((id) => {
    const el = document.getElementById(id);
    if (!el) return { id, exists: false };
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      id,
      exists: true,
      height: rect.height,
      opacity: style.opacity,
      display: style.display,
      visibility: style.visibility,
      bg: style.backgroundColor,
      text: el.querySelector("h2")?.textContent?.trim() || null,
      revealVisible: el.querySelector(".reveal.is-visible") !== null,
      revealHidden: el.querySelectorAll(".reveal:not(.is-visible)").length,
    };
  });
});

console.log("Sections:", JSON.stringify(report, null, 2));
console.log("Errors:", errors);
await browser.close();
