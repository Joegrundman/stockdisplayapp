import {Component} from '@angular/core'

import { StockDataService } from './stock.service'

@Component({
    selector: 'searchbar-component',
    template: `
    <div class="searchbar"> 
    Enter the stock symbol here (e.g. GOOG, FB, GE, TSCO.L):  
    <input class="searchbar-input" name="stock-code-value" value="" placeholder="stock symbol">
    <button class="searchbar-button" (click)="onClick()">Search!</button>
    </div>
    `,
    styleUrls: [ './searchbar.component.css' ]
})

export class SearchbarComponent {

    constructor(private stockDataService: StockDataService) { }

    onClick () {
        var scv = document.querySelector('input[name=stock-code-value]')
        var searchTerm = scv["value"].toUpperCase()
        if(!searchTerm || searchTerm.trim() === ''){ scv["value"] = '';  return }
        this.stockDataService.addActiveStock(searchTerm)
        scv["value"] = ''
    }
}