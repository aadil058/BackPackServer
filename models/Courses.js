var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CourseSchema = Schema({
    title: String,
    instructor: String,
    users: [{ type: Schema.Types.ObjectId, ref: 'Course' }]   // All students registered to a current course
});

mongoose.model('Course', CourseSchema);