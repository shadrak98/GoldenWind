var mongoose = require('mongoose');


//schema for users
var ProjectSchema = new mongoose.Schema({
    proj_name : String,
    description : String,
    creator : String,
    donators : [{did : String, amount : Number}],
    goal : Number,
    received : Number,
    timer_vot : String,
    timer_fund : String,
    success : {
        type : String,
        default : false
    }, 
    back_ins : Number 
});

var Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;