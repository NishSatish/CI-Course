const pups = require('puppeteer');
const userFactory = require('../factories/UserFactory');
const sessionFactory = require('../factories/SessionFactory');

class CustomPage {
    static async build() {
        //Generates a new Puppeteer page
        const browser = await pups.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get: function (target, property) {
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page) {
        this.page = page;
    }

    async login () {
        const user = await userFactory();

        const {sig, session} = sessionFactory(user);
        
        await this.page.setCookie({ name: 'session', value: session });
        await this.page.setCookie({ name: 'session.sig', value: sig });
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf (selector) {
        return this.page.$eval(selector, el => el.innerHTML);
    }
}

module.exports = CustomPage;