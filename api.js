// Please install OpenAI SDK first: `npm install openai`

import OpenAI from "openai";
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-645fda7d1dc24f7693b7637d55927b35'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();
const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views','views'));

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/ask', async (req, res) => {
    const userQuestion = req.body.question;

    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: userQuestion }],
        model: "deepseek-chat",
    });

    const response = completion.choices[0].message.content;
    res.render('index', { response });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
