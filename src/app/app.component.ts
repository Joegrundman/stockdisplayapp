import { Component, OnInit } from '@angular/core'
import * as io from 'socket.io-client'
import {StockDataService} from './stock.service'
import { environment } from '../environments/environment';

// TODO: host main app state in this component, enabling parent-child info handling if time
// service should remain more strictly service for api calls

@Component({
    selector: 'app-root',
    template: `
    <h1>{{title}}   -  {{onlineUsers}} users online</h1>
    <h3>A stock-price history display using angular2, d3js, websockets, and the yahoo finance api</h3>
    <chart-component [selectedStock]='selectedStock'></chart-component>
    <searchbar-component (addStock)="onAddStock($event)"></searchbar-component>
    <stocktabs-component 
        [selectedStock]='selectedStock'
        (setSelectedStock)="onSetSelectedStock($event)"
        [activeStocks]='activeStocks' 
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

export class AppComponent  {

    public socket: any
    private title = 'Stock Display'
    public onlineUsers: number = 0
    public activeStocks: Array<string>
    public selectedStock: string = ''
    private colors: Array<string> =  ['steelblue', 'darkorange', 'darkred', 'red', 'darkgreen', 'goldenrod', 'darkslategrey', 'darkmagenta', 'teal']

    constructor(private stockDataService: StockDataService){}

    onAddStock(stock: string): void {
      this.activeStocks = this.activeStocks.concat([stock])
      this.socket.emit('addStock', stock)
    }

    onDeleteStock(stock: string): void {
        this.activeStocks = this.activeStocks.filter(s => s != stock)
        this.socket.emit('deleteStock', stock)
    }

    onSetSelectedStock(stock: string): void {
      console.log('App setSelectedStock')
      this.selectedStock = stock
    }

    setOnlineUsers(data: any): void {
      this.onlineUsers = data.onlineUsers
    }

    updateActiveStocks(data: any): void {
      this.activeStocks = data.activeStocks
      this.stockDataService.setActiveStocks(this.activeStocks)
    }

    ngOnInit(): void {


        this.socket = io.connect()
        this.socket.on('onlineUsers', data => this.setOnlineUsers(data))
        this.socket.on('activeStocksUpdate', data => this.updateActiveStocks(data))
      

    }
}
