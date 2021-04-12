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

function update_year_selection(){
    var make = document.getElementById('make').value;
    var model = document.getElementById('model').value;
    var file_location = github_url + make + "/" + model + ".csv";
    d3.csv(file_location).then(function(data){
        var unique_years = get_unique_year(data);
        var dropdown = d3.select("#year");
        var options = dropdown.selectAll("option").data(unique_years);
        
        options.remove().exit();

        options.enter()
            .append("option")
            .merge(options)
                .text(function(d){
                    return d;
                })
                .attr("value", function(d){
                    return d;
                })
    });
}

function get_certain_points(miles, equation) {
    return equation[0] + (Math.log(miles)*equation[1]);
}

function generate_table_data(equation){
    string_data = d3.selectAll(".tick>text")
          .nodes()
          .map(function(t){
            return t.innerHTML ;
          });

    x_values = []
    keys = {}
    for(var i = 0; i < string_data.length; i++){    
        var int_version = parseInt(string_data[i].split(",").join(""))
        if(int_version >= 10000 && !keys.hasOwnProperty(int_version)){
            x_values.push(int_version)
            keys[int_version] = 1;
        }
    }
    data = []
    for(var i = 0; i < x_values.length; i++){
        content = {
            "MILES": x_values[i],
            "PRICE": get_certain_points(x_values[i], equation).toFixed(2)
        }
        data.push(content);
    }
    return data;
}

function get_total_for_each_trims(data){
    result = {};
    for(var i = 0; i < data.length; i++){
        if(data[i].Trim in result){
            result[data[i].Trim] += 1;
        }else{
            result[data[i].Trim] = 1;
        }
    }
    list_format = [];
    for(var trim_key in result){
        tmp = {"trim": trim_key, "value": result[trim_key]};
        list_format.push(tmp);
    }
    return list_format;
}

var row_position = 0;

function get_background_row_color(){
    var color = "#3d3d4d"
    if(row_position % 2 == 1){
        color = "#33334d"
    }
    row_position += 1;
    return color;
}

function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(10)
}

