var express = require("express"),
    mongo = require("mongodb").MongoClient,
    url = require("url"),
    port = process.env.PORT,
    app = express(),
    shortid = require("shortid"),
    mongoUrl = process.env.MONGOLAB_URI || "mongodb://localhost:27017/urldb";


mongo.connect(mongoUrl, function(err, db) {
    if (err) throw err;
    var collection = db.collection('urls');
    app.get("/u*", function(req, res) { // /u routes refer to database id's for urls
        var targetId = url.parse(req.url).path.substring(1);

        collection.find({
            "_id": targetId
        }).count({}, function(err, count) {
            if (err) throw err;
            //count doesn't query db, only returns # of results
            if (count > 0) {
                var dbQuery = collection.find({
                    "_id": targetId
                }).toArray(function(err, doc) {
                    if (err) throw err;

                    res.writeHead(200, {
                        "Content-type": "text/html"
                    });
                    res.end("<script>window.location.assign('" + doc[0].destination + "');</script>");
                });
            }
            else {
                badRequest(res);
            }
        });
    });

    app.use("/", express.static(__dirname + '/public'));
    app.get("/generate", function(req, res) {

        var longUrl = url.parse(req.url, true).query.url;

        if (longUrl.indexOf("://") === -1) {
            longUrl = "http://" + longUrl;
        }

        if (isUrl(longUrl)) {

            var ownUrl = req.headers.host,
                id = "u" + shortid.generate(),
                doc = {
                    _id: id,
                    destination: longUrl
                };

            //return existing route id if possible, rather making duplicate entries
            collection.find({
                "destination": longUrl
            }).count({}, function(err, count) {
                if (err) throw err;
                if (count > 0) {
                    var dbQuery = collection.find({
                        "destination": longUrl
                    }).toArray(function(err, doc) {
                        if (err) throw err;
                        var id = doc[0]["_id"];
                        console.log("count for " + longUrl + " is " + count);
                        res.writeHead(200, {
                            "Content-type": "text/HTML"
                        });
                        res.end("Shortened URL: " + ownUrl + "/" + id);
                    });
                }
                else {
                    collection.insert(doc, function(err, data) {
                        if (err) throw err;

                    })
                    res.writeHead(200, {
                        "Content-type": "text/HTML"
                    });
                    res.end("Shortened URL: " + ownUrl + "/" + id);
                }
            })
        }
        else {
            badRequest(res);
        }
    })

    process.on('SIGINT', function() {
        db.close();
        console.log("Database closed");
        process.exit(0);
    });

});

var server = app.listen(port, function(err) {
    if (err) throw err;
    else {
        console.log("Listening on port " + port);
    }
});

function isUrl(s) {
    var regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return regex.test(s);
}

function badRequest(res) {
    res.writeHead(400, {
        "Content-type": "text/HTML"
    });
    res.end("Error 400: Bad request");
}