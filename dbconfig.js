module.exports = {
    'DB_URL' : 'mongodb://aadil:aadil@ds029565.mlab.com:29565/backpack',
    dbconnection: function (mongoose) {
        mongoose.connection.on('error', function () {
            console.log('database connection error');
        });
        mongoose.connection.once('open', function () {
            console.log('database connection open');
        });
    }
};