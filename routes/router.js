var express = require('express');
var router = express.Router();
var User = require('../models/user');

// GET route for reading data
router.get('/', function (req, res, next) {
    return res.sendFile(path.join(__dirname + '/views/index.html'));
  });

 //login
  router.post('/login', function(req,res,next){
      if(req.body.email && req.body.password){
          User.authenticate(req.body.email, req.body.password, function(error, user){
              if(error||!user){
                  var err =  new Error('wrong email or password');
                  err.status = 401;
                  return next(err);
              }
              else{
                  req.session.userId = user._id;
                  return res.redirect('/main');
              }
          });
      }
      else{
          var err = new Error('All fields required');
          err.status = 400;
          return next(err);
      }
  })

router.post('/register',function(req,res,next){
    if(req.body.email && req.body.password && req.body.name && req.body.balance && req.body.contact){
        var userData={
            name : req.body.name,
            email :req.body.email,
            contact : req.body.contact,
            password : req.body.password,
            balance : req.body.balance
        }
        User.create(userData, function(error, user){
            if(error){
                return next(error);
            }
            else{
                req.session.userId=user._id;
                return res.redirect('/main');
            }
        })
    }
})

// GET route after registering
router.get('/main', function (req, res, next) {
    User.findById(req.session.userId)
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return next(err);
          } else {
            return res.sendFile(path.join(__dirname + '/views/main.html'))
          }
        }
      });
  });

// GET for logout logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
      // delete session object
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect('/');
        }
      });
    }
  });

  module.exports = router;