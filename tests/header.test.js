jest.setTimeout(30000);

const Page = require('./helpers/page'); //Our Custom Page Implementation, includes Puppeteer

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

// afterEach(async () => {
//     const page = await Page.build();
//     await page.close();
// });



test('Header has correct text', async () => {
    const text = await page.getContentsOf('a.brand-logo');
    
    expect(text).toEqual('Blogster');
});

test('Clicking login button takes us to oAuth', async () => {
    await page.click('.right a');
    
    const url = await page.url();
    expect(url).toMatch('/accounts\.google\.com/');
});

test('When signed in, show logout button', async () => {
    await page.login();

    const text = await page.$eval('a[href="/auth/logout"]', el => el.innerHTML);

    expect(text).toEqual('Logout');
});
