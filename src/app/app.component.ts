import { Component, OnInit } from '@angular/core'

import * as io from 'socket.io-client'
// import {StockDetail} from './stock-detail'
import {StockDataService} from './stock.service'
import { environment } from '../environments/environment';

// TODO: host main app state in this component, enabling parent-child info handling if time
// service will remain more strictly service for api calls

@Component({
    selector: 'app-root',
    template: `
    <h1>{{title}}  {{onlineUsers}} users online</h1>
    <h3>A stock-price history display using angular2, d3js and the yahoo finance api</h3>
    <chart-component></chart-component>
    <searchbar-component></searchbar-component>
    <stocktabs-component></stocktabs-component>
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
    public onlineUsers: number 
    public appActiveStocks: Array<string>
    private selectedStock: string = ''
    private colors: Array<string> =  ['steelblue', 'darkorange', 'darkred', 'red', 'darkgreen', 'goldenrod', 'darkslategrey', 'darkmagenta', 'teal']
    // public stockData: Array<StockDetail>
    
    constructor(private stockDataService: StockDataService){}

    addActiveStock(stock: string): void {
        this.appActiveStocks = this.appActiveStocks.concat(stock)
        this.socket.emit('activeStockUpdate', JSON.stringify(this.appActiveStocks))
    }

    deleteActiveStock(stock: string): void {
        this.appActiveStocks = this.appActiveStocks.filter(s => s != stock)
        this.socket.emit('activeStockUpdate', JSON.stringify(this.appActiveStocks))

    }

    getSelectedStock(): string {
      return this.selectedStock
    }

    setSelectedStock(stock: string): void {
      this.selectedStock = stock
    }

    setOnlineUsers(data: any): void {
      this.onlineUsers = data.onlineUsers
    }

    updateActiveStocks(data: any): void {
      this.appActiveStocks = JSON.parse(data.activeStocks)
      console.log('appActiveStocks', this.appActiveStocks)
    }

    ngOnInit(): void {

      if(environment.production){
        this.socket = io.connect()
        this.socket.on('onlineUsers', data => this.setOnlineUsers(data))
        this.socket.on('activeStockUpdate', data => this.updateActiveStocks(data))
      }

    }
}
