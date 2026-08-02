// Headless screenshot of the deployed welcome page (post-redesign)
// Using puppeteer to log in as guest and capture a full-page screenshot.
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });

    // Force a hard refresh — bypass CDN cache
    await page.setCacheEnabled(false);

    console.log('→ Loading production URL...');
    await page.goto('https://trivials-wars.vercel.app/', {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });

    // Wait for the login screen to render
    await new Promise((r) => setTimeout(r, 2500));

    // Click "Jugar como invitado" if present
    const guestBtn = await page.$('button ::-p-text(Invitado)');
    if (guestBtn) {
      console.log('→ Clicking "Jugar como invitado"...');
      await guestBtn.click();
      await new Promise((r) => setTimeout(r, 4000));
    } else {
      console.log('  (no "Invitado" button found — maybe already logged in?)');
    }

    // Wait for the welcome screen to render
    await new Promise((r) => setTimeout(r, 3000));

    // Take a full-page screenshot
    const out = '/home/z/my-project/download/welcome-compact-final.png';
    await page.screenshot({ path: out, fullPage: true });
    console.log('✓ Saved:', out);

    // Also take a viewport screenshot (top of the page)
    const outViewport = '/home/z/my-project/download/welcome-compact-top.png';
    await page.screenshot({ path: outViewport, fullPage: false });
    console.log('✓ Saved:', outViewport);
  } catch (e) {
    console.error('Error:', e.message);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
