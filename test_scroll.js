import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Screenshot initial state
  await page.screenshot({ path: '/Users/christ/.gemini/antigravity/brain/35702d3a-b86d-45f4-93a1-1b872244ec23/artifacts/screenshot1.png' });
  
  // Scroll halfway down the screen (500px)
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/christ/.gemini/antigravity/brain/35702d3a-b86d-45f4-93a1-1b872244ec23/artifacts/screenshot2.png' });
  
  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/Users/christ/.gemini/antigravity/brain/35702d3a-b86d-45f4-93a1-1b872244ec23/artifacts/screenshot3.png' });

  await browser.close();
})();
