var mongoose = require("mongoose"),
    Schema = mongoose.Schema;

var userSchema = mongoose.Schema({
    facebookId: String,
    token: String,
    name: String,
    pollsCreated: Array
})

var pollSchema = mongoose.Schema({
    id: String,
    createdBy: String,
    title: String,
    data: Array
})

var User = mongoose.model('User', userSchema),
    Poll = mongoose.model('Poll', pollSchema),
    Models = {
        User: User,
        Poll: Poll
    };




module.exports = Models;
