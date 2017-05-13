var FacebookStrategy = require("passport-facebook").Strategy,
    User = require("../app/models/user"),
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

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            profileFields: ['id', 'name']
        },
        function(accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                User.findOne({
                    'facebookId': profile.id
                }, function(err, user) {
                    if (err)
                        return done(err);
                    if (user)
                        return done(null, user);
                    else {
                        var newUser = new User();
                        newUser.facebookId = profile.id;
                        newUser.token = accessToken;
                        newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                        newUser.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        })
                    }
                });
            });
        }
    ));
}