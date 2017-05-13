var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var Bar = mongoose.Schema({
    id: String,
    checkIns: Number
})

module.exports =  mongoose.model('Bar', Bar);
