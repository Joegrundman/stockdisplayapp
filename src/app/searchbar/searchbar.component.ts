import {Component} from '@angular/core'

import { StockDataService } from '../stock-service/stock.service'

@Component({
    selector: 'searchbar-component',
    template: `
    <div> 
    Searchbar 
    <input name="stock-code-value" value="" placeholder="stock code">
    <button (click)="onClick()">get stock data</button>
    </div>
    `
})

export class SearchbarComponent {

    constructor(private stockDataService: StockDataService) { }

    onClick () {
        var scv = document.querySelector('input[name=stock-code-value]')
        var searchTerm = scv["value"].toUpperCase()
        this.stockDataService.addActiveStock(searchTerm)
    }
}