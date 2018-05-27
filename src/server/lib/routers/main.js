const { Router } = require('express');
const basicAuth = require('express-basic-auth');

const main = new Router();

main.use(basicAuth({
  users: { 'admin': process.env.ADMIN_PASSWD },
  challenge: true,
  realm: 'Home Admin',
}));

main.get('/*', (req, res) => {
  res.render('index', { apiKey: JSON.stringify(process.env.AUTH_KEY) });
});

module.exports = main;
