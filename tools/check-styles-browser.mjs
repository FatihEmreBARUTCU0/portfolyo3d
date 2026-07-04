import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true, channel: "chrome" });
const page = await browser.newPage();

for (const port of [3000, 3001, 8080]) {
  try {
    await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle", timeout: 10000 });
    const styles = await page.evaluate(() => {
      const body = getComputedStyle(document.body);
      const link = document.querySelector('link[rel="stylesheet"]');
      return {
        bodyFont: body.fontFamily,
        bodyBg: body.backgroundColor,
        linkColor: getComputedStyle(document.querySelector("a") || document.body).color,
        cssHref: link?.getAttribute("href") || null,
        loadingWrap: !!document.querySelector(".loading-wrap"),
        heroScroll: getComputedStyle(document.querySelector(".hero-scroll") || document.body).height,
      };
    });
    console.log(`Port ${port}:`, JSON.stringify(styles));
  } catch (e) {
    console.log(`Port ${port}: ERROR ${e.message}`);
  }
}

await browser.close();
