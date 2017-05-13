var express = require ("express");
var url = require("url");
var path = require("path");
var port =process.env.PORT; //8080 for local on C9
var app = express();

app.use(express.static(__dirname + '/public'));


app.get("/api", function(req,res){
    var parsedUrl = url.parse(req.url, true); 
    var queryDate = parsedUrl.query.date;

    if (queryDate){
        var date = false;
        if (!isNaN(queryDate)){
            queryDate=Number(queryDate)*1000; //UNIX time is in seconds, while Js in ms
            var date = new Date(queryDate);
        }
        else{
            queryDate = Date.parse(queryDate);
            if(!isNaN(queryDate)){
                var date = new Date(queryDate);
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' }); 
        res.end(JSON.stringify(summary(date))); 
    }
    else{
         res.writeHead(400, { 'Content-Type': 'application/json' }); 
        res.end("Error 400: Bad Request"); 
    }
})

var server = app.listen(port, function (err){
    if (err) throw err;
    else{
       console.log("Listening on port "+port);
    }
});


function summary (date) {  
    if(!date){
        return {unixtime: null, natural: null};
    }
     var month = ["January","February","March","April","May","June","July","August","September", "October","November","December"];
     var dateString=month[date.getMonth()]+" "+(date.getDate())+", "+date.getFullYear();
     return { unixtime : date.getTime()/1000, natural : dateString };
}