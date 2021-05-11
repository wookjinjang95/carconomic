function get_make_and_model(){
    var make = document.getElementById('make').value;
    var model = document.getElementById('model').value;
}

function get_unique_year(data){
    var unique_years = ["all"]
    for(var i = 0; i < data.length; i++){
        if(!unique_years.includes(data[i].Year)){
            unique_years.push(data[i].Year)
        }
    }
    return unique_years;
}

function look_for_y_value_from_log(log_equation, x_value){
    for(var i = 0; i < log_equation.points.length; i++){
        if(log_equation.points[i][0] == x_value){
            return log_equation.points[i][1];
        }
    }
}

//note that when you are selectall, you have to pass the entire array
function render(data, id_name, width, height, svg_left){
    //creating the object for return object.
    var depreciation_graph_obj = {};

    var element = d3.select(id_name).node();
    width = (typeof width !== 'undefined') ? width : element.getBoundingClientRect().width;
    height = (typeof height !== 'undefined') ? height : element.getBoundingClientRect().height;
    
    svg_left = (typeof svg_left !== 'undefined') ? svg_left : 40;
    var margin = {top: 40, right: 30, bottom: 30, left: svg_left},
    dep_width = parseInt(width) - margin.left - margin.right,
    dep_height = parseInt(height) - margin.top - margin.bottom

    var svgContainer = d3.select(id_name)
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
        .attr('stroke', 'green')
        .text("Miles")

    svg_depreciation.append("text")
        .attr("text-anchor", "end")
        .attr("x", margin.right - 20)
        .attr("y", margin.top - 60)
        .text("Price($)")
        .attr("stroke", "green");

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
            .attr("r", 3)
            .attr("cx", function(d) { return x(parseInt(d.Miles))})
            .attr("cy", function(d) { return y(parseInt(d.Price))})
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
            .attr("font-size", "15px")
            .style('color', 'white');
    
    //rectangle legend
    svg_depreciation.selectAll("rect-legend")
        .data(trims)
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

    svg_depreciation.append("line")
            .style("stroke", "red")
            .style("stroke-width", "2px")
            .attr("x1", x(0))
            .attr("y1", y(b))
            .attr("x2", x((0 - b)/m))
            .attr("y2", y(0));
    
    svg_depreciation.append("path")
        .datum(log_data_points)
        .attr("fill", "none")
        .style("stroke", "steelblue")
        .style("stroke-width", "2px")
        .attr("d", d3.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);})
        )
}