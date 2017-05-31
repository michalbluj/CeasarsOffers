var pg = require('pg');
var dateUtils = require('../utils/dateUtils.js');
var ftpUtils = require('../utils/ftpUtils.js');
var caesarsLogger = require('../utils/caesarsLogger.js');
var dbUtils = require('../utils/dbUtils.js');

exports.getRecordsBeforeDateAndPostToFTPServer = function(dateParam,fileName,callback){
    var startTime = new Date().getTime();
    var results = [];
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        const query = client.query('SELECT name FROM salesforce.contact where systemmodstamp < \'' + dateUtils.convertToPostgresDateTime(dateParam)+'\';');

        query.on('row', (row) => {results.push(row);});

        query.on('end', () => {
            done();
            caesarsLogger.log('info','getRecordsBeforeDateAndPostToFTPServer','{"timeDiff":"'+new Date().getTime() - startTime+'"}');
            callback(results,fileName);
        });
    });
}

exports.postContact = function(request, response, next){
     caesarsLogger.generateKey();
     var startTime = new Date().getTime();
     var statement = dbUtils.buildContactInsertStatement(JSON.parse(JSON.stringify(request.body)));

     pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(statement,
            function(err, result) {
                var timeDiff = new Date().getTime() - startTime;
                if (err) {
                    caesarsLogger.log('error','exports.postContacts','{"timeDiff":"'+timeDiff+'"}');
                    response.json({ message: 'Error during contact post ' + JSON.stringify(err)});
                } else {
                    caesarsLogger.log('info','exports.postContacts','{"timeDiff":"'+timeDiff+'"}');
                    response.json({ message: 'You have done successful contact post call ' + JSON.stringify(result)});
                }
                client.end();
            }
        );
     });
 }

exports.getContacts = function(request, response, next){
    caesarsLogger.generateKey();
    var startTime = new Date().getTime();
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT firstname, lastname FROM salesforce.contact ',
            function(err, result){
                done();
                caesarsLogger.log('info','exports.getContacts','{"timeDiff":"' + new Date().getTime() - startTime + '"}');
                response.json(err ? err : result.rows);
            }
        );
    });
}

exports.uploadContacts = function(fileContent){
    var startTime = new Date().getTime();
    console.log('uploading contacts into postgres');
    caesarsLogger.log('info','exports.uploadContacts','{"timeDiff":"' + new Date().getTime() - startTime + '"}');
}