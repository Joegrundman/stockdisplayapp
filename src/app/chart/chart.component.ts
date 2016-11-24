import { Component, OnInit } from '@angular/core'
import * as d3 from 'd3'
import {StockDataService} from '../stock-service/stock.service'

enum Margin {
    Top = 40,
    Bottom = 60,
    Left = 100,
    Right = 40
}

@Component({
    selector: 'chart-component',
    template: `
        <div class="chart-display">
            <svg id="chart-svg"></svg>
        </div>
    `,
    styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnInit {
    private stockData: Array<any>
    private separatedStockData: Array<any>
    private selectedStock: string 
    private timestamps: Array<Date>
    private volumes: Array<Number>
    private highs: Array<Number>
    private chart: any
    private valueLine: any
    private xRange: any
    private yRange: any
    private width: any
    private height: any
    private localActiveStockSymbols: Array<string>

    constructor(private stockDataService: StockDataService){}

    getActiveStocks(): Array<string> {
        return this.stockDataService.getActiveStocks()
    }

    getStockData(): void {
        this.stockDataService.getStockDataFromApi().then(stockData => {
            let parseTime = d3.timeParse("%Y-%m-%d")
            this.stockData = stockData.map(d => {
                d.Date = parseTime(d.Date)
                return d
            })
            this.separatedStockData = []
            this.localActiveStockSymbols = this.getActiveStocks().slice()

            this.localActiveStockSymbols.forEach(stockName => {
                this.separatedStockData.push(this.stockData.filter(element => element.Symbol === stockName))
            })
            console.log("the number of different stock data sets is", this.separatedStockData.length)
            this.renderGraph()
        })
    }

    initGraph() {

        this.width = 1260 - Margin.Left - Margin.Right
        this.height = 500 - Margin.Top - Margin.Bottom

        this.chart = d3.select('svg')
                 .attr("width", this.width.toString() + 'px')
                 .attr("height", this.height.toString() + 'px')
                 .style('background', '#eee')
    }

    renderGraph() {
        // remove old svg child components
        d3.selectAll("svg > *").remove()

        this.xRange = d3.scaleTime()
            .rangeRound([Margin.Left, this.width - Margin.Right])
            .domain(d3.extent(this.stockData, d => d.Date))

        this.yRange = d3.scaleLinear()
            .range([this.height - Margin.Bottom, Margin.Top])
            .domain(d3.extent(this.stockData, d => d.Close))
    
        this.valueLine = d3.line()
            .x(d => this.xRange(d['Date']))
            .y(d => this.yRange(d['Close']))

        this.separatedStockData.forEach(individualStockDataSet => {
            this.chart.append("path")
            .datum(individualStockDataSet)
            .attr("class", "line")
            .style("fill", "none")
            .style("stroke", d => d[0].Symbol == this.selectedStock ? "orange": "steelblue")
            .style("stroke-width", "1.5px")
            .attr("d", this.valueLine)
        })

        this.chart.append("g")
                .attr("class", "axis axis--y")
                .attr("transform", "translate(" + (Margin.Left - 2) + ", 0)")
                .style("stroke", "black")
                .call(d3.axisLeft(this.yRange))
            .append("text")
                .attr("fill", "black")
                .attr("transform", "rotate(-90)")
                .attr("y", -Margin.Left / 2) // shifts x axis!?
                .attr("x", -this.height / 2) //shifts y axis!?
                .attr("dy", "0.71em")
                .attr("dx", Margin.Bottom / 2)
                .style("text-anchor", "end")
                .text("Closing Price ($)")


        this.chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0, " + (this.height - Margin.Bottom )+ ")")
            .style("stroke", "black")
            .call(d3.axisBottom(this.xRange))
    }

    setStockWatcher () {
        const stockWatch = setInterval(() => {
            var local = JSON.stringify(this.localActiveStockSymbols)
            var service = JSON.stringify(this.getActiveStocks())
            var curSelectedStock = this.stockDataService.getSelectedStock()

            if(local !== service){
                this.getStockData()
            }

            else if(curSelectedStock !== this.selectedStock) {
                this.selectedStock = curSelectedStock
                this.renderGraph()
            }
        }, 2000)
    }

    ngOnInit(): void {
        this.initGraph()
        this.stockDataService.addActiveStock('YHOO')
        this.getStockData()
        this.setStockWatcher()
    }

}


