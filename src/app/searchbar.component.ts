import {Component, Output, EventEmitter} from '@angular/core'

@Component({
    selector: 'searchbar-component',
    template: `
    <div class="searchbar"> 
    Enter the stock symbol here (e.g. GOOG, FB, GE, TSCO.L, AAPL):  
    <input class="searchbar-input" name="stock-code-value" value="" placeholder="stock symbol">
    <button class="searchbar-button" (click)="onClick()">Add Symbol</button>
    </div>
    `,
    styles: [ `
    .searchbar {
        margin: 1em;
        color: #666;
    }

    .searchbar-input {
        border: none;
        width: 12em;
        height: 2em;
        background-color: #fafafa;
        box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
        border-bottom: 2px solid #666;
        font-size: 1em;
        text-transform: uppercase;
        margin-left: 1em;
        padding-left: 1em;
    }

    .searchbar-input:focus {
        outline: none;
        border: none;
        box-shadow: inset 1px 1px 4px rgba(0, 0, 0, 0.2), 1px 1px 4px rgba(0, 0, 0, 0.2);
        border-bottom: 2px solid #8888fa;
    }

    .searchbar-input:hover {
        box-shadow: inset 1px 1px 4px rgba(0, 0, 0, 0.2), 1px 1px 4px rgba(0, 0, 0, 0.2);
    }

    .searchbar-button {
        position:relative;
        width: 12em;
        height: 2.2em;
        border: none;
        box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.2);
        font-size: 1em;
        margin-left: 1em;
        background-color: #fafafa;
        color: #666;
        cursor: pointer; 
        -webkit-transition-duration: 0.4s; /* Safari */
        transition-duration: 0.4s;
        -webkit-transition: box-shadow 0; /* Safari */
        transition: box-shadow 0s;
        overflow: hidden;
    }

    .searchbar-button:after {
        content: "";
        background: #ddd;
        display: block;
        position: absolute;
        padding-top: 600%;
        padding-left: 700%;
        margin-left: -20px!important;
        margin-top: -120%;
        opacity: 0;
        transition: all 0.8s
    }

    .searchbar-button:hover {
        background-color: #f4f4f4;
        box-shadow: 1px 1px 3px rgba(0,0,0,0.2);
    }

    .searchbar-button::active{
        outline: 0;
    }

    .searchbar-button:focus{
        outline: 0 !important;
    }

    .searchbar-button:active:after {
        padding: 0;
        margin: 0;
        opacity: 1;
        transition: 0s;
    }`]
})

export class SearchbarComponent {
    
    @Output() addStock: EventEmitter<string> = new EventEmitter<string>()

    onClick () {
        var scv = document.querySelector('input[name=stock-code-value]')
        var searchTerm = scv["value"].toUpperCase()
        if(!searchTerm || searchTerm.trim() === ''){ scv["value"] = '';  return }
        this.addStock.emit(searchTerm)
        scv["value"] = ''
    }
}