var width = 800, height = 800;
var margin = {top: 20, right: 20, bottom: 40, left: 40}
var svg = d3.select("#maintenance_graph")
            .append("svg")
                .attr("width", "100%")
                .attr("height", height + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.right + "," + margin.top + ")");


var tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .attr("class", "tooltip");

function getColor(subgroups){
    //TODO: Check if the color exists, if does, try again.
    colorScale = {};
    for(var i = 0; i < subgroups.length; i++){
        r = Math.floor(Math.random() * Math.floor(256));
        g = Math.floor(Math.random() * Math.floor(256));
        b = Math.floor(Math.random() * Math.floor(256));
        colorScale[subgroups[i]] = 'rgb(' + r + ',' + g + ',' + b + ')';
    }
    return colorScale
}


d3.csv("./data_scraper/benz_cla_stat.csv").then(function(data){
    var subgroups = data.columns.slice(1);
    var groups = data.map(function (d) { return d.miles});

    var xScale = d3.scaleBand()
                    .domain(groups)
                    .range([0, width])
                    .padding(0.5);

    var yScale = d3.scaleLinear()
                    .domain([0, 250])
                    .range([height, 0]);
    
    var colorScale = getColor(subgroups);
    
    //Add x-Axis
    svg.append("g")
        .attr("transform", "translate(" + margin.right + "," + height + ")")
        .call(d3.axisBottom(xScale));

    //Add y-Axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", "translate(" + margin.right + ",0)")
    
    // make stacked data
    var stacked_data = d3.stack()
            .keys(subgroups)
            (data)

    svg.append("g")
        .selectAll("g")
        .data(stacked_data)
        .enter()
        .append("g")
            .attr("fill", function(d) { 
                return colorScale[d.key];
            })
            .selectAll("rect")
            .data(function (d) { 
                return d;
            })
            .enter()
            //creating the bar graph
            .append("rect")
                .attr("x", function(d) {
                    return xScale(d.data.miles) + margin.right})
                .attr("y", function(d) { return yScale(d[1])})
                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1])})
                .attr("width", xScale.bandwidth())
                .on("mouseout", function(d) { return tooltip.style("display", "none"); })
                .on("mousemove", function(event, d){
                    var category = d3.select(this.parentNode).datum().key;
                    var xPosition = event.clientX - 30
                    var yPosition = event.clientY - 50
                    tooltip.style("left", xPosition + "px")
                    tooltip.style("top", yPosition + "px")
                    tooltip.style("display", "inline-block")
                    tooltip.html(category + "</br>" + "Cases:" + (d[1] - d[0]));
                })

    //creating legend text
    svg.append("g")
        .selectAll("g")
        .data(stacked_data)
        .enter()
        .append("text")
            .attr("fill", "black")
            .attr("x", function(d){
                if(d.index > 31){
                    return width + 590;
                }else{
                    return width + 100;
                }
            })
            .attr("y", function(d){
                var index;
                if(d.index > 31){
                    index = d.index - 32;
                }else{
                    index = d.index;
                }
                return 23 + (parseInt(index) * 25);
            })
            .text(function(d) { return d.key;})
            .style("position", "absolute");
    
    //creating legend rectangle
    svg.append("g")
        .selectAll("g")
        .data(stacked_data)
        .enter()
            .append("rect")
                .attr("y", function(d){
                    var index;
                    if(d.index > 31){
                        index = d.index - 32;
                    }else{
                        index = d.index;
                    }
                    return  8 + (parseInt(index) * 25);
                })
                .attr("x", function(d){
                    if(d.index > 31){
                        return width + 550;
                    }else{
                        return width + 100 - 35;
                    }
                })
                .style("fill", function(d){
                    return colorScale[d.key];
                })
                .attr("height", 20)
                .attr("width", 20);
});