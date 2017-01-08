var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var ystocks = require('ystocks')(/* params for api key or public */);

var app = express();

app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'dist')));

var server = require('http').createServer(app);
var io = require('socket.io')(server);


var onlineUsers = 0;
var activeStocks = ['YHOO', 'MSFT', 'FB'];
var stockData = {};
var stockNames = {};
var completedPromises = 0;
var dates;
var monthsToSearch = 12

var errorMessage = "No results!"



function getDates(months) {
    var now = new Date();
    var endYear = now.getFullYear();
    var endMonth = now.getMonth() + 1;
    var date = now.getDate();
    var startMonth = endMonth - months;
    var startYear = endYear;
    if (startMonth < 1) {
        startMonth += 12;
        startYear -= 1;
    }

    var startDate = startYear + '-' + startMonth + '-' + date;
    var endDate = endYear + '-' + endMonth + '-' + date;

    return [startDate, endDate];
}

dates = getDates(monthsToSearch);

function getActiveStockData(socketEmitCallback) {

    activeStocks.forEach(symbol => {

        if (stockData[symbol] && stockData[symbol] != errorMessage) {
            completedPromises ++
            return
        }

        var params = {
            symbol: symbol,
            start: dates[0],
            end: dates[1]
        };

        ystocks.history(params, function (err, data, meta) {
            if (err) {
            } else if (data) {
                var useData = data.map(d => {
                    return {
                        Symbol: d.Symbol,
                        Close: d.Close,
                        Date: d.Date
                    }
                })
                stockData[symbol] = useData;

                if (socketEmitCallback) { 
                    socketEmitCallback() 
                }
                completedPromises++;
            } else {
                console.log('Not found', symbol)
                stockData[symbol] = { msg: errorMessage };
                stockDesc[symbol] = "Not Found"
                if (socketEmitCallback) { 
                    socketEmitCallback() 
                }
                completedPromises++;
            }
        })
    })
}

function getStockNames (emitNamesCallback) {
    var searchSymbols = []
    activeStocks.forEach(symbol => {
        if (stockNames[symbol] || (stockData[symbol] && stockData[symbol] == errorMessage)) {
            return
        } else {
            searchSymbols.push(symbol)
        }
    })
    console.log('searching names for searchSymbols', searchSymbols)
    ystocks.quote(searchSymbols, function(err, data, meta) {
        if(err) {
            console.log(err)
        } else {
            data.forEach(d => {
                stockNames[d.Symbol] = d.Name
            })
        }
        if(emitNamesCallback) {
            console.log('sending some data', JSON.stringify(stockNames))
            emitNamesCallback()
        }
    })
}

getActiveStockData();


io.on('connection', function (socket) {
    onlineUsers++;

    io.emit('onlineUsers', { onlineUsers: onlineUsers });
    io.emit('activeStocksUpdate', { activeStocks: activeStocks });

    if (completedPromises == activeStocks.length) {
        console.log('sending Data')
        io.emit('stockData', { stockData: stockData });
        completedPromises = 0;

        getStockNames(() => {
            io.emit('stockNames', {stockNames: stockNames})
        })
    }

    socket.on('disconnect', function () {
        onlineUsers--;
        io.emit('onlineUsers', { onlineUsers: onlineUsers });

    });

    socket.on('activeStockUpdate', function () {
        io.emit('activeStocksUpdate', { activeStocks: activeStocks });
    });

    socket.on('deleteStock', function (toDelete) {
        activeStocks = activeStocks.filter(stock => stock != toDelete)
        delete stockData[toDelete]

        if(stockNames[toDelete]) {
            delete stockNames[toDelete]
        }
        io.emit('activeStocksUpdate', { activeStocks: activeStocks });
        io.emit('stockData', { stockData: stockData})
    })

    socket.on('addStock', function (toAdd) {
        var socketEmitDataCallback = () =>  {
            io.emit('stockData', { stockData: stockData });
            getStockNames(() => {
                io.emit('stockNames', {stockNames: stockNames})
            })          
        };
        console.log('addstock', toAdd);
        activeStocks = activeStocks.concat([toAdd]);
        io.emit('activeStocksUpdate', { activeStocks: activeStocks });
        getActiveStockData(socketEmitDataCallback);
    })

    socket.on('getStocks', function() {
        console.log('getStocks received')
        io.emit('activeStocksUpdate', { activeStocks: activeStocks })
        io.emit('stockData', { stockData: stockData })
        io.emit('stockNames', {stockNames: stockNames})
    })
});

server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'))
})