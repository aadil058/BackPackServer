// http://stackoverflow.com/questions/25798691/mongoose-with-bluebird-promisifyall-saveasync-on-model-object-results-in-an-ar
// http://stackoverflow.com/questions/38842920/node-js-express-4-mongoose-does-not-saving-data
// http://stackoverflow.com/questions/34960886/are-there-still-reasons-to-use-promise-libraries-like-q-or-bluebird-now-that-we
// http://stackoverflow.com/questions/26076511/handling-multiple-catches-in-promise-chain

// error codes and corresponding error
// 101, 102, 106, 107 may also be caused due to lost connection with database
// 101 (add POST) - User not found in our database
// 102 (add POST) - Course not found in our database
// 103 (add POST) - Error saving user
// 104 (add POST) - Error saving course
// 105 (add POST) - Error populating courses data
// 106 (leave DELETE) - User not found in our database
// 107 (leave DELETE) - Course not found in our database
// 108 (leave DELETE) - Error saving user
// 109 (leave DELETE) - Error saving course
// 110 (leave DELETE) - Error populating courses data
// 111 (enrolled GET) - Error populating data
// 112 (all - GET) - Error fetching all courses
// 113 (all - POST) - Error saving course

// TODO: Remove duplicates from database (user and course) every time before saving user or course

var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var Promise = require('bluebird');
var mongoose = require('mongoose');
mongoose.Promise = Promise;
var Course = mongoose.model('Course');
var User = mongoose.model('User');
User.Promise = Promise;
Course.Promise = Promise;
var config = require('../config.json');
var _ = require('lodash');

var auth = jwt({
    secret: config.secret
});

router.post('/add', auth, function(req, res) {

    Promise.all([User.findById(req.user.id).exec(), Course.findById(req.body.courseId).exec()])
        .spread(function(user, course) {
            if(user === null) throw error(101);
            user.courses.push(course);

            if(course === null) throw error(102);
            course.users.push(user);

            return Promise.all([user.save(), course.save()]);
            // can be replaced with 'return [user.save(), course.save()]' Or we can save user & course inside different then methods as well
        })
        .spread(function(user, course) {
            if(user === null)  throw error(103);
            if(course === null)  throw error(104);
            return User.findById(user._id).populate('courses').exec();
        })
        .then(function(data) {
            if(data === null)  throw  error(105);
            res.status(200).send(data.courses);
        })
        .catch(function (err) {
            console.log(err);
        });
});

function error(errorCode) {
    const err = new Error();
    err.code = errorCode;
    return err;
}


router.delete('/leave', auth, function(req, res) {

    // Course.findById(...).exec().then().then()... will also work

    Promise.all([User.findById(req.user.id).exec(), Course.findById(req.query.courseId).exec()])
        .spread(function(user, course) {
            if(user === null)  throw error(106);
            if(course === null) throw error(107);
            user.courses.splice(user.courses.indexOf(course._id), 1);
            course.users.splice(course.users.indexOf(user._id), 1);
            return Promise.all([user.save(), course.save()]);
        })
        .spread(function(user, course) {
            if(user === null)  throw error(108);
            if(course === null) throw error(109);
            return User.findById(user._id).populate('courses').exec();
        })
        .then(function (data) {
            if(data === null)  throw error(110);
            res.status(200).send(data.courses);
        })
        .catch(function (err) {
            console.log(err);
        });
});

router.get('/enrolled', auth, function(req, res) {
    User.findById(req.user.id).populate('courses').exec()
        .then(function(data) {
            if(data === null)  throw err(111);
            res.status(200).send(data.courses);
        })
        .catch(function(err) {
            console.log(err);
        });
});

router.get('/all', auth, function(req, res) {
    Course.find({}).exec()
        .then(function(courses) {
            if(courses === null) throw error(112);
            res.status(200).send({ courses: courses })
        })
        .catch(function(err) {
           console.log(err);
        });
});

router.post('/all', function(req, res) {
    var course = new Course();
    course.title = req.body.title;
    course.instructor = req.body.instructor;
    course.save()
        .then(function(course) {
            if(course === null) throw error(113);
            res.status(201).send("Successfully created");
        })
        .catch(function(err) {
            console.log(err);
        });
});

module.exports = router;