import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core'
import * as d3 from 'd3'

import {StockDataService} from './stock.service'


enum Margin {
    Top = 40,
    Bottom = 60,
    Left = 100,
    Right = 80
}

@Component({
    selector: 'chart-component',
    encapsulation: ViewEncapsulation.None,
    template: `
        <div class="chart-display">
            <svg id="chart-svg"></svg>
        </div>
    `,
    styleUrls: ['./chart.component.css']
})

export class ChartComponent implements OnInit {
    private bisectDate:any
    private mouseActiveOnChart: boolean 
    private stockData: Array<any>
    private dataString: string
    private separatedStockData: Array<any>
    private tooltipData: Array<any>
    @Input() selectedStock: string
    @Input() activeStocks: Array<string>
    // private timestamps: Array<Date>
    // private volumes: Array<Number>
    // private highs: Array<Number>
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
    private tooltip: any
    private localActiveStockSymbols: Array<string> 
    private months: number
    private mousex: number
    private mousey: number

    constructor(private stockDataService: StockDataService){}

    getActiveStocks(): Array<string> {
        return this.activeStocks || []
        // return this.stockDataService.getActiveStocks()
    }

    getStockData(months: number): void {
        this.localActiveStockSymbols = this.getActiveStocks().slice()
        if (!this.localActiveStockSymbols.length) {
            console.log('no stocks to show')
            this.separatedStockData = []
            this.renderGraph()
            this.stockDataService.setIsLocked(false)
            return
        } 

        this.stockDataService.getStockDataFromApi(months).then(stockData => {

            let parseTime = d3.timeParse("%Y-%m-%d")
            this.stockData = stockData.map(d => {
                d.Date = parseTime(d.Date)
                return d
            })

            this.dataString = JSON.stringify(this.stockData)
            this.separatedStockData = []
           

            this.localActiveStockSymbols.forEach((stockName, i) => {
                this.stockColor[stockName] = this.colors[i]
                this.separatedStockData.push(this.stockData.filter(element => element.Symbol === stockName))
            })

            console.log("the number of different stock data sets is", this.separatedStockData.length)
            this.renderGraph()
            this.stockDataService.setIsLocked(false)
        })
        
    }

    getDataForDate(dataSet, x0) {
        var x0Object = new Date(x0)

        for(var i = dataSet.length - 1; i >= 0; i--) {
            var date = new Date(dataSet[i]['Date'])
            if (date > x0Object) {
                return dataSet[i + 1] || dataSet[i]
            }
        }
        return dataSet[0]
    }

