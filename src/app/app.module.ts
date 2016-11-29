import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { ChartComponent } from './chart.component'
import { StocktabsComponent } from './stocktabs.component'
import { SearchbarComponent } from './searchbar.component'
import { StockDataService } from './stock.service'

@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    SearchbarComponent,
    StocktabsComponent
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
