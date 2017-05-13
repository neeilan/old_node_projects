var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var User = mongoose.Schema({
    facebookId: String,
    token: String,
    name: String,
    checkIns: Array
})

module.exports =  mongoose.model('User', User);
