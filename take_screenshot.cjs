const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1200 });
  
  // Navigate to the newly created route
  await page.goto('http://localhost:5173/reference-studio-v2', {
    waitUntil: 'networkidle0',
  });

  // Delay to ensure animations have time to settle
  await new Promise(r => setTimeout(r, 2000));

  // Take screenshot
  const path = '/Users/cwb/Downloads/viewtube/iteration1_screenshot.png';
  await page.screenshot({ path });

  await browser.close();
  console.log(`Screenshot saved to ${path}`);
})();
