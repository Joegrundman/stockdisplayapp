import { Component, OnInit, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core'
import * as d3 from 'd3'

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
    styles: [`
    .chart-display {
        margin: 0 auto;
    }

    #chart-svg {
        display: block;
        margin: 0 auto;
        /*border: 1px solid #888;*/
        box-shadow: 2px 2px 6px 1px rgba(0, 0, 0, 0.2);
    }

    .tooltip {	
        position: absolute;			
        text-align: center;	
        left: 100px;
        top: 100px;		
        width: 65px;					
        height: 28px;					
        padding: 2px;				
        font: 12px sans-serif;		
        background: lightsteelblue;	
        border: 0px;		
        border-radius: 8px;			
        pointer-events: none;			
    }

    .tooltip-rect {
        fill: steelblue;
    }

    .tooltip-text {
        fill: white;
        font-size: 10px;
    }

    .line {
        stroke-width: 1.5px;
    }

    .line-selected {
        stroke-width: 3px;
    }`]
})

export class ChartComponent implements OnInit {
    @Input() activeStocks: Array<string>
    @Input() colors: Array<string>
    @Input() selectedStock: string
    @Input() separatedStockData: Array<any> 
    @Output() getStockDataFromApi: EventEmitter<null> =  new EventEmitter<null>()
    private mouseActiveOnChart: boolean 
    private stockData: Array<any>
    private tooltipData: Array<any>
    private chart: any
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
    private mousex: number
    private mousey: number

    getActiveStocks(): Array<string> {
        return this.activeStocks || []
    }

    getStockData(): void {
        this.localActiveStockSymbols = this.getActiveStocks().slice()
        if(!this.localActiveStockSymbols.length){
            console.log('no stocks to show')
            this.separatedStockData = []
            return
        }

        this.localActiveStockSymbols.forEach((stockName, i) => {
            this.stockColor[stockName] = this.colors[i]
        })
        console.log('number of datasets', this.separatedStockData.length)
        // needed to have a concatanated file to find the full range of values
        this.stockData = this.separatedStockData.reduce((a,b) => a.concat(b))

    }

    getDataForDate(dataSet, x0) {
        var x0Point = new Date(x0)

        for(var i = dataSet.length - 1; i >= 0; i--) {
            var date = new Date(dataSet[i]['Date'])
            if (date > x0Point) {
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
        let curSelectedStock: string = ''
        let curDataString: string = '[]'
        // TODO: replace with angular2 native method if available

        const stockWatch = setInterval(() => {
            var stringifiedData = JSON.stringify(this.separatedStockData)
            if( curDataString != stringifiedData) {
                console.log("chart.component stockWatcher: updating stockdata")
                curDataString = stringifiedData
                this.setMouseActiveOnChart(true)
                this.getStockData()
                this.renderGraph()
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
        this.setStockWatcher()
        this.getStockDataFromApi.emit(null)
    }

}


