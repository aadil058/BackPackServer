var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var config = require('../config.json');

var auth = jwt({
    secret: config.secret
});

router.get('/protected', auth, function(req, res) {
    res.status(200).send("Data from protected route");
});

router.get('/unprotected', function (req, res) {
    res.status(200).send("Data from unprotected Route");
});

router.use('/users', require('./users'));

module.exports = router;
