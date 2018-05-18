require('dotenv/config');

const logger = require('winston');
const express = require('express');

logger.level = process.env.LOG_LEVEL || 'info';

const { main, api } = require('./server/lib/routers');

const app = express();
app.use(main);
app.use('/api', api);

app.listen(process.env.PORT);
