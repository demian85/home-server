const { Router } = require('express');

const main = new Router();

main.get('/', (req, res) => {
  res.render('index');
});

module.exports = main;
