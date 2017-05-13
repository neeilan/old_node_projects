var User = require("../models/user");
module.exports = function(router, passport) {

    router.get("/", function(req, res) {
        res.render("index.ejs");
        console.log(req.cookies);
        console.log("==========================");
        console.log(req.session);
    });

    router.get("/signup", function(req, res) {
        res.render("signup.ejs", {
            message: req.flash("signUpMessage")
        });
    })

    router.post("/signup", passport.authenticate("local-signup", {
        successRedirect: "/",
        failureRedirect: "/signup",
        failureFlash: true

    }))


    router.get("/login", function(req, res) {
        res.render("login.ejs", {
            message: req.flash("loginMessage")
        });
    })

    router.post("/login", passport.authenticate("local-login", {
        successRedirect: "/profile",
        failureRedirect: "/login",
        failureFlash: true
    }))


    router.get('/facebook', passport.authenticate('facebook', {
        scope: ["email"]
    }));

    router.get('/facebook/callback', passport.authenticate('facebook', {
            failureRedirect: '/'
        }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/profile');
        });

    router.get('/google', passport.authenticate('google', {
        scope: ["email", "profile"]
    }));

    router.get('/google/callback',
        passport.authenticate('google', {
            failureRedirect: '/'
        }),
        function(req, res) {
            // Successful authentication
            res.redirect('/profile');
        });

    router.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/");
    })

    //Connect routes
    router.get("/connect/facebook", passport.authorize("facebook", {
        scope: ["email"]
    }));

    router.get('/connect/google', passport.authenticate('google', {
        scope: ["email", "profile"]
    }));

    router.get('/connect/local', function(req, res) {
        res.render("connect-local.ejs", {
            message: req.flash("signUpMessage")
        })
    });

    router.post('/connect/local', passport.authenticate("local-signup", {
        successRedirect: "/profile",
        failureRedirect: "/connect/local",
        failureFlash: true

    }));

    //unlinking
    router.get('/unlink/facebook', function(req, res) {
        var user = req.user;
        user.facebook.token = null;
        user.save(function(err) {
            if (err) throw err;
            res.redirect("/profile");
        })
    });
    router.get('/unlink/google', function(req, res) {
        var user = req.user;
        user.google.token = null;
        user.save(function(err) {
            if (err) throw err;
            res.redirect("/profile");
        })
    });
    router.get('/unlink/local', function(req, res) {
        var user = req.user;
        user.local.username = null;
        user.local.password = null;
        user.save(function(err) {
            if (err) throw err;
            res.redirect("/profile");
        })
    });


}