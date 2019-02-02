var mongoose = require('mongoose');


//schema for users
module.exports = mongoose.model("Project",{
    name : String,
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
    timer_vot :  
});