import { Component, OnInit } from '@angular/core'
import * as d3 from 'd3'
import * as d3Tip from 'd3-tip'



import {StockDataService} from './stock.service'

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
    private dataString: string
    private separatedStockData: Array<any>
    private selectedStock: string 
    private timestamps: Array<Date>
    private volumes: Array<Number>
    private highs: Array<Number>
    private chart: any
    private colors: Array<string> = ['steelblue', 'darkorange', 'darkred', 'red', 'darkgreen', 'goldenrod', 'darkslategrey', 'darkmagenta', 'teal']
    private stockColor: Object = {}
    private overlay: any
    private vertical: any
    private valueLine: any
    private xRange: any
    private yRange: any
    private width: number
    private height: number
    private localActiveStockSymbols: Array<string>
    private mousex: number

    constructor(private stockDataService: StockDataService){}

    getActiveStocks(): Array<string> {
        return this.stockDataService.getActiveStocks()
    }

    getStockData(): void {
        this.stockDataService.getStockDataFromApi().then(stockData => {

            let parseTime = d3.timeParse("%Y-%m-%d")
            this.stockData = stockData.map(d => {
                d.Date = parseTime(d.Date)
                delete d.Open
                delete d.High
                delete d.Low
                delete d.Volume
                delete d.Adj_Close
                return d
            })
            this.dataString = JSON.stringify(this.stockData)
            this.separatedStockData = []
            this.localActiveStockSymbols = this.getActiveStocks().slice()

            this.localActiveStockSymbols.forEach((stockName, i) => {
                this.stockColor[stockName] = this.colors[i]
                this.separatedStockData.push(this.stockData.filter(element => element.Symbol === stockName))
            })
            console.log("the number of different stock data sets is", this.separatedStockData.length)
            this.renderGraph()
        })
    }

    initGraph() {

        this.width = 1460 - Margin.Left - Margin.Right
        this.height = 500 - Margin.Top - Margin.Bottom

        this.chart = d3.select('svg')
                 .attr("class", "chart")
                 .attr("width", this.width.toString() + 'px')
                 .attr("height", this.height.toString() + 'px')
                 .style('background', '#fafafa')

    }

    renderGraph() {

        d3.selectAll("svg > *").remove()

        this.xRange = d3.scaleTime()
            .rangeRound([Margin.Left, this.width - Margin.Right])
            .domain(d3.extent(this.stockData, d => d.Date))

        this.yRange = d3.scaleLinear()
            .range([this.height - Margin.Bottom, Margin.Top])
            .domain([0, d3.max(this.stockData, d => +d.Close)])

        this.valueLine = d3.line()
            .x(d => this.xRange(d['Date']))
            .y(d => this.yRange(d['Close']))

        this.separatedStockData.forEach(individualStockDataSet => {
            this.chart.append("path")
            .datum(individualStockDataSet)
            .attr("class", "line")
            .style("fill", "none")
            .style("stroke", d => this.stockColor[d[0].Symbol])
            .style("stroke-width", d => d[0].Symbol == this.selectedStock ? "3px" : "1.5px")
            .attr("d", this.valueLine)
        })

        this.chart.append("g")
                .attr("class", "axis axis--y")
                .attr("transform", "translate(" + (Margin.Left - 2) + ", 0)")
                .style("stroke", "#666")
                .call(d3.axisLeft(this.yRange))
            .append("text")
                .attr("fill", "#666")
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
            .style("stroke", "#666")
            .call(d3.axisBottom(this.xRange)) 

        this.overlay = this.chart.append("rect")
            .attr("class", "overlay")
            .attr("width", this.width - Margin.Left - Margin.Right + 'px')
            .attr("height", this.height - Margin.Top - Margin.Bottom + 'px')
            .attr("y", Margin.Top)
            .attr("x", Margin.Left)
            .style("opacity", 0.1)

       this.vertical = d3.select('.chart').append("line")
                .attr("class", "line")
                .style("stroke", "red")
                .style("stroke-width", "1px")
                .attr("x1", 10)
                .attr("y1", Margin.Top)
                .attr("x2", 10)
                .attr("y2", this.height - Margin.Bottom)                
                .style("opacity", 0)

     

        this.overlay.on("mouseover", () => {
                this.mousex = d3.mouse(d3.event.currentTarget)[0]
                this.vertical.attr("x1", this.mousex + "px")
                    .attr("x2", this.mousex + "px")
                    .style("opacity", 0.5)
            })
            .on("mousemove", () => {
                this.mousex = d3.mouse(d3.event.currentTarget)[0]
                this.vertical.attr("x1", this.mousex + "px")
                    .attr("x2", this.mousex + "px")
                    .style("opacity", 0.5)
            })
            .on("mouseout", () => {
                // this.vertical.style("opacity", 0)
            })
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
        }, 300)
    }

    ngOnInit(): void {
        this.initGraph()
        this.stockDataService.addActiveStock('YHOO')
        this.stockDataService.addActiveStock('MSFT')
        this.getStockData()
        this.setStockWatcher()
    }

}


