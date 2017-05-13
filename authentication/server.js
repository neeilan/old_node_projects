var express = require ("express"),
    app = express(),
    port = process.env.PORT || 8080,
    morgan = require("morgan"),
    cookieParser = require("cookie-parser"), //don't even nede this anymore
    session = require("express-session"),
    mongoose = require("mongoose"),
    MongoStore = require('connect-mongo')(session),
    configDB = require("./config/database.js"),
    bodyParser = require("body-parser"),
    flash = require("connect-flash"),
    passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy;
    
require("./config/passport")(passport);

//mongoose connect to DB
mongoose.connect(configDB.url);


//middlewares  
app.use(morgan("dev")); 
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(session({
    secret: "anyString",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({mongooseConnection: mongoose.connection,
        ttl: 2 * 24 * 60 * 60
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//viewengine
app.set("view engine", "ejs");

//routes

var auth = express.Router();
require ("./app/routes/auth.js")(auth, passport)
app.use("/auth", auth);

var api = express.Router();
require ("./app/routes/api.js")(api, passport)
app.use("/api", api);

var secure = express.Router();
require ("./app/routes/secure.js")(secure, passport)
app.use("/",secure);

app.listen(port, function(err) {
    if (err) throw err;
    console.log("listening on " + port);
});