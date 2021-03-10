const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const user = require('./usrInfo.json');

puppeteer.use(StealthPlugin());

const bot = () => {
    // Shoe Info
    const copURL = "https://www.nike.com/launch/t/delta-breathe-terra-blush";
    const shoeSize = "M 11";

    // Login Info
    const email = user.account.email;
    const password = user.account.password;
    
    // Checkout Info
    const cvv = user.card.cvv;

    // BEGIN BOT
    (async () => {
        const browser = await puppeteer.launch({ ignoreHTTPSErrors: true, headless: false });
        const page = await browser.newPage();

        await page.goto(copURL);

        // Wait for shoe size buttons to load and click specified shoe size
        await page.waitForSelector('ul[class="size-layout bg-offwhite border-light-grey ta-sm-l z3 mb3-lg    "]');

        // Get shoe size button inner texts into array to find which index specified shoe size is at
        const buttons = await page.$$("button[class='size-grid-dropdown size-grid-button']");
        const buttonsInnerTxt = await page.$$eval("button[class='size-grid-dropdown size-grid-button']", btns => {
            return btns.map(btn => btn.innerText);
        });
        const possibleSizes = buttonsInnerTxt.filter(btn => btn.includes(`${shoeSize}`));
        const buttonIndex = buttonsInnerTxt.indexOf(possibleSizes[0]);

        await buttons[buttonIndex].click();

        await page.click('button[data-qa="add-to-cart"]'); // Add to cart

        await page.waitForTimeout(500);

        // Wait for "Added To Cart" Modal and click Checkout button
        await page.waitForSelector('button[class="ncss-btn-primary-dark"]');
        await page.click('button[class="ncss-btn-primary-dark"]');

        // Sign in and checkout
        await page.waitForSelector('#nike-unite-loginForm');

        await page.type('input[name="emailAddress"]', email);
        await page.waitForTimeout(250);
        await page.type('input[name="password"]', password);
        await page.waitForTimeout(250);
        await page.click('input[value="MEMBER CHECKOUT"]');

        // Type cvv number and continue to order review
        await page.waitForSelector('iframe[class="credit-card-iframe-cvv mt1 u-full-width"]'); // Checkout form does quick reload
        await page.waitForTimeout(2000); // Wait 2 seconds for reload

        const elemHandle = await page.$('iframe[class="credit-card-iframe-cvv mt1 u-full-width"]'); // Select iFrame within Page
        const frame = await elemHandle.contentFrame(); // Select content within iFrame
        
        await frame.waitForSelector('#cvNumber'); // Wait for selector within iFrame
        await frame.evaluate(() => document.querySelector('#cvNumber').focus()); // Focus on selector within iFrame
        await frame.type('#cvNumber', cvv, { delay: 100 });
        
        await page.click('.continueOrderReviewBtn');
        
        // Click purchase button and close browser

        console.log(`Completed on: ${Date()}`);
    })();
}

module.exports = bot;
