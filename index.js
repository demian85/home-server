require('dotenv/config');

const logger = require('winston');
const express = require('express');

logger.level = process.env.LOG_LEVEL || 'info';

const api = require('./lib/api');

const app = express();
app.use(api);
app.listen(process.env.PORT);
