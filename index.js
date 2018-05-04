require('dotenv/config');

const express = require('express');
const api = require('./lib/api');

const app = express();

app.use(api);
app.listen(process.env.PORT);
