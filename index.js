require('dotenv/config');

const express = require('express');
const client = require('./lib/client');

const app = express();

app.use((req, res, next) => {
  if (req.query.key !== process.env.AUTH_KEY) {
    res.status(401).end('Invalid auth key!');
    return;
  }
  next();
});

app.get('/event/on', (req, res) => {
  const { device } = req.query;

  console.log('/event/on device:', device);
  client.publish(`cmnd/${device}/POWER`, '1');

  res.end();
});

app.get('/event/off', (req, res) => {
  const { device } = req.query;

  console.log('/event/off device:', device);
  client.publish(`cmnd/${device}/POWER`, '0');

  res.end();
});

app.listen(process.env.PORT);
