import { Component, OnInit } from '@angular/core'
import * as io from 'socket.io-client'
import *  as d3 from 'd3'

// TODO: host main app state in this component

@Component({
    selector: 'app-root',
    template: `
    <h1>{{title}}   -  {{onlineUsers}} users online</h1>
    <h3>A stock-price history display using angular2, d3js, websockets, and the yahoo finance api</h3>
    <chart-component 
        [colors]='colors'
        [activeStocks]='activeStocks'
        [separatedStockData]='separatedStockData'
        (getStockDataFromApi)="getStockDataFromApi($event)"
        [selectedStock]='selectedStock'></chart-component>
    <searchbar-component 
        (addStock)="onAddStock($event)"></searchbar-component>
    <stocktabs-component 
        [colors]='colors'
        [hasError]='hasError'
        [selectedStock]='selectedStock'
        (setSelectedStock)="onSetSelectedStock($event)"
        [activeStocks]='activeStocks' 
        [stockNames]='stockNames'
        (deleteStock)="onDeleteStock($event)"></stocktabs-component>
    `,
    styles: [`
    h1 {
      color: steelblue;
      margin-top: 0.5em; 
      font-family: Arial, Helvetica, sans-serif;
      text-align: center;
      font-size: 150%;
    }

    h2, h3 {
      color: #666;
      font-family: Arial, Helvetica, sans-serif;
      font-weight: lighter;
      text-align: center;
    }
`]
})

export class AppComponent implements OnInit {
    public colors: Array<string> =  ['steelblue', 'darkorange', 'darkred', 'red', 'darkgreen', 'goldenrod', 'darkslategrey', 'darkmagenta', 'teal']
    public hasError: Array<string> = []
    public socket: any
    private title: string = 'Stock Display'
    public onlineUsers: number = 0
    public separatedStockData: Array<Object> = []
    public stockData: Object
    public stockNames: Object = {}
    public activeStocks: Array<string> 
    public selectedStock: string = ''

    getStockDataFromApi(): void {
      this.socket.emit('getStocks')
    }

    onAddStock(stock: string): void {
      if (this.activeStocks.indexOf(stock) > -1) { return }
      this.activeStocks = this.activeStocks.concat([stock])
      this.socket.emit('addStock', stock)
    }

    onDeleteStock(stock: string): void {
        this.activeStocks = this.activeStocks.filter(s => s != stock)
        this.selectedStock = ''
        this.socket.emit('deleteStock', stock)
    }

    onSetSelectedStock(stock: string): void {
      this.selectedStock = stock
    }

    setStockData(data: any): void {
      console.log('receiving update')
      this.stockData = data.stockData
      let parseTime = d3.timeParse("%Y-%m-%d")
      this.separatedStockData = []
      var tempData:Array<any> = []
      this.activeStocks.forEach(stock => {
          if(this.stockData[stock].hasOwnProperty('msg') ){
            console.log('this stock was not found', stock)
            this.hasError = [...this.hasError, stock]
          } else {
            tempData.push(this.stockData[stock]
            .map(d => {
              d.Date = parseTime(d.Date)
              return d
            }))

          }
      })
      this.separatedStockData = tempData
    }

    setStockNames(data: any) :void {
      this.stockNames = data.stockNames
    }

    setOnlineUsers(data: any): void {
      this.onlineUsers = data.onlineUsers
    }

    updateActiveStocks(data: any): void {
      this.activeStocks = data.activeStocks
    }

    ngOnInit(): void {

        this.socket = io.connect()
        this.socket.on('onlineUsers', data => this.setOnlineUsers(data))
        this.socket.on('activeStocksUpdate', data => this.updateActiveStocks(data))
        this.socket.on('stockData', data => this.setStockData(data))
        this.socket.on('stockNames', data => this.setStockNames(data))

    }
}
