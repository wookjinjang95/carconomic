// const model3_data = get_info('data.json');
var margin = {top: 40, right: 30, bottom: 60, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom

var svg = d3.select("#model3_depreciation")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("position", "absolute")
        .style("z-index", -1)
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
    .attr("x", margin.left - 60)
    .attr("y", margin.top - 60)
    .text("Price($)");

var tooltip = d3.select("#model3_depreciation").append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("z-index", 10);


//note that when you are selectall, you have to pass the entire array
const render = data => {
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("r", 3)
            .attr("cx", function(d) { return x(d.Miles)})
            .attr("cy", function(d) { return y(d.Price)})
            .attr("fill", "#9834eb")
        .on("mouseover", function() {
            tooltip
                .transition()
                .style("visibility", "visible");
        })
        .on("mousemove", function(event, d) {
            tooltip
                .html("Price: " + d.Price + "<br/>" + "Miles: " + d.Miles)
                .attr("left", (d3.pointer(event)[0] + 90) + "px")
                .attr("top", (d3.pointer(event)[1]) + "px");
        })
        .on("mouseout", function(d) {
            tooltip
                .transition()
                .style("visibility", "hidden");
        })
};

var draw = d3.csv("tesla_model_3.csv")
    .then(data =>{
        render(data);
});



