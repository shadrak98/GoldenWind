var mongoose = require('mongoose');


//schema for users
module.exports = mongoose.model("Project",{
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