var User = require("../models/user");
module.exports = function(router, passport) {

    router.get("/", function(req, res) {
        res.render("home.ejs");
    });

    router.get('/facebook', passport.authenticate('facebook', {
        scope: []
    }));

    router.get('/facebook/callback', passport.authenticate('facebook', {
            failureRedirect: '/auth/login'
        }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    })
}