## Stock Display Todo Lst

**Currently Working On**


# YQL api
- [x] use yql to generate different stock data sets 
- [x] error handling for failure to get stock data
- [ ] problem with getting more than two data sets to be solved
- [ ] use yql to generate different start and end dates

# Chart
- [x] Needs to rerender all graphs and axes on update
- [x] different stocks to be color-coded
- [ ] use angular2 system get data from service instead of the watcher i implemented
- [x] needs to handle no dataset
- [x] line on chart at mouse
- [x] mouseover should show data on this date for all stocks
- [x] selected stock should have highlight instead of orange
- [x] tooltip at mousepoint
- [ ] gridlines
- [x] tooltip should stay if clicked, even if cursor mouseouts of svg  
- [x] chart shouldn't reload just to highlight selected stocks

# Searchbar
- [x] searchbar to send requested stock in uppercase to api
- [x] searchbar to be styled

# Service
- [ ] colors to be perma-linked to stock so that deleting a stock doesn't reset colors

# Show active stocks display
- [x] each active stock should have panel showing name
- [x] each stock panel should have delete button
- [x] stock panel should be styled
- [x] if stock active, chart should show selected line in different color
- [x] stock can be deleted from selection here
- [x] delete button to be turned into corner x

# Websocket
- [x] integrate with websocket backend so all users can share the current data