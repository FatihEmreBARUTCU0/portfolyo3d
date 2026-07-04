import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  async function check(url, label) {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    const video = await page.evaluate(() => {
      const v = document.querySelector("video");
      if (!v) return { error: "no video element" };
      return {
        src: v.currentSrc || v.src,
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
        readyState: v.readyState,
        networkState: v.networkState,
        error: v.error ? v.error.code : null,
        paused: v.paused,
        currentTime: v.currentTime,
        duration: v.duration,
      };
    });

    console.log("=== " + label + " ===");
    console.log(JSON.stringify(video, null, 2));
    return video;
  }

  const basic = await check("http://localhost:8080/test-video.html", "Basic autoplay test");
  const main = await check("http://localhost:8080/", "Main page after load");

  await browser.close();

  const basicOk = basic.videoWidth > 0 && basic.videoHeight > 0 && !basic.error;
  const mainOk = main.videoWidth > 0 && main.videoHeight > 0 && !main.error;

  console.log("\nBasic test renders:", basicOk ? "YES" : "NO");
  console.log("Main page renders:", mainOk ? "YES" : "NO");

  if (!basicOk || !mainOk) process.exit(1);
})();
