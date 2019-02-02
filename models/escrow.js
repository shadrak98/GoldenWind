var mongoose = require('mongoose');


//schema for users
module.exports = mongoose.model("Escrow",{
    proj_name : String,
    proj_id : String,
    donators : {
        did : [{
            type : String
        }],
        amount : [{
            type : Number
        }]
    },
    back_ins : Number 
});