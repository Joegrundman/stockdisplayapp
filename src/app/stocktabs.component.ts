import { Component, Input, Output, EventEmitter } from '@angular/core'
import {StockDataService} from './stock.service'

@Component({
    selector: 'stocktabs-component',
    template: `
    <div class="stockholder">
        <div class="stocktabs">
            <div class="stocktab" *ngFor="let stk of activeStocks; let i = index"
                [class.selected]="stk === selectedStock"
                (click)="onSelect(stk)"><span [style.color]="colors[i]">{{stk}}</span>   
                <div class="stockdelbtn"  (click)="onDelete(stk)">x</div>     
            </div>
        </div>
    </div>`,
    styleUrls: ['./stocktabs.component.css']

})

export class StocktabsComponent {

    constructor(private stockDataService: StockDataService){}
    @Input() selectedStock: string
    @Input() activeStocks: Array<string>
    @Output() deleteStock: EventEmitter<string> = new EventEmitter<string>()
    @Output() setSelectedStock: EventEmitter<string> = new EventEmitter<string>()
    // private activeStocks: Array<string> = this.stockDataService.getActiveStocks()
    private colors: Array<string> = this.stockDataService.getColors()
    // private selectedStock: string

    onSelect(stock: string): void {
        // this.selectedStock = st
        // this.stockDataService.setSelectedStock(st)
        console.log('tabs onselect', stock)
        this.setSelectedStock.emit(stock)
    }
    

    onDelete(st: string): void {
        if(this.selectedStock == st) {
            this.selectedStock = null
        }
        this.deleteStock.emit(st)
        
    }
 }