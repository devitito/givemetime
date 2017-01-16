const env = process.env;

const API_PORT = env.API_PORT || 8080;
module.exports.PORT = env.PORT;
module.exports.API_PORT = API_PORT;
module.exports.API_URL = (env.API_URL || 'http://localhost') + ':' + API_PORT;

module.exports.JWT_SECRET = 'supersecret';

module.exports.config = {
    user: env.PGUSER,
    database: env.PGDATABASE,
    password: env.PGPASSWORD,
    host: env.PGHOST,
    port: env.PGPORT,
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30 * 1000, // how long a client is allowed to remain idle before being closed
};

module.exports.errors = {
    DATABASE_ERROR: 'Error while fetching the database, please try again later',
    DELETE_NO_RIGHT: 'Please only delete your own projects',
    AMOUNT_INVALID: 'Amount is invalid',
    UNKNOWN_PERSON: 'This person doesn\'t exist',
    UNKNOWN_PROJECT: 'This project doesn\'t exist',
    TOO_MUCH_CREDIT: 'This project doesn\'t need that much credit',
    NOT_ENOUGH_CREDIT: 'You don\'t have enough credits',
    BAD_AMOUNT: 'The estimated number of credits is not valid',
    ARGUMENT_MISSING: 'A required argument is missing.',
};

var bunyan = require('bunyan');
var log = bunyan.createLogger({ name: 'GiveMeTime' });

// eslint-disable-next-line
module.exports.errorMiddleware = function (err, req, res, next) {
    log.error('ERROR : ', err);
    res.status(err.status || 500);
    res.json({ error: err });
};
