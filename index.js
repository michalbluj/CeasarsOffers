var express = require('express');
var pg = require('pg');

var app = express();
app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.get('/offers', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT name FROM offers ', function(err, result) {
      done();
      if (err) {
        console.error(err); response.send("Error " + err);
      } else {
        response.render('pages/offers', {results: result.rows} );
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
        response.render('pages/contacts', {results: result.rows} );
      }
    });
  });
});


var router = express.Router();

router.use(function(req,res,next){
    next();
});

router.route('/offers').get(
    getRestOffers(req,res);
);

function getRestOffers(req, res){
              pg.connect(process.env.DATABASE_URL, function(err, client, done) {
                client.query('SELECT name FROM offers ', function(err, result){
                                                             done();
                                                             if(err){
                                                                 res.json(err);
                                                             } else {
                                                                 res.json(result.rows);
                                                             }
                                                         });
            });
};

router.route('/contacts').get(
    function(req, res) {
          pg.connect(process.env.DATABASE_URL, function(err, client, done) {
            client.query('SELECT firstname, lastname FROM salesforce.contact ', function(err, result){
                                                         done();
                                                         if(err){
                                                             res.json(err);
                                                         } else {
                                                             res.json(result.rows);
                                                         }
                                                     });
        });
    }
);


app.use('/rest',router);