var express = require("express"),
app = express(),
port = process.env.PORT,
http = require("http").Server(app),
dbURL = process.env.MONGODB_URI || "mongodb://localhost:27017/data",
mongoose = require("mongoose"),
Stock = require("./models.js"),
io = require("socket.io")(http),
request = require("request"),
key = require("./config/apikey.js").key;

mongoose.connect(dbURL);
app.use(express.static('public'));

io.on("connection", function(socket) {
    console.log("A user connected");
    Stock.find({})
    .then(function(stocks) {
        var chartData = constructChartJsData(stocks);
            socket.emit("data", chartData); //send current data
        });

    socket.on("addStock", function(symbol) {
        symbol = symbol.toUpperCase();
        var symbolQuery = {
            "symbol": symbol
        };
        Stock.count(symbolQuery).then(function(count) {
            if (count > 0)
                socket.emit("invalid");
            else
                fetchData(symbol, 30);
        })
    })

    socket.on("removeStock", function(symbol) {
        symbol = symbol.toUpperCase();
        Stock.remove({
            "symbol": symbol
        }).then(function() {
            Stock.find({})
            .then(function(stocks) {
                var chartData = constructChartJsData(stocks);
                io.emit("data", chartData);
            });
        })
    })

    function fetchData(symbol, days) {
        var url = "https://www.quandl.com/api/v3/datasets/WIKI/" + symbol + ".json?api_key=" + key + "&limit=" + days + "&column_index=4";
        request(url, function(error, response, rawData) {
            if (!error && response.statusCode == 200) {
                rawData = JSON.parse(rawData);
                var pricesAndDates = createDataset(rawData.dataset);
                var newStock = new Stock();
                newStock.symbol = symbol;
                newStock.data = pricesAndDates;

                Stock.count({}).then(function(c) {
                    if (c > 0) 
                        io.emit("dataset", newStock.data.dataset);
                    else {
                        Stock.find({})
                        .then(function(stocks) {
                            var chartData = constructChartJsData(stocks);
                            io.emit("data", chartData);
                        });
                    }
                })
                newStock.save(function(err) {
                    if (err) throw err;
                });
            }
            else if (response.statusCode == 404)
                socket.emit("invalid");
        })
}
})

function constructChartJsData(stocksArray) {
    var data = {
        datasets: []
    };
    if (stocksArray[0]) //all stock data is from past 30 days
        data.labels = stocksArray[0].data.dates;
    for (var i = 0; i < stocksArray.length; i++)
        data.datasets.push(stocksArray[i].data.dataset);
    return data;
}

function createDataset(dataSet) {
    var symbol = dataSet.dataset_code,
    rawData = dataSet.data,
    dataset = {
        label: symbol,
        data: []
    },
    dates = [];
    rawData.reverse().forEach(function(element) {
        dates.push(element[0]);
        dataset.data.push(element[1]);
    });
    return {
        'dataset': dataset,
        'dates': dates
    };
}

http.listen(port, function(err) {
    if (err) throw err;
    console.log("Listening on " + port);
})
