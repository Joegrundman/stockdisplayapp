var express = require('express')
var path = require('path')
var logger = require('morgan')
var bodyParser = require('body-parser')

var app = express()

app.set('port', process.env.PORT || 3000)
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'dist')))

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var onlineUsers = 0;

var activeStocks = ['YHOO', 'MSFT', 'FB']

io.on('connection', function(socket){
    onlineUsers++;

    io.emit('onlineUsers', { onlineUsers: onlineUsers });
    io.emit('activeStocksUpdate', { activeStocks: activeStocks });

    socket.on('disconnect', function() {
        onlineUsers--;
        io.emit('onlineUsers', { onlineUsers: onlineUsers });

    });

    socket.on('activeStockUpdate', function () {
        io.emit('activeStocksUpdate', { activeStocks: activeStocks });
    });

    socket.on('deleteStock', function(toDelete) {
        activeStocks = activeStocks.filter(stock => stock != toDelete)
        io.emit('activeStocksUpdate', { activeStocks: activeStocks });
    })

    socket.on('addStock', function(toAdd) {
        activeStocks = activeStocks.concat([toAdd])
        io.emit('activeStocksUpdate', { activeStocks: activeStocks });        
    })
});

server.listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'))
})