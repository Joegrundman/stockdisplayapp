import { Component } from '@angular/core'
import {StockDataService} from '..//stock-service/stock.service'
// import { StockComponent } from '../stock/stock.component'

@Component({
    selector: 'stocks-component',
    template: `
    <div class="stockholder">
        <div class="stocktabs">
            <div class="stocktab" *ngFor="let st of activeStocks"
                [class.selected]="st === selectedStock"
                (click)="onSelect(st)"><span>{{st}}</span>   
                <div class="stockdelbtn" [class.hidden]="st !== selectedStock"
                (click)="onDelete(st)">Remove</div>     
            </div>
        </div>
    </div>`,
    styleUrls: ['./stocks.component.css']

})

export class StocksComponent {
    constructor( private stockDataService: StockDataService){}
    private activeStocks: Array<string> = this.stockDataService.getActiveStocks()
    private selectedStock: string

    onSelect(st: string): void {
        this.selectedStock = st
        this.stockDataService.setSelectedStock(st)
    }

    onDelete(st: string): void {
        console.log('deleting', st)
        this.stockDataService.deleteActiveStock(st)
        this.selectedStock = null
        this.activeStocks = this.stockDataService.getActiveStocks()
    }
 }