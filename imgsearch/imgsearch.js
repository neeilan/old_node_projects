var express = require("express"),
    fs = require("fs"),
    url = require("url"),
    XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
    port = process.env.PORT,
    app = express(),
    mongo = require("mongodb").MongoClient,
    mongoUrl = process.env.MONGOLAB_URI || "mongodb://localhost:27017/recent";

app.use("/", express.static(__dirname + '/public'));


app.get("/recent", function(req, res) { //to see recent queries

    mongo.connect(mongoUrl, function(err, db) {
        if (err) throw err;
        var collection = db.collection('recent');
        var dbQuery = collection.find({
            "title": "Recent queries"
        }).forEach(function(recent) {
            if (err) throw err;
            res.writeHead(200, {
                "Content-type": "Application/JSON"
            });
            res.end("Last 5 searches : " + JSON.stringify(recent["list"]));
            db.close();
        });
    });
})

app.get("/search", function(req, res) {
    var query = url.parse(req.url, true).query,
        term = query.term,
        offset = query.offset;


    if (offset > 1) {
        offset = ((offset - 1) * 10) + 1;
    }
    else {
        offset = 1;
    }


    if (!query) {
        res.writeHead(400, {
            "Content-type": "text/html"
        });
        res.end("Bad request: No search term");
    }
    else {
        fs.readFile("./apikey.txt", function(err, data) {
            if (err) throw err;
            get(data.toString());
        });
    }

    //add recent queries to mongo db
    mongo.connect(mongoUrl, function(err, db) {
        if (err) throw err;

        var collection = db.collection('recent');

        collection.updateOne({
            "title": "Recent queries"
        }, { $push: { "list": {term, $slice: -5}}}, {upsert: true}, function(err, data) {
            if (err) throw err;
            db.close();
        })
    })

    function get(key) {
        var uri = "https://www.googleapis.com/customsearch/v1?key=" + key + "&cx=007856818314757495813:ew-wdb9_6rc&q=" + term + "&searchType=image&start=" + offset + "&imgSize=medium&alt=json";
        var xhr = new XMLHttpRequest();
        xhr.open("GET", uri);
        xhr.onload = function() {
            if (xhr.status == 200) {
                var results = tidy(JSON.parse(xhr.responseText));
                writeResponse(results);
            }
            else {
                console.error(Error(xhr.statusText));
            }
        };
        xhr.onerror = function() {
            console.log("Network error");
        };
        xhr.send();
    }

    function writeResponse(results) {
        var response = {
            "results": results
        };
        res.writeHead(200, {
            "Content-Type": "Application/JSON"
        });
        res.end(JSON.stringify(response));

    }

})

function tidy(arr) {
    var dataSet = [];
    arr.items.forEach(function(data) {
        var response = {};
        response.url = data.link;
        response.alt = data.snippet;
        response.pageUrl = data.image.contextLink;
        dataSet.push(response);
    })
    return dataSet;
}


var server = app.listen(port, function(err) {
    if (err) throw err;
    else {
        console.log("Listening on port " + port);
    }
})
