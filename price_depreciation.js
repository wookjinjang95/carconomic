// const model3_data = get_info('data.json');
var margin = {top: 40, right: 30, bottom: 60, left: 40},
    width = 1500 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom

var svg = d3.select("#model3_depreciation")
    .attr("class", "graph")
    .style("background-color", "grey")
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
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("r", 3)
            .attr("cx", function(d) { return x(d.Miles)})
            .attr("cy", function(d) { return y(d.Price)})
            .attr("fill", "#9834eb")
            .attr("class", "dot")
        .on("mouseover", function() {
            tooltip
                .transition()
                .style("visibility", "visible");
        })
        .on("mousemove", function(event, d) {
            tooltip
                .html("Price: " + d.Price + "<br/>" + "Miles: " + d.Miles)
                //don't use attr here, use style here.
                .style("left", (event.clientX) + "px")
                .style("top", (event.clientY) + "px")
                .style("border", "2px solid red")
                .style("background-color", "coral");

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



