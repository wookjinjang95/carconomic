async function generate_market_report(){
    //initial value
    var model = document.getElementById('model').value.replace("_", " ");
    var brand = document.getElementById('make').value;
    var selected_year = document.getElementById('year').value;
    var file_location = retrieve_data_location();
    var data = await d3.csv(file_location);
    if( selected_year != "all"){
        data = filter_data_by_year(data, selected_year);
    }
    var color_mapping = map_trim_to_color(data);

    //this is the main function that will generate the report.
    d3.select(".graph_containers")
        .append("div")
            .attr("id", "general_depreciation")
            .style("height", "60vh")
            .style("width", "83.5vw")
            .style("background-color", "white")
            .style("margin-left", "10px")
            .style("margin-right", "10px")
            .style("margin-top", "10px")
        .append("div")
            .text("Market Report for " + brand + " " + model)
            .style("padding-left", "10px")
            .style("color", "grey")
        .append("div")
            .attr("id", "trim_list")
            .style("overflow-x", "hidden")
            .style("overflo-y", "auto")
            .style("width", "100%")
            .style("height", "20px")
            .style("font-size", function(){
                if(window.innerWidth >= 1440){
                    return "15px";
                }else{
                    return "1vw";
                }
            })
    
    var element = d3.select("#general_depreciation").node();
    var width = (typeof width !== 'undefined') ? width : element.getBoundingClientRect().width;
    var height = (typeof height !== 'undefined') ? height : element.getBoundingClientRect().height;

    svg_left = (typeof svg_left !== 'undefined') ? svg_left : 60;
    var margin = {};

    if(width < 320){
        margin = {top: 40, right: 20, bottom: 50, left: 40}
    }
    else if(width < 425){
        margin = {top: 40, right: 20, bottom: 45, left: 40}
    }
    else{
        margin = {top: 40, right: 60, bottom: 20, left: svg_left}
    }

    dep_width = parseInt(width) - margin.right,
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
        .attr("x", dep_width - margin.right)
        .attr("y", function(){
            return dep_height - margin.bottom - 30;
        })
        .style("stroke", "black")
        .text("Miles")

    svg_depreciation.append("text")
        .attr("text-anchor", "end")
        .attr("x", margin.left - 10)
        .attr("y", function(){
            return margin.top - 50;
        })
        .style("stroke", "black")
        .text("Price($)");

    update_miles_vs_price(svg_depreciation, margin, data, color_mapping);

    //adding the total vehicle number in US
    var vehicle_for_each_state_container = d3.select(".graph_containers")
        .append("div")
            .style("float", "right")
            .style("background-color", "white")
            .style("height", "30vh")
            .style("width", "60vw")
            .style("margin-right", "10px")
            .style("margin-top", "10px");
    
    vehicle_for_each_state_container
        .append("div")
            .text("Number of " + brand + " " + model + " in Each State")
            .style("padding-left", "10px")
            .style("color", "grey")
        .append("div")
            .attr("class", "trim_in_states")
            .style("height", "27vh")
            .style("width", "100%")

    var h_margin = {
        top: 15,
        right: 20,
        bottom: 50,
        left: 20
    };

    var trim_svg_container = d3.select(".trim_in_states").append("svg")
        .attr('width', d3.select(".trim_in_states").node().getBoundingClientRect().width)
        .attr('height', d3.select(".trim_in_states").node().getBoundingClientRect().height)
        .append("g")
        .attr("transform", "translate(" + h_margin.left + "," + h_margin.top + ")");
    
    update_side_trim_state_bars(trim_svg_container, h_margin, data);
    
    var total_vehicle_display = d3.select(".graph_containers")
        .append("div")
            .style("float", "right")
            .style("background-color", "white")
            .style("height", "6.5vh")
            .style("width", "23vw")
            .style("margin-right", "10px")
            .style("margin-top", "10px")
            .attr("class", "total_display_container")

    var display_height =  d3.select(".total_display_container").node().getBoundingClientRect().height;

    total_vehicle_display.append("div")
        .text("Total " + brand + " " + model + " vehicles on US market")
        .style("padding-left", "10px")
        .style("color", "grey")
        .attr("class", "total_display_title")
        .style("font-size", display_height * 0.2 + "px")

    total_vehicle_display.append("div")
        .html(
            data.length + " vehicles"
        )
        .style("font-size", display_height * 0.4 + "px")
        .style("margin-left", "10px")
        .style("padding-left", "10px")
    
    var total_trim_display = d3.select(".graph_containers")
        .append("div")
            .attr("class", "pie_container")
            .style("float", "right")
            .style("background-color", "white")
            .style("height", "22.5vh")
            .style("width", "23vw")
            .style("margin-right", "10px")
            .style("margin-top", "10px");
    
    total_trim_display.append("div")
        .attr("class", "total_trim_pie_title")
        .text("Each Trim Total Vehicles for " + brand + " " + model)
        .style("padding-left", "10px")
        .style("color", "grey")

    var pie_width = d3.select(".pie_container").node().getBoundingClientRect().width;
    var pie_height = d3.select(".pie_container").node().getBoundingClientRect().height -
        document.getElementsByClassName("total_trim_pie_title")[0].clientHeight;
    var radius = Math.min(pie_width, pie_height) / 2;

    var pie_svg = total_trim_display
        .append("svg")
            .attr("width", pie_width)
            .attr("height", pie_height)
        .append("g")
            .attr("transform", "translate(" + pie_width / 2 + ", " + pie_height / 2 + ")");

    draw_pie_chart(pie_svg, get_total_for_each_trims(data), radius, color_mapping);
}

