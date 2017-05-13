var express = require("express"),
    app = express(),
    session = require("express-session"),
    port = process.env.PORT || 8080,
    dbURL = process.env.MONGOLAB_URI || "mongodb://localhost:27017/data",
    mongoose = require("mongoose"),
    MongoStore = require("connect-mongo")(session),
    User = require("./app/models/user").User,
    Poll = require("./app/models/user").Poll,
    passport = require("passport"),
    shortid = require("shortid");

require("./config/passport")(passport);
mongoose.connect(dbURL);

app.use(session({
    secret: "pollSecret",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({mongooseConnection: mongoose.connection,
        ttl: 2 * 24 * 60 * 60
    })
}));

app.use(passport.initialize());
app.use(passport.session());

//VIEWS
app.use(express.static(__dirname + '/public'));
app.set("view engine", "ejs");

//ROUTES
var auth = express.Router();
require("./app/routes/auth.js")(auth, passport)
app.use("/auth", auth);

var mainRoutes = express.Router();
require("./app/routes/mainRoutes.js")(mainRoutes, passport, User, Poll, shortid)
app.use("/", mainRoutes);


app.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);
})