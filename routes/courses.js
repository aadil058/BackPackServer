// http://stackoverflow.com/questions/25798691/mongoose-with-bluebird-promisifyall-saveasync-on-model-object-results-in-an-ar
// http://stackoverflow.com/questions/38842920/node-js-express-4-mongoose-does-not-saving-data
// http://stackoverflow.com/questions/34960886/are-there-still-reasons-to-use-promise-libraries-like-q-or-bluebird-now-that-we
// http://stackoverflow.com/questions/26076511/handling-multiple-catches-in-promise-chain

// error codes and corresponding error
// 101 - User not found in our database
// 102 - Course not found in our database
// 103 - Error saving user
// 104 - Error saving course
// 105 - Error populating courses data

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

    Promise.all([ User.findById(req.user.id).exec(), Course.findById(req.body.courseId).exec()])
        .spread(function(user, course) {
            if(user === null) throw error(101);
            user.courses.push(course);

            if(course === null) throw error(102);
            course.users.push(user);

            return Promise.all([user.save(), course.save()]);
            // can be replaced with 'return [user.save(), course.save()]' Or we can save user and course inside different then methods as well
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
    Course.findById(req.query.courseId, function(err, course) {
        var index = course.users.indexOf(req.user.id);
        course.users.splice(index, 1);
        course.save(function(err, course) {
            User.findById(req.user.id, function(err, user) {
                index = user.courses.indexOf(course._id);
                user.courses.splice(index, 1);
                user.save(function(err, user) {
                    user.populate('courses', function(err, data) {
                        res.status(200).send(data.courses);
                    });
                });
            });
        });
    });
});

router.get('/enrolled', auth, function(req, res) {
    User.findById(req.user.id, function(err, user) {
       user.populate('courses', function (err, data) {
           res.status(200).send(data.courses);
       });
    });
});

router.get('/all', auth, function(req, res) {
    Course.find({}, function(err, courses) {
        if(!courses)
            res.status(404).send("Can't find any course at this time, please try again");
        else
            res.status(200).send({ courses: courses });
    });
});

// currently i made this API endpoint public as currently their is no feature at client side of our app from which we can register a new course
router.post('/all', function(req, res) {
    var course = new Course();
    course.title = req.body.title;
    course.instructor = req.body.instructor;
    course.save(function(err, course) {
        if(err)
            res.status(403).send("Unable to register course, please try again");
        else
            res.status(201).send("Successfully created");
    });
});

module.exports = router;