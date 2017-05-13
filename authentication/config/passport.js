var LocalStrategy = require("passport-local").Strategy,
    FacebookStrategy = require("passport-facebook").Strategy,
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    BearerStrategy = require("passport-http-bearer").Strategy;
var User = require("../app/models/user"),
    configAuth = require("./auth.js");


module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    })

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        })
    })

    passport.use("local-signup", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, function(req, email, password, done) {
        //nextTick ensures it doesnt execute until everything else in event loop is done
        process.nextTick(function() {
            User.findOne({
                "local.username": email
            }, function(err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, false, req.flash("signUpMessage", "Email already taken"))
                }
                if (!req.user) {

                    var newUser = new User();
                    newUser.local.username = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.save(function(err) {
                        if (err) throw err;
                        return done(null, newUser);
                    })
                }
                else { //merging
                    var user = req.user;
                    user.local.username = email;
                    user.local.password = user.generateHash(password);
                    user.save(function(err) {
                        if (err) throw err;
                        return done(null, user);
                    })
                }
            })
        })
    }))


    passport.use("local-login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    }, function(req, email, password, done) {
        process.nextTick(function() {
            User.findOne({
                "local.username": email
            }, function(err, user) {
                if (err) return done(err);
                if (!user) {
                    return done(null, false, req.flash("loginMessage", "No such user"));
                }
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash("loginMessage", "Invalid password"));
                }
                return done(null, user)

            })
        })

    }))



    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true
        },
        function(req, accessToken, refreshToken, profile, done) {
            process.nextTick(function() {

                if (!req.user) {

                    User.findOne({
                        "google.id": profile.id
                    }, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {

                            if (!user.google.token) {
                                user.google.id = profile.id;
                                user.google.token = accessToken;
                                user.google.name = profile.name.givenName;
                                user.google.email = profile.emails[0].value;
                                user.save(function(err) {
                                    if (err) throw err;
                                    return done(null, user);
                                });
                            }
                            return done(null, user);
                        }
                        else //no user found 
                        {
                            var newUser = new User();
                            newUser.google.id = profile.id;
                            newUser.google.token = accessToken;
                            newUser.google.name = profile.name.givenName;
                            newUser.google.email = profile.emails[0].value;
                            newUser.save(function(err) {
                                if (err) throw err;
                                return done(null, newUser);
                            });
                        }
                    })
                }
                else {
                    var user = req.user;
                    user.google.id = profile.id;
                    user.google.token = accessToken;
                    user.google.name = profile.name.givenName;
                    user.google.email = profile.emails[0].value;
                    user.save(function(err) {
                        if (err) throw err;
                        return done(null, user);
                    })
                }
            })
        }
    ));




    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true,
            profileFields: ['id', 'emails', 'name']
        },
        function(req, accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                //case one: user not logged in yet
                if (!req.user) {
                    User.findOne({
                        "facebook.id": profile.id
                    }, function(err, user) {
                        if (err)
                            return done(err);
                        if (user) {
                            if (!user.facebook.token) {
                                user.facebook.id = profile.id;
                                user.facebook.token = accessToken;
                                user.facebook.name = profile.name.givenName + " " + profile.name.familyName;
                                user.facebook.email = profile.emails[0].value;
                                user.save(function(err) {
                                    if (err) throw err;
                                    return done(null, user);
                                });
                            }
                            return done(null, user);
                        }
                        else //no user found 
                        {
                            var newUser = new User();
                            newUser.facebook.id = profile.id;
                            newUser.facebook.token = accessToken;
                            newUser.facebook.name = profile.name.givenName + " " + profile.name.familyName;
                            newUser.facebook.email = profile.emails[0].value;
                            newUser.save(function(err) {
                                if (err) throw err;
                                return done(null, newUser);
                            });
                        }
                    })
                }
                //case two: user logged in, needs to be merged
                else {
                    var user = req.user;
                    user.facebook.id = profile.id;
                    user.facebook.token = accessToken;
                    user.facebook.name = profile.name.givenName + " " + profile.name.familyName;
                    user.facebook.email = profile.emails[0].value;
                    user.save(function(err) {
                        if (err) throw err;
                        return done(null, user);
                    })

                }
            })
        }
    ));
    //api calls
    passport.use(new BearerStrategy(
        function(token, done) {
            User.findOne({
                _id: token
            }, function(err, user) {
                if (err) throw err;
                if (!user){
                    return done (null, false);
                }
                return done (null, user);
            })
        }
    ))
}