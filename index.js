const express = require('express');
const bodyParser = require('body-parser');
const pup = require('puppeteer');
const cors = require('cors');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


const Scrapper = async (input) => {
    try {
        const browser = await pup.launch({ headless: false });
        const page = await browser.newPage();

        await page.goto(`https://www.imdb.com/title/${input}/`);
        console.log("Page has been loaded.");

        await page.waitForSelector("div.ipc-lockup-overlay__screen");
        await page.waitForTimeout(400);
        await page.click("div.ipc-lockup-overlay__screen");
        console.log("Clicked.");

        await page.waitForTimeout(600);
        const result = await page.evaluate(() => {
            const doc = document.querySelector(".sc-7c0a9e7c-0.hXPlvk");
            return doc.src;
        });
        console.log(result);

        await browser.close();

        return result;

    } catch (e) {
        console.log(e);
    }
};

app.get('/', (req, res) => {
    console.log(`End pointed.`);
    res.send("Got here.");
})

app.post('/api', (req, res) => {
    const input = req.body.input;
    const finalInput = input.toLowerCase().trim().replace(/\s/g, "_");
    const product = Scrapper(input);
    product.then(data => {
        console.log(`Data: ${data}`);
        const sending = {
            status: 200,
            URL: data
        }
        res.send(JSON.stringify(sending));
    })
    console.log("Reached here with input ", finalInput);
})

app.listen(5000, () => {
    console.log('Server running on PORT 5000.');
})
