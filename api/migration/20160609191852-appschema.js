var fs = require('fs');
var path = require('path');

exports.up = function (db, callback) {
    var filePath = path.join(__dirname + '/sqls/20160609191852-appschema-up.sql');
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err,data) {
        if (err) return callback(err);
        console.log('received data: ' + data);
        db.runSql(data, function (err) {
            if (err) return callback(err);
            callback();
        });
    });
};

exports.down = function (db, callback) {
    var filePath = path.join(__dirname + '/sqls/20160609191852-appschema-down.sql');
    fs.readFile(filePath, { encoding: 'utf-8' }, function (err,data) {
        if (err) return callback(err);
        console.log('received data: ' + data);
        db.runSql(data, function (err) {
            if (err) return callback(err);
            callback();
        });
    });
};
