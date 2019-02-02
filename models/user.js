var mongoose = require('mongoose');


//schema for users
module.exports = mongoose.model("User",{
    name : String,
    email : String,
    contact : String,
    projects :[{
        type:String,
    }],
    public_address : String,
    tokens: Number,
    balance: Number
});