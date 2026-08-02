const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  // Try to access directly — the app likely redirects to /auth if not logged in
  await page.goto('https://trivials-wars.vercel.app/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(4000);
  const url1 = page.url();
  console.log('Landed at:', url1);
  await page.screenshot({ path: '/home/z/my-project/download/vercel-dark-current.png', fullPage: false });
  console.log('Captured:', url1);

  // Inspect HTML to see if new design deployed (should NOT contain #00E5FF in body bg)
  const html = await page.content();
  const hasNeon = html.includes('rgba(0, 229, 255');
  const hasEditorial = html.includes('#0a0a0f') || html.includes('0a0a0f');
  console.log('Has neon rgba(0,229,255):', hasNeon);
  console.log('Has editorial #0a0a0f:', hasEditorial);

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
