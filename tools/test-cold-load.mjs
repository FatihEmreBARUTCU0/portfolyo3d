import { chromium } from "playwright";

async function runScenario(label, throttle) {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(120000);

  if (throttle) {
    const client = await context.newCDPSession(page);
    await client.send("Network.enable");
    await client.send("Network.emulateNetworkConditions", {
      offline: false,
      downloadThroughput: (400 * 1024) / 8,
      uploadThroughput: (400 * 1024) / 8,
      latency: 400,
    });
    await client.send("Network.clearBrowserCache");
  } else {
    const client = await context.newCDPSession(page);
    await client.send("Network.clearBrowserCache");
  }

  const t0 = Date.now();
  await page.goto("http://127.0.0.1:3000/", { waitUntil: "domcontentloaded", timeout: 120000 });
  await page.waitForFunction(
    () => document.getElementById("body-wrap")?.classList.contains("is-ready"),
    { timeout: 90000 }
  );
  const loaderMs = Date.now() - t0;

  await page.waitForFunction(
    () => {
      const v = document.getElementById("hero-video");
      if (!v) return false;
      if (v.seekable.length && v.seekable.end(v.seekable.length - 1) > 0.05) return true;
      return false;
    },
    { timeout: 90000 }
  );
  const seekableMs = Date.now() - t0;

  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2.5));
  await page.waitForTimeout(2500);

  const result = await page.evaluate(() => {
    const v = document.getElementById("hero-video");
    return {
      loaderReady: document.getElementById("body-wrap").classList.contains("is-ready"),
      activeState: document.querySelector(".hero-state.is-active")?.getAttribute("data-state"),
      currentTime: v.currentTime,
      seekableEnd: v.seekable.length ? v.seekable.end(v.seekable.length - 1) : 0,
      bufferedEnd: v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0,
      duration: v.duration,
    };
  });

  const pass =
    result.loaderReady &&
    result.activeState !== "0" &&
    result.currentTime > 0.05 &&
    result.seekableEnd > 0.05;

  console.log(
    JSON.stringify({ label, loaderMs, seekableMs, pass, result }, null, 2)
  );

  await browser.close();
  return pass;
}

const coldPass = await runScenario("cold-cache-disabled", false);
const slowPass = await runScenario("slow-4g", true);

if (!coldPass || !slowPass) {
  process.exit(1);
}
