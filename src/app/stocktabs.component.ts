import { Component } from '@angular/core'
import {StockDataService} from './stock.service'
// import { StockComponent } from './stock.component'

@Component({
    selector: 'stocktabs-component',
    template: `
    <div class="stockholder">
        <div class="stocktabs">
            <div class="stocktab" *ngFor="let stk of activeStocks; let i = index"
                [class.selected]="stk === selectedStock"
                (click)="onSelect(stk)"><span [style.color]="colors[i]">{{stk}}</span>   
                <div class="stockdelbtn" [class.hidden]="stk !== selectedStock"
                (click)="onDelete(stk)">Remove</div>     
            </div>
        </div>
    </div>`,
    styleUrls: ['./stocktabs.component.css']

})

export class StocktabsComponent {

    constructor(private stockDataService: StockDataService){}
    private activeStocks: Array<string> = this.stockDataService.getActiveStocks()
    private colors: Array<string> = this.stockDataService.getColors()
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