function make_x_gridlines(x) {		
    return d3.axisBottom(x)
        .ticks(10)
}

function make_y_gridlines(y) {		
    return d3.axisLeft(y)
        .ticks(5)
}

function setup_toggle(trims){
    global_trim_selection = {}
    for(var i = 0; i < trims.length; i++){
        global_trim_selection[trims[i]] = true;
    }
}

function update_trim_selection_for_get_price(data){
    trims = get_unique_trims(data);
    dropdown = d3.select("#select_trim");
    dropdown.selectAll("option").remove().exit();
    var options = dropdown.selectAll("option").data(trims);

    options.enter()
        .append("option")
        .merge(options)
            .text(function(d){
                return (d.charAt(0).toUpperCase() + d.slice(1)).replace("_", " ");
            })
            .attr("value", function(d){
                return d;
            });
}

function update_miles_vs_price(svg_depreciation, margin, data, color_mapping, trim, move=false, refresh=false){
    if(refresh == true){
        svg_depreciation.selectAll(".grid").remove().exit();
        svg_depreciation.selectAll(".y-axis").remove().exit();
        svg_depreciation.selectAll(".x-axis").remove().exit();
        svg_depreciation.selectAll(".linear-line").remove();
        svg_depreciation.selectAll(".log-line").remove();
        d3.selectAll("dot_tooltip").remove().exit();
    }
    var dot_tooltip = d3.select("body").append("div")
        .attr("class", "dot_tooltip")
        .style("position", "absolute");

    if(color_mapping == undefined){
        color_mapping = map_trim_to_color(data);
    }
    
    var trims = get_unique_trims(data);
    var max_y = get_y_max_value(data);
    var max_x = get_x_max_value(data);

    //trim initial setup and toggle
    if(trim == undefined){
        setup_toggle(trims);
        filtered_data = data;
    }else{
        if(global_trim_selection[trim] == true){
            global_trim_selection[trim] = false;
        }else{
            global_trim_selection[trim] = true;
        }
        filtered_data = filter_data_by_selected_trim(data);
    }
    var x = d3.scaleLinear().domain([0, max_x]).range([0, dep_width - margin.left - margin.right]);
    var y = d3.scaleLinear().domain([0, max_y]).range([dep_height - margin.top - margin.bottom, 0]);

    svg_depreciation.append("g")		
        .attr("class", "grid")
        .attr("transform", "translate(0," + dep_height + ")")
        .style("stroke", "lightgrey")
        .style("stroke-opacity", "0.2")
        .call(make_x_gridlines(x)
            .tickSize(-dep_height)
            .tickFormat("")
    )

    svg_depreciation.append("g")			
        .attr("class", "grid")
        .style("stroke", "lightgrey")
        .style("stroke-opacity", "0.2")
        .call(make_y_gridlines(y)
            .tickSize(-dep_width + margin.left + margin.right)
            .tickFormat("")
    )

    svg_depreciation.append("g")
        .attr("class", "y-axis")
        .style("font-size", "10px")
        .call(d3.axisLeft(y));

    svg_depreciation.append("g")
        .attr("class", "x-axis")
        .style("font-size", "10px")
        .attr("transform", "translate(0," + (dep_height - margin.top - margin.bottom)  + ")")
        .call(d3.axisBottom(x));
    
    var circles = svg_depreciation.selectAll("circle")
        .data(filtered_data);
        
    circles.exit().remove();

    if(move == true){
        circles.enter()
            .append("circle")
                .attr("r", 5)
                .style("opacity", "0.8")
            .merge(circles)
                .attr("class", "dot")
                .style("position", "absolute")
                .style("opacity", "0.8")

        svg_depreciation.selectAll("circle")
            .transition()
            .duration(500)
            .attr("cx", function(d) { return x(parseInt(d.Miles))})
            .attr("cy", function(d) { return y(parseInt(d.Price))})
    }
    else{
        circles.enter()
            .append("circle")
                .attr("r", 5)
                .style("opacity", "0")
            .merge(circles)
                .attr("class", "dot")
                .style("position", "absolute")
                .style("opacity", "0")
                .attr("cx", function(d) { return x(parseInt(d.Miles))})
                .attr("cy", function(d) { return y(parseInt(d.Price))})

        svg_depreciation.selectAll("circle")
            .transition()
            .delay(function (d,i) { return (i*3)})
            .duration(1000)
            .style("opacity", "0.8")
    }
        
        
    svg_depreciation.selectAll("circle")
        .attr("fill", function(d) {
            return color_mapping.get(d.Trim);
        })
        .on("mousemove", function(event, d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 10);

            var border_color = color_mapping.get(d.Trim)
            var xPosition = event.clientX + 50;
            var yPosition = window.scrollY + (event.clientY);
            dot_tooltip
                .html(
                    "Trim: " + d.Trim + "</br>" + 
                    "Price: " + d.Price + "</br>" + 
                    "Miles: " + d.Miles + "</br>" +
                    "Year: " + d.Year
                )
                //don't use attr here, use style here.
                .style("display", "inline-block")
                .style("left", xPosition + "px")
                .style("top", yPosition + "px")
                .style("padding", "10px")
                .style("border", "3px solid " + border_color)
                .style("background-color", "#b3b3ff")
                .style("color", "black")
                .style("border-radius", "10px")
                .style("position", "absolute")
            //make the color red when hover
            d3.select(this).attr("fill", "red")
        })
        .on("mouseout", function(event, d) {
            // axis_hover_line.style("opacity", "0")
            // yaxis_hover_line.style("opacity", "0")
            d3.select(this).attr("fill", color_mapping.get(d.Trim))
            dot_tooltip.style("display", "none");
            d3.select(this)
                .transition()
                .duration(500)
                .attr("r", 5);
        })

    d3.selectAll(".each_trim").remove().exit();

    var trim_list_containers = d3.select("#trim_list").selectAll("div")
        .data(trims)
        .enter()
        .append("div")
            .attr("class", "each_trim")
            .style("color", "black")
            .style("border-radius", "10px")
            .style("margin-bottom", "10px")
            .style("background-color", function(d){
                color = color_mapping.get(d);
                res = color.split(",")
                res[res.length - 1] = res[res.length - 1].split(")")[0] + ",0.3)"
                return res.join();
            })
            .style("margin-right", "10px")
            .style("padding-left", "10px")
            .style("float", "left")
            .style("display", "inline-block")
            .style("cursor", "pointer")
            .on("click", function (event, d){
                update_miles_vs_price(svg_depreciation, margin, data, color_mapping=color_mapping, trim=d, move=true, refresh=true);
            });
    
    svg_depreciation.selectAll(".legend_text").remove().exit();

    //adding legend text
    d3.selectAll(".each_trim")
        .append("text")
            .style("margin-right", "10px")
            .text(function (d) { return d;})
            .style("text-decoration", function(d){
                if(global_trim_selection[d] == true){
                    return "none";
                }else{
                    return "line-through";
                }
            })
            .style("text-decoration-color", "red");
        
    //adding linear regression
    new_data = filtered_data.map(d => [parseInt(d.Miles), parseInt(d.Price)])
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
            .style("opacity", "0.7")
            .style("stroke-width", "2px")
            .attr("x1", x(0))
            .attr("y1", y(b))
            .attr("x2", function(){
                if(m < 0){
                    return x((0 - b)/m);
                }
                else{
                    return x(max_x);
                }
            })
            .attr("y2", function(){
                if(m < 0){
                    return y(0);
                }else{
                    return y(m*max_x + b);
                }
            });

    svg_depreciation.append("path")
        .datum(log_data_points)
        .attr("class", "log-line")
        .attr("fill", "none")
        .style("stroke", "steelblue")
        .style("opacity", "0.7")
        .style("stroke-width", "2px")
        .attr("d", d3.line()
            .x(function(d) { return x(d[0]);})
            .y(function(d) { return y(d[1]);})
        )
}

