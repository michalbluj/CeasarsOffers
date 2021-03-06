var express = require('express');
var pg = require('pg');
var fs = require('fs');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: false })); // for parsing application/x-www-form-urlencoded

var contactModel = require('./model/contact.js');
var customerModel = require('./model/customer.js');
var offerModel = require('./model/offer.js');
var segmentModel = require('./model/segment.js');
var ftpUtils = require('./util/ftpUtils.js');
var dbUtils = require('./util/dbUtils.js');
var caesarsLogger = require('./util/caesarsLogger.js');
var javaConnector = require('./java/restConnector.js');
var shortid = require('shortid');

var router = express.Router();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});

router.use(function(req,res,next){
    next();
});

app.get('/', function(request, response) {
    response.render('pages/index');
});

app.get('/whatIsJavaTime',function(request,response){
    javaConnector.callJavaApp(response);
});
app.get('/doSomethingOnJavaSide',function(request,response){
    javaConnector.doSomethingOnJavaSide(response);
});

app.get('/uploadWinnetIdFile',function(request,response){
    this.lKey = shortid.generate();
    var destinationFileName = request.query.filePath ? request.query.filePath : 'readme.txt';
    var sourceFilePath = request.query.sourceFilePath ? request.query.sourceFilePath : 'readme.txt';
    ftpUtils.readFileFromSFTPServer.bind(this)(sourceFilePath,destinationFileName,ftpUtils.sftpConnectionParameters(),segmentModel.uploadSegments.bind(this));
    response.render('pages/index');
});

app.get('/generateContactFile',function(request,response){
    this.lKey = shortid.generate();
    var dateParam = request.query.enddate ? new Date(request.query.enddate) : new Date();
    var destinationFileName = request.query.filePath ? request.query.filePath : 'contacts.txt';
    contactModel.getRecordsBeforeDateAndPostToFTPServer.bind(this)(dateParam,destinationFileName,ftpUtils.saveFileOnSFTPServer.bind(this));
    response.render('pages/index');
});

app.get('/uploadContactFile',function(request,response){
    this.lKey = shortid.generate();
    var destinationFileName = request.query.filePath ? request.query.filePath : 'readme.txt';
    var sourceFilePath = request.query.sourceFilePath ? request.query.sourceFilePath : 'readme.txt';
    ftpUtils.readFileFromSFTPServer.bind(this)(sourceFilePath,destinationFileName,ftpUtils.sftpConnectionParameters(),contactModel.uploadContacts.bind(this));
    response.render('pages/index');
});

app.get('/offers', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT name FROM offers ', function(err, result) {
            done();
            if (err) {
                console.error(err); response.send("Error " + err);
            } else {
                response.render('pages/offers', {results: result.rows, size: result.rows.length} );
            }
        });
    });
});


app.get('/contacts', function (request, response) {
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query('SELECT firstname, lastname FROM salesforce.contact ', function(err, result) {
        done();
        if (err) {
            console.error(err); response.send("Error " + err);
        } else {
            response.render('pages/contacts', {results: result.rows, size: result.rows.length} );
        }
        });
    });
});


router.get('/contacts',contactModel.getContacts);
router.post('/contacts',contactModel.postContact);

router.get('/availableOffers',offerModel.getAvailableOffers); // Available Offer List
router.get('/offerDetails',offerModel.getOfferDetails); // View Offer Details
router.put('/modifyOffer',offerModel.modifyOffer); // Offer modification

router.get('/offers',offerModel.getOffers); // simple offer retrieval without any filtering
router.post('/offers',offerModel.postOffers); // offer insert

router.get('/customers',customerModel.getCustomers);
router.post('/customer',customerModel.addCustomerInfo);

app.use('/rest',router);