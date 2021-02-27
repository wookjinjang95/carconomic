// const model3_data = get_info('data.json');
var margin = {top: 40, right: 30, bottom: 60, left: 40},
    width = 1500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom

var color_arr = ['red', 'green', 'blue'];

function map_trim_to_color(data){
    //remmeber that this doesn't count the length matching.
    var mapping = new Map();
    var trims = [];
    for(var i = 0; i < data.length; i++){
        if(!trims.includes(data[i].Trim)){
            trims.push(data[i].Trim)
        }
    }
    for(var i = 0; i < trims.length; i++){
        console.log(trims[i] + color_arr[i])
        mapping.set(trims[i], color_arr[i])
    }
    console.log(mapping)
    return mapping;
}

var svg = d3.select("#model3_depreciation")
    .attr("class", "graph")
    .append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().domain([0, 100000]).range([0, width]);
var y = d3.scaleLinear().domain([0, 100000]).range([height, 0]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

svg.append("g").call(d3.axisLeft(y))

svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.bottom - 20)
    .text("Miles")

svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.right)
    .attr("y", margin.top - 60)
    .text("Price($)");

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden");


//note that when you are selectall, you have to pass the entire array
const render = data => {
    var mapping = map_trim_to_color(data)
    svg.selectAll("dot")
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
        .on("mouseover", function() {
            tooltip
                .transition()
                .style("visibility", "visible");
        })
        .on("mousemove", function(event, d) {
            var border_color = mapping.get(d.Trim)
            console.log(border_color)
            tooltip
                .html(
                    "Trim:" + d.Trim + "<br/>" + 
                    "Price: " + d.Price + "<br/>" + 
                    "Miles: " + d.Miles)
                //don't use attr here, use style here.
                .style("left", (event.clientX - 30) + "px")
                .style("top", (event.clientY) + 10 + "px")
                .style("border", "2px solid " + border_color)
                .style("background-color", border_color);

        })
        .on("mouseout", function(d) {
            tooltip
                .transition()
                .style("visibility", "hidden");
        })
};

var draw = d3.csv("cla_data.csv")
    .then(data =>{
        render(data);
});



