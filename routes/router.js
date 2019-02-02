var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Escrow = require('../models/escrow');
var Project = require('../models/project');
var path = require("path");




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

//Registering a new user
router.post('/register',function(req,res,next){
    if(req.body.email && req.body.password && req.body.name && req.body.balance && req.body.contact){
        var userData={
            name : req.body.name,
            email :req.body.email,
            contact : req.body.contact,
            password : req.body.password,
            balance : req.body.balance,
            public_address : req.body.address
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
    User.findById(req.session.userId,'-password')
      .exec(function (error, user) {
        if (error) {
          return next(error);
        } else {
          if (user === null) {
            var err = new Error('Not authorized! Go back!');
            err.status = 400;
            return next(err);
          } else {
            Project.find({creator:req.session.userId},(error, projs)=>{
                if(error){
                    return res.status(500).send({ message: 'Something went wrong' });
                }
                else{
                    
                    return res.send(projs);
                    //return res.render(main.html,projs,user);
                }
            })
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


//profile data
router.get('/profile',function(req,res,next){
    User.findById(req.session.userId,'-password -projects')
    .exec(function(error, user){
        return res.send(user);
        //return res.render(profile.html,user)
    })
    
})


//creating new project
router.post('/projects',function(req,res,){
    var projData={
        proj_name : req.body.proj_name,
        creator : req.session.userId,
        goal : req.body.goal,
        received : 0,
        timer_vot : req.body.timer_vot,
        timer_fund : req.body.timer_fund,
        back_ins : req.body.back_ins

    }
    project = new Project(projData);
    project.save();
    const name =projData.proj_name ;

    var escData={
        proj_name : req.body.proj_name,
        back_ins : req.body.back_ins
        }
    escrow = new Escrow(escData);
    escrow.save();
    
})

//donation
router.post('/donate',function(req,res){
    var donData={
        did:req.session.userId,
        amount:req.body.amount
    }
    Escrow.findOneAndUpdate(
        { proj_name : req.body.proj_name },
        { $push : { donators : donData } },
        function(error,success) {
            if(error) {
                console.log(error)
            }
            else{
                console.log(success)
            }
        });
    Project.findOneAndUpdate(
        { proj_name : req.body.proj_name },
        { $push : { donators : donData } },
        function(error,success) {
            if(error) {
                console.log(error)
            }
            else{
                console.log(success)
            }
        } 
    )
    User.findByIdAndUpdate(req.session.userId,
        {$inc: { balance : -1*req.body.amount }},
        function(error,success){
            if(error){
                console.log(error)
            }
            else{
                console.log(success)
            }
        }); 
    })



module.exports = router;