const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto('http://127.0.0.1:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('At:', page.url());

  // Click guest button (use locator, more robust)
  try {
    await page.locator('button:has-text("Jugar como invitado")').click({ timeout: 8000 });
    console.log('Clicked guest button');
  } catch (e) {
    console.log('Guest button error, trying alt:', e.message);
    // Try clicking via text content
    const buttons = await page.$$('button');
    for (const b of buttons) {
      const t = await b.textContent();
      if (t && t.includes('invitado')) {
        await b.click();
        console.log('Clicked via fallback');
        break;
      }
    }
  }

  await page.waitForTimeout(5000);
  console.log('After click, at:', page.url());

  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-top.png', fullPage: false });
  console.log('Captured top');

  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-mid.png', fullPage: false });
  console.log('Captured mid');

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-bottom.png', fullPage: false });
  console.log('Captured bottom');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-full.png', fullPage: true });
  console.log('Captured full');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
