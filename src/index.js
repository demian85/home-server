require('dotenv/config');

const express = require('express');
const compression = require('compression');
const { runScheduledActions } = require('./server/lib/actions');

require('./server/lib/mqtt/init');

runScheduledActions();

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
