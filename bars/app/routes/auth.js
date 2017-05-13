var User = require("../models/user");
module.exports = function(router, passport) {

    router.get('/facebook', passport.authenticate('facebook', {
        scope: []
    }));

    router.get('/facebook/callback', passport.authenticate('facebook', {
            failureRedirect: '/auth/login'
        }),
        function(req, res) {
            // Successful authentication, redirect home.
            var lastSearch = req.cookies.lastSearch;
            res.clearCookie('lastSearch');
            res.redirect("/search?location="+lastSearch || '/');
            
        });

    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    })
    
    
    router.get("/*", function(req, res) {
        res.render("index.ejs");
    });

}