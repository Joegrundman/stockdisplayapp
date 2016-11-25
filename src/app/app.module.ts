import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { MaterializeDirective } from 'angular2-materialize'

import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component'
import { StocksComponent } from './stocks/stocks.component'
import { SearchbarComponent } from './searchbar/searchbar.component'
import { StockDataService } from './stock-service/stock.service'

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    SearchbarComponent,
    StocksComponent,
    MaterializeDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule
  ],
  providers: [ StockDataService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
