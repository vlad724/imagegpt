import express, { json } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const port = 8080;
const API_KEY = process.env.API_KEY;
const URL = 'https://api.openai.com/v1/images/generations';

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get('/test', async(req, res) => {


});

app.post("/generate-image", async(req, res) => {
    const prompt = req.body.prompt;
    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
    }

    try {
        if (!!!prompt) {
            throw Error('No prompt found');
        }
        const response = await fetch(URL, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ prompt, size: '256x256' }),
        });

        const data = await response.json();
        console.log({ data });

        const imageURL = data.data[0].url;
        console.log({ imageURL });

        const imageResponse = await fetch(imageURL);
        const imageBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(imageBuffer);

        const id = crypto.randomBytes(20).toString('hex');
        const filename = `${id}.jpg`;
        const pathname = 'public/images/';

        fs.writeFileSync(`${pathname}${filename}`, buffer);
        console.log('Imaged saved locally');

        res.setHeader('Content-Type', 'application/json');
        res.json({ filename, API_KEY });

    } catch (error) {
        console.error(error.message);
        res.sendStatus(500);
    }
});


app.listen(port, () => {
    console.log("Server inicializado.");
})