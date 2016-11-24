import { Injectable } from '@angular/core'
import { Headers, Http, Jsonp } from '@angular/http'
import 'rxjs/add/operator/toPromise'

@Injectable()
export class StockDataService { 

    private activeStocks: Array<string> = []
    private selectedStock: string = ''

    private  mockStockDataUrl = 'app/mockdata'

    private yqlRequest = `https://query.yahooapis.com/v1/public/yql?
        q=select%20*%20from%20yahoo.finance.historicaldata
        %20where%20symbol%20%3D%20%22
        YHOO%22%20
        and%20startDate%20%3D%20%222009-09-11%22%20
        and%20endDate%20%3D%20%222010-03-10%22
        &format=json
        &diagnostics=true
        &env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys
        &callback=JSONP_CALLBACK
    `
    constructor(private http: Http, private jsonp: Jsonp) { }

    private headers = new Headers({'Content-Type': 'application/json'})
 
    // private convertToJson(csv) {
    //    var arrs = csv.trim().split('\n')
    //    var tableHeaders = arrs.slice(0, 1)
    //    tableHeaders = tableHeaders[0].split(',')
    //    var res = []
    //    arrs.forEach((arr, i) => {
    //        if (i !== 0) {
    //         var obj = {}
    //          arr.split(',')
    //           .forEach((el, j) => {
    //               obj[tableHeaders[j]] = el
    //             })
    //         res.push(obj)
    //        }
    //    })
    //    return JSON.stringify(res)
    // }

    // getStockDataFromMock(): Promise<any> {
    //     console.log('mock http called')
    //     return this.http.get(this.mockStockDataUrl)
    //         .toPromise()
    //         .then(response => response.json().data)
    //         .catch(this.handleError)
    // }

    private getYqlRequest(terms: Array<string>, startDate: string, endDate: string): string {
        // wrap the search terms with double quotes and join with comma
        let searchTerms = terms.map(t => '%22' + t + '%22').join('%2C')
        let yqlRequest = 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata' +
                    '%20where%20symbol%20in%20%28' + searchTerms +
                    '%29%20and%20startDate%20%3D%20%22' + startDate + 
                    '%22%20and%20endDate%20%3D%20%22' + endDate +
                    '%22%20&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys' + 
                    '&callback=JSONP_CALLBACK'
            return yqlRequest
    }

    getStockDataFromApi(): Promise<any> {
        var searchString = this.getYqlRequest(this.activeStocks, '2009-09-11', '2010-03-10')
        return this.jsonp.get(searchString)
            .toPromise()
            .then(response => {
                var data = response.json()            
                return data.query.results.quote
            })
            .catch(this.handleError)
    }


    private handleError(er: any): Promise<any> {
        console.log('received http error', er)
        return Promise.reject(er.message || er)
    }

    getActiveStocks(): Array<string> {
        return this.activeStocks
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

    getSelectedStock(): string {
        return this.selectedStock
    }

    setSelectedStock(target: string): void {
        this.selectedStock = target
        console.log('selectedStock', this.selectedStock)
    }

}