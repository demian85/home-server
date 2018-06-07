require('dotenv/config');

const logger = require('winston');
const express = require('express');
const compression = require('compression');

logger.level = process.env.LOG_LEVEL || 'info';

const main = require('./server/lib/routers/main');
const api = require('./server/lib/routers/api');

const app = express();

app.set('views', `${process.cwd()}/src/client/views`);
app.set('view engine', 'html');
app.engine('html', require('hbs').__express);

app.use(compression());
app.use(express.static(`${process.cwd()}/dist/client/public`));
app.use('/api', api);
app.use(main);

app.listen(process.env.PORT);
