import {Component} from '@angular/core'

import { StockDataService } from '../stock-service/stock.service'

@Component({
    selector: 'searchbar-component',
    template: `
    <div class="searchbar"> 
    Enter the stock symbol here:  
    <input class="searchbar-input" name="stock-code-value" value="" placeholder="stock code">
    <button class="searchbar-button" (click)="onClick()">get stock data</button>
    </div>
    `,
    styleUrls: [ './searchbar.component.css' ]
})

export class SearchbarComponent {

    constructor(private stockDataService: StockDataService) { }

    onClick () {
        var scv = document.querySelector('input[name=stock-code-value]')
        var searchTerm = scv["value"].toUpperCase()
        this.stockDataService.addActiveStock(searchTerm)
    }
}