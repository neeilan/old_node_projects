var mongoose = require("mongoose");

var Stock = mongoose.Schema({
    symbol: String,
    data: {}
})
module.exports = mongoose.model("Stock", Stock);;
