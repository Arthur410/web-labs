const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto('http://localhost:3000/login');

  await page.waitForTimeout(2000);

  await page.type('input[type=text]', 'Артур');

  await page.type('input[type=password]', '123');

  await page.click('#loginButton');

  await page.waitForTimeout(1000);

  const stockPercentageBefore = await page.$eval('#AAPLpercentage', (span) => span.textContent);
  const balanceBefore = await page.$eval('#balance', (span) => span.textContent);

  console.log('======== BEFORE ========')
  console.log(stockPercentageBefore)
  console.log(balanceBefore)

  await page.click('#trade');

  await page.waitForTimeout(1000);


  await page.click('#AAPLplusSell');

  await page.click('#AAPLsell');

  await page.click('#brokers');

  await page.waitForTimeout(1000);

  const stockPercentageAfter = await page.$eval('#AAPLpercentage', (span) => span.textContent);
  const balanceAfter = await page.$eval('#balance', (span) => span.textContent);

  console.log('======== AFTER ========')
  console.log(stockPercentageAfter)
  console.log(balanceAfter)

  await browser.close();
})();
