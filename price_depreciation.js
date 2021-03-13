var margin = {top: 40, right: 30, bottom: 30, left: 40},
    dep_width = parseInt(d3.select("#model3_depreciation").style("width")) - margin.left - margin.right,
    dep_height = parseInt(d3.select("#model3_depreciation").style("height")) - margin.top - margin.bottom

function map_trim_to_color(data){
    var trims = get_unique_trims(data);
    var mapping = new Map();
    for(var i = 0; i < trims.length; i++){
        r = Math.floor(Math.random() * Math.floor(256));
        g = Math.floor(Math.random() * Math.floor(256));
        b = Math.floor(Math.random() * Math.floor(256));
        mapping.set(trims[i], 'rgb(' + r + ',' + g + ',' + b + ')');
    }
    return mapping;
}

function get_x_max_value(data){
    var max = d3.max(data.map(function (d) { return parseInt(d.Miles)}));
    return max + 1000;
}

function get_y_max_value(data){
    var max = d3.max(data.map(function (d) { return parseInt(d.Price)}));
    return max + 1000;
}

function get_unique_trims(data){
    var trims = [];
    for(var i = 0; i < data.length; i++){
        if(!trims.includes(data[i].Trim)){
            trims.push(data[i].Trim)
        }
    }
    return trims;
}
var svgContainer = d3.select("#model3_depreciation")
var svg_depreciation = svgContainer
    .attr("class", "graph")
    .append("svg")
        .attr("width", dep_width)
        .attr("height", dep_height)
        .append("g")
            .attr("transform", 
                "translate(" + margin.left + "," + margin.top + ")")

svg_depreciation.append("text")
    .attr("text-anchor", "end")
    .attr("x", dep_width - 60)
    .attr("y", dep_height - 60)
    .text("Miles")

svg_depreciation.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.right)
    .attr("y", margin.top - 60)
    .text("Price($)");

var dot_tooltip = d3.select("body").append("div")
    .attr("class", "dot_tooltip")
    .style("position", "absolute");


//note that when you are selectall, you have to pass the entire array
const render = data => {
    var mapping = map_trim_to_color(data);
    var trims = get_unique_trims(data);
    var max_y = get_y_max_value(data);
    var max_x = get_x_max_value(data);
    
    var x = d3.scaleLinear().domain([0, max_x]).range([0, dep_width]);
    var y = d3.scaleLinear().domain([0, max_y]).range([dep_height - margin.top - margin.bottom, 0]);

    svg_depreciation.append("g")
        .attr("transform", "translate(0," + (dep_height - margin.top - margin.bottom)  + ")")
        .call(d3.axisBottom(x))

    svg_depreciation.append("g").call(d3.axisLeft(y))

    svg_depreciation.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("r", 5)
            .attr("cx", function(d) { return x(d.Miles)})
            .attr("cy", function(d) { return y(d.Price)})
            .attr("fill", function(d) {
                return mapping.get(d.Trim);
            })
            .attr("class", "dot")
        
        .on("mousemove", function(event, d) {
            var border_color = mapping.get(d.Trim)
            var xPosition = event.clientX + 50;
            var yPosition = window.scrollY + (event.clientY);
            dot_tooltip
                .html(
                    "Trim:" + d.Trim + "</br>" + 
                    "Price: " + d.Price + "</br>" + 
                    "Miles: " + d.Miles)
                //don't use attr here, use style here.
                .style("display", "inline-block")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .style("border", "2px solid " + border_color)

        })
        .on("mouseout", function(d) {
            return dot_tooltip.style("display", "none");
        })
    
    //adding legend text
    svg_depreciation.selectAll("legend")
        .data(trims)
        .enter()
        .append("text")
            .attr("class", "legend_text")
            .attr("x", 3*dep_width/4 + 120)
            .attr("y", function(d,i){
                return (i+1) * margin.top;
            })
            .text(function(d){ 
                return d;})
    
    //rectangle legend
    svg_depreciation.selectAll("rect-legend")
        .data(trims)
        .enter()
        .append("rect")
            .attr("x", 3*dep_width/4 + 90)
            .attr("y", function(d,i){
                return (i+1) * margin.top - 15;
            })
            .style("fill", function(d){
                return mapping.get(d);
            })
            .attr("height", 20)
            .attr("width", 20);
};

var draw = d3.csv("cla_data.csv")
    .then(data =>{
        render(data);
});



