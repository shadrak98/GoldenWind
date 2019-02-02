var express = require("express");
var app = express();
var http = require("http").Server(app);
var path = require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
var router = express.Router();

var routes = require('./routes/index');
var users = require('./routes/users');


var User = require('./models/user');
var Project = require('./models/project');
var Escrow = require('./models/escrow');

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

app.post('/users', function(req, res){
    var data = req.body;
   
    User.findOne({email: data.email}, (err,user){
        if(err) {
            return err;
        }
        var dbo = db.db('Goldenwind');
        if(!user){
            user = {name: user.name, email: user.email, contact: user.contact};
            dbo.collection('User').insertOne(user, function(err, res){
                if(err) {
                    return err;
                } else {
                    console.log("Data inserted into database successfully.");
                }
            });
            } else {
            res.status(500).send('Account already registered.');
        }
    })
});

app.listen(3000);
console.log('Server is running.');