function update_side_trim_state_bars(trim_state_svg_container, h_margin, data){
    var horizontal_state_graph_element = d3.select(".trim_in_states").node();
    var hs_width = horizontal_state_graph_element.getBoundingClientRect().width - h_margin.right - h_margin.left;
    var hs_height = horizontal_state_graph_element.getBoundingClientRect().height;

    var trim_state_width = hs_width - h_margin.right;
    var trim_state_height = hs_height - h_margin.top - h_margin.bottom;

    trim_state_svg_container.append("g")
        .attr("transform", "translate(" + h_margin.left + "," + h_margin.top + ")")
    
    // d3.csv(file_location).then(function(data) {
        var selected_year = document.getElementById('year').value;
        if( selected_year != "all"){
            filtered_data = filter_data_by_year(data, selected_year);
            data = filtered_data;
        }
        trim_state_count_data = get_total_for_each_trim_with_each_state(data);
        
        var y = d3.scaleLinear()
            .range([trim_state_height, 0])
            .domain([0, d3.max(trim_state_count_data, function(d){
                return d.value;
            }) + 10]);

        var x = d3.scaleBand()
            .range([0, hs_width])
            .padding(0.1)
            .domain(d3.map(trim_state_count_data, function(d){
                return d.state;
            }));

        if(trim_state_width <= 425){
            trim_state_svg_container.append("g")
                .attr("transform", "translate(0," + trim_state_height + ")")
                .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("y", -2)
                .attr("x", 15)
                .attr("transform", "rotate(90)")
                
        }else{
            trim_state_svg_container.append("g")
            .attr("transform", "translate(0," + trim_state_height + ")")
            .call(d3.axisBottom(x));
        }

        trim_state_svg_container.append("g")
            .call(d3.axisLeft(y));

        var bars = trim_state_svg_container.selectAll(".bar")
            .data(trim_state_count_data)
            .enter()
            .append("g")

        bars.append("rect")
        .attr("class", "bar")
        .style("fill", "#6666ff")
        .attr("y", function(d){
            return y(0);
        })
        .attr("x", function(d){
            return x(d.state);
        })
        .attr("width", x.bandwidth())
        .attr("height", 0);

        bars.selectAll("rect")
            .transition()
            .duration(4000)
            .attr("y", function(d){
                return y(d.value);
            })
            .attr("height", function(d){ return trim_state_height - y(d.value); })

        bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return trim_state_height;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return x(d.state) + x.bandwidth() / 2 - 6;
            })
        
        bars.selectAll("text")
            .transition()
            .duration(4000)
            .attr("y", function(d) {
                return y(d.value) - 10;
            })
            .tween("text", function(d){
                var i = d3.interpolate(0, d.value)
                return function(t) {
                    d3.select(this).text(
                        parseFloat(i(t)).toFixed(0));
                };
            });

        bars.selectAll("rect")
            .on("mouseover", function(event, d) {
                console.log(d3.select(this));
                d3.select(this).style("fill", "rgba(255, 0, 0, 0.8)")
            })
            .on("mouseout", function(event, d) {
                d3.select(this).style("fill", "#6666ff")
            });
    // })
} 

function draw_pie_chart(svg, data, radius, color_mapping){
    var arc = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var labelArc = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d.value });
    
    var g = svg.selectAll(".arc")
        .data(pie(data))
    .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .style("fill", function(d){ return color_mapping.get(d.data.trim) });

    g.append("text")
        .attr("transform", function(d) {
            return "translate(" + labelArc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .text(function(d) { return d.data.trim; })
}