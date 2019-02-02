var express = require("express");
var app = express();
var mongoose = require('mongoose');
var http = require("http").Server(app);
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
const{ contract } = require('./contracts/app')

const swig = require('swig');

var MongoStore = require('connect-mongo')(session);

//connect to MongoDB
mongoose.connect('mongodb://localhost/GoldenWind');
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: db
    })
  }));


//view engine setup
app.engine('html',swig.renderFile);
app.set('views'),path.join(__dirname,'views');
app.set('view engine','html');
app.set('view engine','jade');
app.set('view cache',false);
swig.setDefaults({ cache:false, varControls:['<%=','%=>']});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from template
app.use(express.static(__dirname + '/views'));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('File Not Found');
    err.status = 404;
    next(err);
  });

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message);
  });

//creating a server
var server = http.listen(3020, () => {
    console.log("Well done, now I am listening on ", server.address().port)
})