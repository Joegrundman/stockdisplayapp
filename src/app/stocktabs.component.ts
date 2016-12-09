import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
    selector: 'stocktabs-component',
    template: `
    <div class="stockholder">
        <div class="stocktabs">
            <div class="stocktab" *ngFor="let stk of activeStocks; let i = index"
                [class.selected]="stk === selectedStock"
                (click)="onSelect(stk)"><span [style.color]="colors[i]">{{stk}}</span>   
                <div class="stockdelbtn"  (click)="onDelete(stk)">x</div> 
                <div class="error"
                *ngIf="stk === errorTarget">Resource Not Found!</div>    
            </div>
        </div>
    </div>`,
    styles: [`
        .stockholder {
            width: 100%;
            margin-top: 0.5em;
            border-radius: 5px;
        }
        .stocktabs {
            display: flex;
            flex-direction: row;
            list-style-type: none;
        }
        .selected {
            background-color: #dcdde9 !important;
            color: white;
        }
        .stocktab {
            cursor: pointer;
            position: relative;
            left: 0;
            background-color: #fafafa;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #666;
            margin: .5em;
            width: 14em;
            padding: .3em;
            height: 3em;
            box-shadow: 2px 2px 6px rgba(0,0,0,0.2);
        }
        .stocktab:hover {
            box-shadow: 1px 1px 4px rgba(0,0,0,0.2);
            background-color: #f6f6f6;
        }
        .stockdelbtn {
            position: absolute;
            right: 6px;
            top: 2px;
            font-size: 20px;
            color: #ccc;
        }
        .stockdelbtn:hover {
            color: #999;
        }
        .error {
            color: #666;
            font-size: 16px;
            text-align: center;         
        }
    `]

})

export class StocktabsComponent {

    @Input() colors: Array<string>
    @Input() errorTarget: string
    @Input() selectedStock: string
    @Input() activeStocks: Array<string>
    @Output() deleteStock: EventEmitter<string> = new EventEmitter<string>()
    @Output() setSelectedStock: EventEmitter<string> = new EventEmitter<string>()

    onSelect(stock: string): void {
        this.setSelectedStock.emit(stock)
    }    

    onDelete(st: string): void {
        if(this.selectedStock == st) {
            this.selectedStock = null
        }
        this.deleteStock.emit(st)       
    }
 }