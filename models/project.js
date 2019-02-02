var mongoose = require('mongoose');


//schema for users
var ProjectSchema = new mongoose.Schema({
    proj_name : String,
    creators : [{
        type : String
    }],
    donators : {
        did : [{
            type : String
        }],
        amount : [{
            type : Number
        }]
    },
    goal : Number,
    received : Number,
    timer_vot : Date,
    timer_fund : Date,
    back_ins : Number 
});

var Project = mongoose.model('Project', ProjectSchema);
module.exports = Project;