const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([{
    name: 'tw_session',
    value: 'guest',
    domain: 'localhost',
    path: '/',
  }]);
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:3001/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-1.png', fullPage: false });
  console.log('Captured viewport');

  // Scroll to bottom to see more
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1500);
  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-2.png', fullPage: false });
  console.log('Captured bottom');

  // Full page
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/home/z/my-project/download/welcome-dark-full.png', fullPage: true });
  console.log('Captured full page');

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
