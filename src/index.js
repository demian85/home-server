require('dotenv/config');

const logger = require('winston');
const express = require('express');

logger.level = process.env.LOG_LEVEL || 'info';

const main = require('./server/lib/routers/main');
const api = require('./server/lib/routers/api');

const app = express();
app.use(main);
app.use('/api', api);

app.listen(process.env.PORT);
