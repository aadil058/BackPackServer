var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var mongoose = require('mongoose');
var Course = mongoose.model('Course');
var config = require('../config.json');

var auth = jwt({
    secret: config.secret
});

router.get('/all', auth, function(req, res) {
    Course.find({}, function(err, courses) {
        if(!courses)
            res.status(404).send("Can't find any course at this time, please try again");
        else
            res.status(200).send({ courses: courses });
    });
});

// currently i made this API endpoint public as currently their is no feature at client side of our app from which we can
// register a new course
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