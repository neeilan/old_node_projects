 $(document).ready(function() {
  var socket = io();

  //add a stock
  $("#add").click(function() {
   socket.emit("addStock", $("#symbol").val());
   $("#m").val('');
   return false;
  })

  var chartData = {
   datasets: []
  };

  socket.on("dataset", function(dataset) {
   if (!chartData.labels) {
    chartData.labels = [];
   }
   //generate colors
   var r = random255(),
    g = random255(),
    b = random255();
   dataset.fillColor = "rgba(" + r + "," + g + "," + b + ",0.0)";
   dataset.pointColor = "rgba(" + r + "," + g + "," + b + ",0.5)";
   chartData.datasets.push(dataset);
   $("#canvasContainer").html('<canvas id="chart" width="1000" height="500"></canvas>');
   var ctx = document.getElementById("chart").getContext("2d");
   var newChart = new Chart(ctx).Line(chartData);
   //add button
   var symbol = dataset.label;
   $("#stocksList").append("<span class='stock'>" + symbol + "<button type='button' class='remove' id='" + symbol + "'>Remove</button></span>\t");


   $(".remove").click(function() {
    removeStock(this.id);
   })

  })

  socket.on("invalid", function() {
   alert("This symbol is invalid, or is already present on the graph.");
  })

  socket.on("data", function(data) {
   //initial data
   console.log(data);

   document.getElementById("stocksList").innerHTML = "Stocks list<hr/><br>";
   //set color
   for (var i = 0; i < data.datasets.length; i++) {
    var symbol = data.datasets[i].label;
    document.getElementById("stocksList").innerHTML += ("<span class='stock'>" + symbol + "<button class='remove' id='" + symbol + "'>Remove</button></span>\t");

    $(".remove").click(function() {
     removeStock(this.id);
    })

    var r = random255(),
     g = random255(),
     b = random255();

    data.datasets[i].fillColor = "rgba(" + r + "," + g + "," + b + ",0.05)";
    data.datasets[i].strokeColor = "rgba(" + r + "," + g + "," + b + ",1)";
    data.datasets[i].pointColor = "rgba(" + r + "," + g + "," + b + ",0.5)"

   }
   chartData = data;
   $("#canvasContainer").html('<canvas id="chart" width="1000" height="500"></canvas>');
   var ctx = document.getElementById("chart").getContext("2d");
   var newChart = new Chart(ctx).Line(chartData);
   console.log("initial data");
   console.log(chartData);
  })

  function random255() {
   return Math.floor(Math.random() * 255);
  }

  function removeStock(symbol) {
   socket.emit("removeStock", symbol);
  }


 })