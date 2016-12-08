import { Injectable } from '@angular/core'
import { Http, Jsonp } from '@angular/http'

import 'rxjs/add/operator/toPromise'

@Injectable()
export class StockDataService { 

    private activeStocks: Array<string> = []
    private selectedStock: string = ''
    private colors: Array<string> =  ['steelblue', 'darkorange', 'darkred', 'red', 'darkgreen', 'goldenrod', 'darkslategrey', 'darkmagenta', 'teal']
    private stockData: Array<any>
    private isLocked: boolean = false
    private separatedStockData: Array<any>

    constructor(private jsonp: Jsonp, private http: Http) { }

    // private headers = new Headers({'Content-Type': 'application/json'})

    private getYqlRequest(terms: Array<string>, startDate: string, endDate: string): string {
        // wrap the search terms with double quotes and join with comma
        let searchTerms = terms.map(t => '%22' + t + '%22').join('%2C')
        let yqlRequest = 'https://query.yahooapis.com/v1/public/yql?q=' + 
                    'select%20Symbol%2C%20Close%2C%20Date' +
                    '%20from%20yahoo.finance.historicaldata' +
                    '%20where%20symbol%20in%20%28' + searchTerms +
                    '%29%20and%20startDate%20%3D%20%22' + startDate + 
                    '%22%20and%20endDate%20%3D%20%22' + endDate +
                    '%22%20&format=json&diagnostics=true' + 
                    '&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys' + 
                    // '&callback=JSONP_CALLBACK'
                    ''

            console.log('yqlRequest', yqlRequest)
            return yqlRequest
    }

    getStockDataFromApi(months: number): Promise<any> {

        let now = new Date()
        let endYear = now.getFullYear()
        let endMonth = now.getMonth() + 1
        let date = now.getDate()
        let startMonth = endMonth - months
        let startYear = endYear
        if (startMonth < 1) { 
            startMonth += 12
            startYear -= 1 
        }

        var startDate = startYear + '-' + startMonth + '-' + date
        var endDate = endYear + '-' + endMonth + '-' + date

        var searchString = this.getYqlRequest(this.activeStocks, startDate, endDate)
        return this.http.get(searchString)
        // return this.jsonp.get(searchString)
            .toPromise()
            .then(response => {
                var data = response.json()            
                return data.query.results.quote
            })
            .catch(this.handleError)
    }

    // getAllYqlRequests() {
    //     let now = new Date()
    //     let year = now.getFullYear()
    //     let month = now.getMonth() + 1
    //     let date = now.getDate()

    //     // var startDate = (year - 1) + '-' + (month) + '-' + date
    //     var startDate = (year) + '-' + (month - 2) + '-' + date
    //     var endDate = year + '-' + month + '-' + date
    // }

    // getSingleYqlRequest(stockTerm: string, startDate: string, endDate: string): string {
    //     let yqlRequest = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata' +
    //         '%20where%20symbol%20%3D%20%22' + stockTerm +
    //         '%22%20and%20startDate%20%3D%20%22'+ startDate + 
    //         '%22%20and%20endDate%20%3D%20%22' + endDate +
    //         '%22%20&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys' + 
    //         '&callback=JSONP_CALLBACK'

    //     return yqlRequest
    // }


    private handleError(er: any): Promise<any> {
        console.log('received http error', er)
        return Promise.reject(er.message || er)
    }

    addActiveStock(stock: string) : void {
        if(!this.activeStocks.length || this.activeStocks.indexOf(stock) == -1){
            this.activeStocks.push(stock)
        }
    }

    deleteActiveStock(target: string) : void {
        this.activeStocks = this.activeStocks.filter(stock => stock !== target)
        if( this.selectedStock == target ) {
            this.selectedStock = ''
        }
    }

    getActiveStocks(): Array<string> {
        return this.activeStocks
    }

    getSelectedStock(): string {
        return this.selectedStock
    }

    setSelectedStock(target: string): void {
        this.selectedStock = target
    }

    getColors(): Array<string> {
        return this.colors
    }

    getIsLocked(): boolean {
        return this.isLocked
    }

    setIsLocked(isLocked: boolean): void {
        this.isLocked = isLocked
    }

    getSeparatedStockData(): Array<any> {
        return this.separatedStockData
    }

    addDatasetToSeparatedStockData(dataSet: Array<any>){
        this.separatedStockData = this.separatedStockData.concat(dataSet)
    }

    removeDatasetFromSeparatedStockData(symbol: string) {
        this.separatedStockData = this.separatedStockData.filter(d => d[0] != symbol)
    }

}