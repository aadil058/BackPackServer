var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('lodash');

router.get('/signup/namecheck', function (req, res) {

    User.findOne({ 'username': req.query.username }, function(err, user) {
        if(!user)
            res.status(200).send("No conflict");
        else
            res.status(409).send("A user with given name already exists");
    });
});

router.post('/signup', function (req, res) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;

    user.save(function(err) {
        if(err)
            res.status(403).send("Signup error, try again later!");
        
        res.status(201).send({
            token: user.generateJWT()
        });
    });
});

router.post('/login', function (req, res) {
    User.findOne({ 'username': req.body.username }, function(err, user) {
        if(!user)
            res.status(404).send("Username not found");
        else if(!(user.password === req.body.password))
            res.status(401).send("Wrong password");
        else
            res.status(200).send({ token: user.generateJWT() });
    });
});

module.exports = router;