function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
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
            .style("stroke", "white")
            .style("position", "absolute")
            .style("stroke-width", "1px")
            .style("opacity", "0");

        var yaxis_hover_line = svg_depreciation.append("path")
            .attr("class", "line-hover")
            .style("stroke", "white")
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
        svg_depreciation.select(".y-axis").remove();

        svg_depreciation.selectAll(".grid").remove();

        svg_depreciation.append("g")		
            .attr("class", "grid")
            .attr("transform", "translate(0," + dep_height + ")")
            .style("stroke", "lightgrey")
            .style("stroke-opacity", "0.7")
            .call(make_x_gridlines()
                .tickSize(-dep_height)
                .tickFormat("")
        )

        svg_depreciation.append("g")			
            .attr("class", "grid")
            .style("stroke", "lightgrey")
            .style("stroke-opacity", "0.7")
            .call(make_y_gridlines()
                .tickSize(-dep_width)
                .tickFormat("")
        )

        svg_depreciation.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        svg_depreciation.append("g")
            .attr("class", "x-axis")
            .attr("transform", "translate(0," + (dep_height - margin.top - margin.bottom)  + ")")
            .call(d3.axisBottom(x));
        
        var circles = svg_depreciation.selectAll("circle")
            .data(data);
            
        circles.exit().remove();

        circles.enter()
            .append("circle")
                .attr("r", 4)
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
                    .style("border", "5px solid " + border_color)
                    .style("background-color", "white")
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
                .attr("x", function(d,i){
                    return dep_width - 150 - (150*i)
                })
                .attr("y", margin.top - 60)
                .style("stroke", "white")
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
                .attr("y", margin.top - 73)
                .attr("x", function(d,i){
                    return dep_width - 180 - (150*i)
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
        //adding the total of trims section
        trim_count_data = get_total_for_each_trims(data);
        trim_count_container = d3.select("#trim_total_info");

        //before update, reomve the divs for trim
        trim_count_container.selectAll("div").remove();

        trim_count_container.selectAll("div")
            .data(trim_count_data)
            .enter()
            .append("div")
                .text(function(d){ return d.trim + ": " + d.value})
                .style("color", function(d) { return mapping.get(d.trim);})
                .style("font-size", "40px")
                .style("padding-bottom", "5px")
                .style("padding-top", "5px")
                .style("padding-left", "5px")
                // .style("background-color", get_background_row_color())
                .transition()
                .duration(2000)
                .tween("text", function(d){
                    var i = d3.interpolate(0, d.value);
                    return function(t) {
                        d3.select(this).text(
                            d.trim + ": " + parseInt(i(t))
                        );
                    }
                })

        //adding the depreciation rate and linear slope
        slope_display_container = d3.select("#linear_slope");

        //before update, remove the previous divs
        slope_display_container.selectAll("text").remove();

        slope_display_container.append("text")
            .text(m.toFixed(2))
            .style("font-size", "20px")
            .style("color", function(){
                if( m < 0 ){
                    return "red";
                }else{
                    return "green";
                }
            })
            .transition()
            .duration(2000)
            .tween("text", function(d){
                var i = d3.interpolate(0, m.toFixed(2))
                return function(t) {
                    d3.select(this).text(
                        parseFloat(i(t)).toFixed(2)
                    );
                };
            });

        add_table(
            log_result.equation, ".mile_display"
        )
        //adding cost lost in miles
        // miles_twenty_thousand = d3.select("#twenty_thousand");
        // miles_twenty_thousand.select("text").remove();
        // miles_twenty_thousand.append("text")
        //     .text("$" + get_certain_points(20000, log_result.equation).toFixed(2))
        //     .style("color", "red")
        //     .transition()
        //     .duration(2000)
        //     .tween("text", function(d){
        //         var i = d3.interpolate(0, get_certain_points(20000, log_result.equation).toFixed(2))
        //         return function(t) {
        //             d3.select(this).text(
        //                 parseFloat(i(t)).toFixed(2)
        //             );
        //         };
        //     });

        // miles_twenty_thousand = d3.select("#forty_thousand");
        // miles_twenty_thousand.select("text").remove();
        // miles_twenty_thousand.append("text")
        //     .text("$" + get_certain_points(40000, log_result.equation).toFixed(2))
        //     .style("color", "red")
        //     .transition()
        //     .duration(2000)
        //     .tween("text", function(d){
        //         var i = d3.interpolate(0, get_certain_points(40000, log_result.equation).toFixed(2))
        //         return function(t) {
        //             d3.select(this).text(
        //                 parseFloat(i(t)).toFixed(2)
        //             );
        //         };
        //     });

        // miles_twenty_thousand = d3.select("#sixty_thousand");
        // miles_twenty_thousand.select("text").remove();
        // miles_twenty_thousand.append("text")
        //     .text("$" + get_certain_points(60000, log_result.equation).toFixed(2))
        //     .style("color", "red")
        //     .transition()
        //     .duration(2000)
        //     .tween("text", function(d){
        //         var i = d3.interpolate(0, get_certain_points(60000, log_result.equation).toFixed(2))
        //         return function(t) {
        //             d3.select(this).text(
        //                 parseInt(i(t)).toFixed(2)
        //             );
        //         };
        //     });

    });
}

function add_table(equation, id){
    var data = generate_table_data(equation)
    var columns = ["MILES", "PRICE"]
    //delete the table before adding new one
    d3.select(id).selectAll("table").remove()
    
    var table = d3.select(id).append('table')
        .style("width", "100%")
        .style("color", "white");
    
    var thead = table.append("thead")
    var tbody = table.append("tbody")
    var row_counter = 0;
    var background_color = "#2d2d69";

    // add header row
    thead.append("tr")
        .style("background-color", "#323277")
        .style("border-bottom", "thin solid")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(d){ return d;})

    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append('tr')
            .style("background-color", function(){
                if(row_counter % 2 == 1){
                    row_counter += 1;
                    return "#323277"
                }else{
                    row_counter += 1;
                    return "#2d2d69";
                }
            })
        
    var cells = rows.selectAll("td")
        .data( function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]};
              });
        }).enter()
        .append('td')
            .text(function(d) { return d.value})
}

make = document.getElementById('make').value;
model = document.getElementById('model').value;
year = document.getElem

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
    .style("stroke", "white")
    .text("Miles")

svg_depreciation.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.right - 20)
    .attr("y", margin.top - 60)
    .style("stroke", "white")
    .text("Price($)");

//starting here, it's a half dount graph
var x, y;
//var github_url = "https://raw.githubusercontent.com/wookjinjang95/wookjinjang95.github.io/main/data_scraper/";
var github_url = "data_scraper/";
var file_location = github_url + make + "/" + model + ".csv";

update(file_location);
update_year_selection(file_location);
