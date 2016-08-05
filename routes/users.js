var express = require('express');
var router = express.Router();
var config = require('../config.json');
var jwt = require('jsonwebtoken');
var _ = require('lodash');

var users = [{
    id: 1,
    username: 'aadil',
    password: 'aadil'
}];

function generateJWT(user) {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
    return jwt.sign({
        id: user.id,
        exp: parseInt(expiry.getTime() / 1000)
    }, config.secret);
}

router.get('/signup/namecheck', function (req, res) {
    if(_.find(users, { username: req.query.username }))
        res.status(409).send("A user with given name already exists");
    else
        res.status(200).send("No Conflict");
});

router.post('/signup', function (req, res) {
    var profile = {
        id: _.maxBy(users, 'id').id + 1,
        username: req.body.username,
        password: req.body.password
    };

    users.push(profile);

    res.status(201).send({
        token: generateJWT(profile)
    });
});

router.post('/login', function (req, res) {
    var user = _.find(users, { username: req.body.username });

    if(!user)
        res.status(404).send("Username not found");

    if(!(user.password === req.body.password))
        res.status(401).send("Wrong password");

    res.status(200).send({ token: generateJWT(user) });
});

module.exports = router;