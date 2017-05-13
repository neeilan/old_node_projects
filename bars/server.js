var express = require("express"),
    app = express(),
    session = require("express-session"),
    dbUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/data",
    mongoose = require("mongoose"),
    MongoStore = require("connect-mongo")(session),
    User = require("./app/models/user.js"),
    Bar = require("./app/models/bar.js"),
    port = process.env.PORT,
    yelpAuth = require("./config/yelpAuth.js"),
    passport = require("passport"),
    Yelp = require("yelp"),
    cookieParser = require('cookie-parser');

require("./config/passport")(passport);

//DATABASE
mongoose.connect(dbUrl);
app.use(session({
    secret: "barSecret",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({mongooseConnection: mongoose.connection,
        ttl: 2 * 24 * 60 * 60
    })
}));


//MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());


var yelp = new Yelp({
    consumer_key: yelpAuth.consumer_key,
    consumer_secret: yelpAuth.consumer_secret,
    token: yelpAuth.token,
    token_secret: yelpAuth.token_secret,
});


//VIEWS
app.use(express.static(__dirname + '/public'));

app.set("view engine", "ejs");

//ROUTES
var auth = express.Router();
require("./app/routes/auth.js")(auth, passport)
app.use("/auth", auth);

var main = express.Router();
require("./app/routes/main.js")(app, yelp, User, Bar)
app.use("/*", main);


app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);
})

