var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var config = require('../config.json');
var Schema = mongoose.Schema;
var Promise = require('bluebird');

// currently i haven't used any encryption for password (can be done easily using node modules like bcrypt)
var UserSchema = Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }]   // All courses to which a user is registered
});

UserSchema.methods.generateJWT = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    return jwt.sign({
        id: this._id,
        exp: parseInt(expiry.getTime() / 1000)
    }, config.secret);
};

mongoose.model('User', UserSchema);
