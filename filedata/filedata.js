var express = require ("express");
var port =process.env.PORT || 8080; //8080 for local on C9
var app = express();
var multer = require("multer");
var upload = multer({ dest: 'uploads/' });

app.use("/", express.static(__dirname + '/public'));
app.post("/",  upload.single('file'), function(req,res){

if (!req.file){
    res.writeHead(400, {"Content-type": "text/html"});
    res.end("Error 400: Bad Request");

}
else{
    var responseString = "TYPE: "+ req.file.mimetype+"\n"+
      "SIZE: "+ req.file.size+" bytes";
      //console.log(responseString);
     res.writeHead(200, {"Content-type": "text/html"});
     res.end("<script>alert("+JSON.stringify(responseString)+");window.location.assign('/');</script>");
}
  
})

var server = app.listen(port, function (err){
    if (err) throw err;
    else{
       console.log("Listening on port "+port);
    }
});

