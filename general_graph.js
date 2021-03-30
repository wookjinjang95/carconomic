function alert_no_data(){
    var make = document.getElementById('make').value;
    var model = document.getElementById('model').value;
    var file_location = github_url + make + "/" + model + ".csv";

    fetch(file_location).then(response => {
        if(!response.ok){
            alert("No data available for " + make + " " + model);
        }else{
            update(file_location);
        }
    });
}

function update(file_location){
    d3.csv(file_location).then(function(data){

        //remove the axis first.
        svg_depreciation.selectAll("line-hover").remove()

        var dot_tooltip = d3.select("body").append("div")
            .attr("class", "dot_tooltip")
            .style("position", "absolute");

        var axis_hover_line = svg_depreciation.append("path")
            .attr("class", "line-hover")
            .style("stroke", "black")
            .style("position", "absolute")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var yaxis_hover_line = svg_depreciation.append("path")
            .attr("class", "line-hover")
            .style("stroke", "black")
            .style("position", "absolute")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var mapping = map_trim_to_color(data);
        var trims = get_unique_trims(data);
        var max_y = get_y_max_value(data);
        var max_x = get_x_max_value(data);
    
        x = d3.scaleLinear().domain([0, max_x]).range([0, dep_width]);
        y = d3.scaleLinear().domain([0, max_y]).range([dep_height - margin.top - margin.bottom, 0]);
    
        svg_depreciation.select(".x-axis").remove();

        svg_depreciation.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (dep_height - margin.top - margin.bottom)  + ")")
            .call(d3.axisBottom(x));
    
        svg_depreciation.select(".y-axis").remove();

        svg_depreciation.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
        
        var circles = svg_depreciation.selectAll("circle")
            .data(data);
            
        circles.exit().remove();

        circles.enter()
            .append("circle")
                .attr("r", 3)
            .merge(circles)
                .attr("cx", function(d) { return x(parseInt(d.Miles))})
                .attr("cy", function(d) { return y(parseInt(d.Price))})
                .attr("class", "dot");
            
        svg_depreciation.selectAll("circle")
            .attr("fill", function(d) {
                return mapping.get(d.Trim);
            })
            .on("mousemove", function(event, d) {
                var border_color = mapping.get(d.Trim)
                var xPosition = event.clientX + 50;
                var yPosition = window.scrollY + (event.clientY);
                dot_tooltip
                    .html(
                        "Trim: " + d.Trim + "</br>" + 
                        "Price: " + d.Price + "</br>" + 
                        "Miles: " + d.Miles)
                    //don't use attr here, use style here.
                    .style("display", "inline-block")
                    .style("left", xPosition + "px")
                    .style("top", yPosition + "px")
                    .style("padding", "10px")
                    .style("border", "2px solid " + border_color)
                    .style("background-color", "#ffcc80")
                //make the color red when hover
                d3.select(this).attr("fill", "red")
                axis_hover_line
                    .style("opacity", "0.2")
                    .attr("d", d3.line()([[x(d.Miles), 0], [x(d.Miles), dep_height - margin.top - margin.bottom]]))
                yaxis_hover_line
                    .style("opacity", "0.2")
                    .attr("d", d3.line()([[0, y(d.Price)], [dep_width, y(d.Price)]]))
            })
            .on("mouseout", function(event, d) {
                axis_hover_line.style("opacity", "0")
                yaxis_hover_line.style("opacity", "0")
                d3.select(this).attr("fill", mapping.get(d.Trim))
                dot_tooltip.style("display", "none");
            })
    
    
        svg_depreciation.selectAll(".legend_text").remove().exit();
        
         //adding legend text
        svg_depreciation.selectAll("legend")
            .data(trims)
            .enter()
            .append("text")
                .attr("class", "legend_text")
                .attr("x", 4*dep_width/5)
                .attr("y", function(d,i){
                    return (i+1) * margin.top;
                })
                .text(function(d){ 
                    return d;})
                .attr("font-size", "15px");


        //rectangle legend
        var legend_rect = svg_depreciation.selectAll("rect-legend")
            .data(trims);

        legend_rect.exit().remove();

        legend_rect
            .enter()
            .append("rect")
                .attr("x", 3*dep_width/4)
                .attr("y", function(d,i){
                    return (i+1) * margin.top - 15;
                })
                .style("fill", function(d){
                    return mapping.get(d);
                })
                .attr("height", 15)
                .attr("width", 15);
            
        //adding linear regression
        new_data = data.map(d => [parseInt(d.Miles), parseInt(d.Price)])
        var result = regression(new_data);
        var m = result[0];
        var b = result[1];
    
        var log_result = logarithmic(new_data);
        log_data_points = log_result.points;
        log_data_points.sort( function( a, b )
        {
            // Sort by the 2nd value in each array
            if ( a[0] == b[0] ) return 0;
            return a[0] < b[0] ? -1 : 1;
        });
    
        d3.selectAll(".linear-line").remove();

        svg_depreciation.append("line")
                .attr("class", "linear-line")
                .style("stroke", "red")
                .style("stroke-width", "2px")
                .attr("x1", x(0))
                .attr("y1", y(b))
                .attr("x2", x((0 - b)/m))
                .attr("y2", y(0));
    
        d3.selectAll(".log-line").remove();

        svg_depreciation.append("path")
            .datum(log_data_points)
            .attr("class", "log-line")
            .attr("fill", "none")
            .style("stroke", "steelblue")
            .style("stroke-width", "2px")
            .attr("d", d3.line()
                .x(function(d) { return x(d[0]);})
                .y(function(d) { return y(d[1]);})
            )
    });
}

make = document.getElementById('make').value;
model = document.getElementById('model').value;

var element = d3.select("#general_depreciation").node();
width = (typeof width !== 'undefined') ? width : element.getBoundingClientRect().width;
height = (typeof height !== 'undefined') ? height : element.getBoundingClientRect().height;

svg_left = (typeof svg_left !== 'undefined') ? svg_left : 60;
var margin = {top: 40, right: 40, bottom: 30, left: svg_left},
dep_width = parseInt(width) - margin.left - margin.right,
dep_height = parseInt(height) - margin.top - margin.bottom

var svgContainer = d3.select("#general_depreciation")
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
    .attr("y", dep_height - 40)
    .text("Miles")

svg_depreciation.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.right - 20)
    .attr("y", margin.top - 60)
    .text("Price($)");

var x, y;
var github_url = "https://raw.githubusercontent.com/wookjinjang95/wookjinjang95.github.io/main/data_scraper/";
var file_location = github_url + make + "/" + model + ".csv";

update(file_location);