module.exports = function (app, yelp, User, Bar){
    app.get("/search", function (req,res){
        yelp.search({
            term: 'bars',
            location: req.query.location
        })
        .then(function(data) {
            var ids = [],
            checkInCount = {};
            for (var i in data.businesses){
                ids.push(data.businesses[i].id)
            }
             Bar.find({ id: { $in: ids}}).then(function (bars) {
                 for (var b in bars)
                     checkInCount[bars[b].id]= bars[b].checkIns;
                data.checkInCount = checkInCount;
                if (req.user)
                data.user = req.user;
                else
                data.user= false;
                res.cookie('lastSearch', req.query.location, { expires: new Date(Date.now() + 600000)});
                res.render("searchResults.ejs",data);
            })
        })
        .catch(function(err) {
            console.log(err);
            res.send(JSON.parse(err.data).error.text+"<br><a href='/'>Go Home</a>");
        });
    })
    
    app.get("/checkin/:id", function(req,res){
        if (!req.user){
            res.render("login.ejs");
            return false;
        }
          User.update({facebookId: req.user.facebookId}, {$push: {checkIns: {$each: [req.params.id]}}}, {upsert:true}, function(err){
            if(err) throw err;
            Bar.count({id: req.params.id}).then(function(c){
                if (c>0){
                Bar.update({id: req.params.id}, {$inc:{checkIns: 1}}, function (err){
                    if (err) throw err;
                    res.redirect(req.header('Referer') || '/');
                })  
            }
            else{
                var newBar = new Bar();
                newBar.id = req.params.id;
                newBar.checkIns = 1;
                newBar.save().then(function(){
                   res.redirect(req.header('Referer') || '/'); 
                })
            }
            })        
        })
    })
    
    app.get("/checkout/:id", function (req,res){
           if (!req.user){
            res.render("login.ejs");
            return false;
            }
            User.update( {facebookId: req.user.facebookId}, { $pullAll: {checkIns: [req.params.id] } }, function (err){ 
                if(err) throw err;
                Bar.update({id: req.params.id}, {$inc :{checkIns: -1}}, function (err){
              if (err) throw err;
              res.redirect(req.header('Referer') || '/');
            })
            })
    })
    
    app.get("/*", function (req, res){
        res.render("index.ejs", {user:req.user})
    })
}