var logger = require('morgan');
var cors = require('cors');
var errorhandler = require('errorhandler');
var dotenv = require('dotenv');
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();

dotenv.load();

var corsOptions = {
  origin: 'http://localhost:3000'
};

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors(corsOptions));

// by default environment is 'development'
if (app.get('env') === 'development') {
    app.use(logger('dev'));
    app.use(errorhandler());
}

app.use('/api', require('./routes/index'));

app.use(function (err, req, res, next) {
    if (err.name === "UnauthorizedError")
        res.status(401).send(err.message);
});

var port = process.env.PORT || 1667;
app.listen(port, function () {
   console.log('Server listening at port ' + port);
});