// error codes and corresponding error
// 114 (namecheck GET) - User already exist
// 115 (signup POST) - Error saving user
// 11000 (signup POST) - Username already exist (this error is occurred if somehow same name validation check is failed to detect same name)
// 116 (login POST) - Account not found
// 117 (login POST) - Wrong Password

var express = require('express');
var router = express.Router();
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var User = mongoose.model('User');
User.Promise = Promise;
var _ = require('lodash');

router.get('/signup/namecheck', function (req, res) {

    User.findOne({ 'username': req.query.username })
        .then(function(user) {
            if(!(user === null)) throw error(114);
            res.status(200).send("No conflict");
        })
        .catch(function(err) {
            console.log(err);
            if(err.code === 114)
                res.status(409).send("A user with given name already exists");
        });
});

function error(errorCode) {
    const err = new Error();
    err.code = errorCode;
    return err;
}

router.post('/signup', function (req, res) {
    var user = new User();
    user.username = req.body.username;
    user.password = req.body.password;

    user.save()
        .then(function(user) {
            if(user === null)  throw error(115);
            res.status(201).send({ token: user.generateJWT() });
        })
        .catch(function(err) {
            console.log(err);
            if(err.code === 115)
                res.status(403).send("Signup error, try again later!");
            if(err.code === 11000)
                res.status(409).send("Signup error, username already exist");
        });
});

router.post('/login', function (req, res) {

    User.findOne({ 'username': req.body.username })
        .then(function(user) {
            if(user === null) throw error(116);
            if(!(user.password === req.body.password)) throw error(117);
            res.status(200).send({ token: user.generateJWT() });
        })
        .catch(function(err) {
            console.log(err);
            if(err.code === 116) res.status(404).send("Account not found");
            if(err.code === 117) res.status(401).send("Wrong password");
        });
});

module.exports = router;