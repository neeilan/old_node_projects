var express = require ("express");
var port =process.env.PORT || 8080; //8080 for local on C9
var app = express();

app.use("/", express.static(__dirname + '/public'));


app.get("/detect", function(req,res){
  
    function Details(){
        var os = req.headers["user-agent"];
        var lang = req.headers["accept-language"];
        this.IP_ADDRESS=req.headers['x-forwarded-for'];
        this.OS=os.substring(os.indexOf("(")+1,os.indexOf(")"));
        this.LANGUAGE=lang.substring(0,lang.indexOf(","));
    }
    
    var reqDetails = new Details();
    res.writeHead(200,{"Content-type":"Application/JSON"});
    res.end(JSON.stringify(reqDetails));
   // console.log(JSON.stringify(reqDetails));
  
})

var server = app.listen(port, function (err){
    if (err) throw err;
    else{
       console.log("Listening on port "+port);
    }
});

