var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Escrow = require('../models/escrow');
var Project = require('../models/project');
const{ contract } = require('../contracts/app')
var path = require("path");




// GET route for reading data
router.get('/', function (req, res, next) {
    console.log(__dirname)
    return res.render('login.html')
  })

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
            balance : parseInt(req.body.balance)
        }
        User.create(userData, function(error, user){
            if(error){
                return next(error);
            }
            else{
                req.session.userId=user._id;
                //contract.setAccount(user.id)
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
            //   console.log(req.session.userId)
            Project.find({},(error, projs)=>{
                if(error){
                    return res.status(500).send({ message: 'Something went wrong' });
                }
                else{
                    
                    //return res.send(projs);
                    // console.log(projs)
                    return res.render('main.html',{projs, user});
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
        var val= (contract.balanceOf(user.public_address))
        var tok = val.c[0];
        return res.render('./profile/profile.html',{user,tok})
    })
    
})


//creating new project
router.post('/projects',function(req,res,){
    var projData={
        proj_name : req.body.proj_name,
        creator : req.session.userId,
        description : req.body.description,
        goal : parseInt(req.body.goal),
        received : 0,
        timer_vot : req.body.timer_vot,
        timer_fund : req.body.timer_fund,
        back_ins : parseInt(req.body.back_ins)

    }
    var token = parseInt(req.body.tokens);
    project = new Project(projData);
    project.save();
    const name =projData.proj_name ;

    var escData={
        proj_name : req.body.proj_name,
        back_ins : req.body.back_ins
        }
    escrow = new Escrow(escData);
    escrow.save();
    console.log(projData)
    
    User.findById(req.session.userId,'-password -projects')
    .exec(function(error, user){
        contract.start_campain(user.public_address,token);
    })
    res.redirect('/main');
    
})

router.get('/thread/:tagId/:nam', (req,res)=>{
    var projname = req.params.tagId;
    var name = req.params.nam;
    Project.findOne({proj_name:projname},(error, projs)=>{
        if(error){
            return res.status(500).send({ message: 'Something went wrong' });
        }
        else{
            return res.render('thread.html',{projs,name});
        }
    })
})

router.get('/milestone',(req,res)=>{
    User.findById(req.session.userId,'-password -projects')
    .exec(function(error, user){
        contract.milestone(user.public_address);
        res.redirect('/main');
    })
    
})

router.get('/funds/:pro_name',(req,res)=>{
    var name = req.params.pro_name;
    User.findById(req.session.userId,'-password -projects')
    .exec(function(error, user){
        res.render('donor.html',{user,name})
    })
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
        
        res.redirect('/main')
    })

//failure
router.get('/failure/:pro_name',(req,res)=>{
    var pname=req.params.pro_name;
    Escrow.find({proj_name:pname})
    .exec(function(error,pdata){
        for(var i = pdata[0].donators.length-1; i>=0; i--){
            User.findByIdAndUpdate(pdata[0].donators[i].did,
                {$inc: {balance : pdata[0].donators[i].amount}},
                function(error,success){
                    if(error){
                        console.log(error)
                    }
                    else{
                        console.log(success)
                    }
                });
            
        }
        Escrow.findOneAndDelete({proj_name:pname},
            function(error,success){
                if(error){
                    console.log(error)
                }
                else{
                    console.log(success)
                }
            });
            Project.findOneAndDelete({proj_name:pname},
                function(error,success){
                    if(error){
                        console.log(error)
                    }
                    else{
                        console.log(success)
                    }
                }); 
        res.redirect('/main')
    })
})


//success
router.get('/success/:pro_name',(req,res)=>{
    var pname=req.params.pro_name;
    Project.findOneAndUpdate({proj_name:pname},
        {$set :{success:true}})
    .exec(function(error,pdata){
        console.log(pdata);
        User.findByIdAndUpdate(pdata.creator,
            {$inc: {balance : ((100-pdata.back_ins)/100)*pdata.goal}},
            function(error,success){
                if(error){
                    console.log(error)
                }
                else{
                    console.log(success)
                }
            });
            Escrow.findOneAndUpdate({proj_name:pdata.proj_name},
                {$set : {amount: (pdata.back_ins/100)*pdata.goal}},
            function(error,success){
                if(error){
                    console.log(error)
                }
                else{
                    console.log(success)
                }
            });
        res.redirect('/main')
    })
})

module.exports = router;