    initGraph() {

        this.width = 1460 - Margin.Left - Margin.Right
        this.height = 500 - Margin.Top - Margin.Bottom

        this.chart = d3.select('svg')
                 .attr("class", "chart")
                 .attr("width", this.width.toString() + 'px')
                 .attr("height", this.height.toString() + 'px')
                 .style('background', '#fafafa')

        this.bisectDate = d3.bisector(d => d['Date']).left

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

        this.separatedStockData.forEach(dataSet => {
            this.chart.append("path")
            .datum(dataSet)
            .attr("class", "line line-" + dataSet[0].Symbol)
            .style("fill", "none")
            .style("stroke", d => this.stockColor[d[0].Symbol])
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

        this.tooltip = this.chart.append("g")
            .attr("transform", "translate(100, 100)")
            .style("opacity", 0)
        this.tooltip.append("rect")
            .attr("class", "tooltip-rect")
            .attr("width", '70px')
            .attr("height",  '100px')
            .attr("ry", '10')
            .attr("rx", '10')

        var tooltipText = this.tooltip.append("text")
            .attr('class', 'tooltip-text date')
            .attr("y", 15)
            .attr("x", 5)
            .text("date")

        this.localActiveStockSymbols.forEach((l, i) => {
            this.tooltip.append("text")
                .attr('class', 'tooltip-text ' + l)
                .attr("y", (15 * (i + 1)) + 15)
                .attr("x", 3)
                .text(l)
        })

        this.overlay = this.chart.append("rect")
            .attr("class", "overlay")
            .attr("width", this.width - Margin.Left - Margin.Right + 'px')
            .attr("height", this.height - Margin.Top - Margin.Bottom + 'px')
            .attr("y", Margin.Top)
            .attr("x", Margin.Left)
            .style("opacity", 0)

       this.vertical = d3.select('.chart').append("line")
                .attr("class", "line")
                .style("stroke", "red")
                .style("stroke-width", "1px")
                .attr("x1", 10)
                .attr("y1", Margin.Top)
                .attr("x2", 10)
                .attr("y2", this.height - Margin.Bottom)                
                .style("opacity", 0)

        this.overlay.on("mouseover", (d) => {
                if (this.getMouseActiveOnChart()) {
                    this.vertical.style("opacity", 0.5)
                    this.tooltip.style("opacity", 0.7)
                }
            })
            .on("mousemove", () => {
                if (this.getMouseActiveOnChart()) {

                    [this.mousex, this.mousey] = d3.mouse(d3.event.currentTarget)
                    
                    // to get the position of the mouse as a point on the xRange
                    var x0 = this.xRange.invert(this.mousex)

                    //update tooltip date
                    var dateText = x0.getDate() + "/" + (x0.getMonth() + 1) + "/" + x0.getFullYear() + "\n"                 
                    this.tooltip.select('.tooltip-text.date')
                            .text(dateText)

                    //update tooltip stock prices
                    this.separatedStockData.forEach(dataSet => {
                        var datum = this.getDataForDate(dataSet, x0)
                        var stockEntry = datum.Symbol + ': ' + (+datum.Close).toFixed(2)
                        this.tooltip.select('.tooltip-text.' + datum.Symbol)
                                .text(stockEntry) 
                    })
                     // update tooltip position
                    this.tooltip.attr("transform", `translate(${this.mousex + 10},${this.mousey - 40})`)
                    
                    //update vertical line position
                    this.vertical.attr("x1", this.mousex + 5 + "px")
                                 .attr("x2", this.mousex + 5 + "px")
                }
            })
            .on("mouseout", () => {
                if(this.getMouseActiveOnChart()) {
                    this.vertical.style("opacity", 0)
                    this.tooltip.style("opacity", 0)
                } 
            })
            .on("click", () => {
                this.setMouseActiveOnChart(!this.getMouseActiveOnChart())
            })           
    }

    setStockWatcher () {
        var curSelectedStock = ''
        // TODO: replace with angular2 native method
        const stockWatch = setInterval(() => {
            var local = JSON.stringify(this.localActiveStockSymbols)
            var service = JSON.stringify(this.activeStocks)
            // var service = JSON.stringify(this.getActiveStocks())

            if(local !== service && !this.stockDataService.getIsLocked()){
                this.stockDataService.setIsLocked(true)
                this.setMouseActiveOnChart(true)
                this.getStockData(this.months)
            }

            else if(curSelectedStock !== this.selectedStock) {

                this.chart.select('.line-' + curSelectedStock)
                    .attr('class', 'line line-' + curSelectedStock)

                curSelectedStock = this.selectedStock

                this.chart.select('.line-' + this.selectedStock)
                    .attr('class', 'line line-' + this.selectedStock + ' line-selected')
            }
        }, 300)
    }

    setMouseActiveOnChart(setting: boolean): void {
        this.mouseActiveOnChart = setting
    }

    getMouseActiveOnChart(): boolean {
        return this.mouseActiveOnChart
    }

    ngOnInit(): void {
        this.initGraph()
        // this.stockDataService.addActiveStock('YHOO')
        // this.stockDataService.addActiveStock('MSFT')
        this.setMouseActiveOnChart(true)
        this.months = 2
        // this.getStockData(this.months)
        this.setStockWatcher()
    }

}


