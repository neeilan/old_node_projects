module.exports = function(router, passpor, User, Poll, shortid) {
    //home route
    router.get("/", function(req, res) {
        var fields = {
            "id": 1,
            "title": 1
        };

        Poll.find({}, fields, function(err, polls) {
            if (err) throw err;
            var pollList = {
                list: []
            };
            pollList["list"] = polls;
            if (req.user) {
                res.render("./secured/homeSecured.ejs", pollList);
            }
            else {
                res.render("home.ejs", pollList);
            }
        })
    })

    //view poll route
    router.get("/poll/:id", function(req, res) {
        Poll.findOne({
            "id": req.params.id
        }, function(err, foundPoll) {
            if (err) throw err;
            if (req.user) {
                res.render("./secured/viewPollSecured.ejs", foundPoll);
            }
            else {
                res.render("viewPoll.ejs", foundPoll);
            }
        });
    })

    //vote route
    router.get("/vote/:id*", function(req, res) {
        if (req.user) {
            if (req.query.customOption) {
                Poll.update({
                    "id": req.params.id
                }, {
                    $push: {
                        "data": {
                            "value": 1,
                            "label": req.query.customOption
                        }
                    }
                }, {
                    safe: true,
                    upsert: true
                }, function(err) {
                    if (err) throw err;
                    Poll.findOne({
                        "id": req.params.id
                    }, function(err, poll) {
                        if (err) throw err;
                        res.send(poll.data)
                    });
                });
            }
            else {
                Poll.update({
                    "id": req.params.id,
                    'data.label': req.query.option
                }, {
                    '$inc': {
                        'data.$.value': 1
                    }
                }, function(err) {
                    if (err) throw err;
                    Poll.findOne({
                        "id": req.params.id
                    }, function(err, poll) {
                        if (err) throw err;
                        res.send(poll.data)
                    });
                });
            }
        }
        else {
            if (req.query.customOption) {
                req.send("You need to be authenticated in order to vote with a custom option");
            }
            else {
                Poll.update({
                    "id": req.params.id,
                    'data.label': req.query.option
                }, {
                    '$inc': {
                        'data.$.value': 1
                    }
                }, function(err) {
                    if (err) throw err;
                    Poll.findOne({
                        "id": req.params.id
                    }, function(err, poll) {
                        if (err) throw err;
                        res.send(poll.data)
                    });
                });
            }
        }
    })

    router.get("/login", function(req, res) {
        if (req.user) {
            res.redirect("/");
        }
        else {
            res.render("login.ejs");
        }
    })

    //create poll route
    router.get("/create", function(req, res) {
        if (req.user) {
            res.render("./secured/createPollSecured.ejs");
        }
        else {
            res.redirect("/login"); //should actually go to login page
        }

    })

    router.get("/create/submit", function(req, res) {
        if (req.user) {
            if (req.query.title) {
                var newPoll = new Poll();
                newPoll.id = shortid.generate();
                newPoll.title = req.query.title;
                newPoll.createdBy = req.user.facebookId; //who created poll in Poll model


                for (var field in req.query) {
                    if (req.query[field] != "" && field !== "title") {
                        newPoll.data.push({
                            "value": 1,
                            "label": req.query[field],
                        });
                    }
                }
                newPoll.save(function(err) {
                    if (err) throw err
                        //add poll ID to user's pollsCreated array
                    User.update({
                        "facebookId": req.user.facebookId
                    }, {
                        $push: {
                            pollsCreated: {
                                $each: [newPoll.id]
                            }
                        }
                    }, {
                        upsert: true
                    }, function(err) {
                        if (err) throw (err);
                        res.redirect("/poll/" + newPoll.id);
                    });

                })
            }
            else {
                res.redirect("/create");
            }
        }
        else {
            res.redirect("/login");
        }
    })

    //View and delete polls
    router.get("/manage", function(req, res) {
        if (req.user) {
            Poll.find({
                "createdBy": req.user.facebookId
            }, function(err, polls) {
                if (err) throw err;
                var userPolls = {};
                userPolls.list = polls;
                res.render("./secured/manageSecured.ejs", userPolls)
            })
        }
        else {
            res.redirect("/login");
        }
    })

    //delete a poll route
    router.get("/delete/:id*", function(req, res) {
        if (!req.user) {
            res.redirect("/login");
        }
        else {
            Poll.findOne({
                "id": req.params.id
            }, function(err, poll) {
                if (err) throw err;
                if (req.user.facebookId == poll.createdBy) {
                    poll.remove();
                    res.redirect("/manage");
                }
                else {
                    res.send("You can only delete polls which you have created");
                }
            })
        }
    })
}