async function alert_no_data(){
    var make = document.getElementById('make').value;
    var model = document.getElementById('model').value;
    var file_location = github_url + make + "/" + model + ".csv";

    fetch(file_location).then(response => {
        if(!response.ok){
            alert("No data available for " + make + " " + model);
        }else{
            (async function(){
                await get_global_regression_for_all(file_location);
                update_miles_vs_price(file_location);
                update_side_trim_state_bars(file_location);
                update_side_trim_bars(file_location);
                update_cost_analysis(file_location);
                add_raw_data_table(".raw_data_table_container", file_location);
            })();
        }
    });
}

function filter_data_by_trim(data, trim){
    filtered_data = []
    for(var i = 0; i < data.length; i++){
        if(data[i]['Trim'] == trim){
            filtered_data.push(data[i]);
        }
    }
    return filtered_data;
}

function look_for_y_value_from_log(log_equation, x_value){
    try{
        for(var i = 0; i < log_equation.points.length; i++){
            if(log_equation.points[i][0] == x_value){
                return log_equation.points[i][1];
            }
        }
    } catch (err){
        console.log(err);
        console.log(log_equation);
    }
}

async function get_global_regression_for_all(file_location){
    global_regression = {};
    var data = await d3.csv(file_location);
    unique_trims = await get_unique_trims(data);
    for(var i = 0; i < unique_trims.length; i++){
        filtered_trim_data = filter_data_by_trim(data, unique_trims[i]);
        new_data = filtered_trim_data.map(d => [parseInt(d.Miles), parseInt(d.Price)]);
        regression_line = logarithmic(new_data);
        global_regression[unique_trims[i]] = regression_line
    }
}



function update_model_list(){
    var make = document.getElementById('make').value;
    var data = undefined;
    if(make == "tesla"){
        data = [
            "model_3", "model_s", "model_x"
        ]
    }
    if(make == "bmw"){
        data = [
            "m235i", "m240i", "m340i", "m3", "m4", "m5"
        ]
    }
    if(make == "lamborghini"){
        data = [
            "aventador", "huracan"
        ]
    }
    if(make == "chevrolet"){
        data = [
            "corvette"
        ]
    }
    if(make == "mclaren"){
        data = [
            "720s", "600lt"
        ]
    }
    if(make == "porsche"){
        data = [
            "911", "718_boxster"
        ]
    }
    if(make == "ford"){
        data = [
            "shelby_gt_350", "shelby_gt_500"
        ]
    }
    if(make == "lexus"){
        data = [
            "rc", "lc"
        ]
    }

    var dropdown = d3.select("#model");
    dropdown.selectAll("option").remove().exit();
    var options = dropdown.selectAll("option").data(data);

    options.enter()
        .append("option")
        .merge(options)
            .text(function(d){
                return (d.charAt(0).toUpperCase() + d.slice(1)).replace("_", " ");
            })
            .attr("value", function(d){
                return d;
            });
    
    sessionStorage.setItem("model", $("#model").val());
}

function update_year_selection(){
    var make = document.getElementById('make').value;
    var model = document.getElementById('model').value;
    var file_location = github_url + make + "/" + model + ".csv";
    d3.csv(file_location).then(function(data){
        var unique_years = get_unique_year(data);
        var dropdown = d3.select("#year");
        dropdown.selectAll("option").remove().exit();
        var options = dropdown.selectAll("option").data(unique_years);

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
    data.sort( function( a, b )
    {
        return a.MILES - b.MILES;
    });
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

function get_total_for_each_trim_with_each_state(data){
    result = {};
    for(var i =0; i < data.length; i++){
        if(data[i].State in result){
            result[data[i].State] += 1;
        }else{
            result[data[i].State] = 1;
        }
    }

    list_format = [];
    for(var each_state in result){
        tmp = {"state": each_state, "value": result[each_state]};
        list_format.push(tmp);
    }
    return list_format;
}

var row_position = 0;

function get_background_row_color(){
    var color = "#3d3d4d"
    if(row_position % 2 == 1){
        color = "#454569"
    }
    row_position += 1;
    return color;
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

function filter_data_by_selected_trim(data){
    filtered_data = [];
    for(var i = 0; i < data.length; i++){
        if(global_trim_selection[data[i]['Trim']] == true){
            filtered_data.push(data[i]);
        }
    }
    return filtered_data;
}

function filter_data_by_year(data, year){
    filtered_data = [];
    for(var i = 0; i < data.length; i++){
        if(data[i]['Year'] == year){
            filtered_data.push(data[i])
        }
    }
    return filtered_data;
}

function update_miles_vs_price(file_location, color_mapping, trim, move=false){
    d3.csv(file_location).then(function(data){
        var dot_tooltip = d3.select("body").append("div")
            .attr("class", "dot_tooltip")
            .style("position", "absolute");

        //data filter with given parameter
        var selected_year = document.getElementById('year').value;
        if( selected_year != "all"){
            filtered_data = filter_data_by_year(data, selected_year);
            data = filtered_data;
        }

        if(color_mapping == undefined){
            color_mapping = map_trim_to_color(data);
        }
        var trims = get_unique_trims(data);
        var max_y = get_y_max_value(data);
        var max_x = get_x_max_value(data);

        //trim initial setup and toggle
        if(trim == undefined){
            setup_toggle(trims);
        }else{
            if(global_trim_selection[trim] == true){
                global_trim_selection[trim] = false;
            }else{
                global_trim_selection[trim] = true;
            }
            filtered_data = filter_data_by_selected_trim(data);
            data = filtered_data;
        }
        var x = d3.scaleLinear().domain([0, max_x]).range([0, dep_width]);
        var y = d3.scaleLinear().domain([0, max_y]).range([dep_height - margin.top - margin.bottom, 0]);
    
        svg_depreciation.select(".x-axis").remove();
        svg_depreciation.select(".y-axis").remove();

        svg_depreciation.selectAll(".grid").remove();

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
                .tickSize(-dep_width)
                .tickFormat("")
        )

        svg_depreciation.append("g")
            .attr("class", "y-axis")
            .style("font-size", global_graph_font_size + "px")
            .call(d3.axisLeft(y));

        svg_depreciation.append("g")
            .attr("class", "x-axis")
            .style("font-size", global_graph_font_size + "px")
            .attr("transform", "translate(0," + (dep_height - margin.top - margin.bottom)  + ")")
            .call(d3.axisBottom(x));
        
        var circles = svg_depreciation.selectAll("circle")
            .data(data);
            
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
                    .style("background-color", "lightsteelblue")
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
                    update_miles_vs_price(file_location, color_mapping=color_mapping, trim=d, move=true);
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
    
        d3.selectAll(".log-line").remove();

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
    });
}

function add_raw_data_table(id, file_location){
    if(global_regression == "undefined"){
        console.log("Waiting 3 seconds for the result");
    }
    d3.csv(file_location).then(function(data){
        //adding the title
        var make = document.getElementById('make').value;
        var model = document.getElementById('model').value;
        d3.select("#title_of_raw_table").text(
            "List of All " + make.toUpperCase() + " " + model.toUpperCase().replace("_", " ") + " vehicles in Nation")

        //adding the regression value data
        for(var i = 0; i < data.length; i++){
            y_value = look_for_y_value_from_log(global_regression[data[i].Trim], data[i].Miles)
            if(isNaN(y_value)){
                data[i]['Expected Price'] = "N/A";
                data[i]['Difference'] = "N/A";
            }else{
                data[i]['Expected Price'] = "$ " + y_value.toFixed(0);
                data[i]['Difference'] = data[i]['Price'] - y_value.toFixed(0);
            }
        }

        var columns = [
            "Price", "Expected Price", "Difference", "Miles", "Trim", "Year", "Vin", "City", "State"
        ]
        columns.push("Carfax Link")

        //remove the current table away
        d3.select(id).selectAll("#all_data_table_wrapper").remove().exit()

        var table = d3.select(id).append('table')
            .style("width", "100%")
            .attr("id", "all_data_table")
            .attr("class", "display")

        var thead = table.append("thead")
        var tbody = table.append("tbody")

        // add header row
        thead.append("tr")
        .selectAll("th") 
        .data(columns)
        .enter()
        .append("th")
            .style("padding-left", "10px")
            .style("padding-top", "3px")
            .style("padding-bottom", "3px")
            .text(function(d){ return d;})

        var rows = tbody.selectAll("tr")
            .data(data)
            .enter()
            .append('tr')

        var cells = rows.selectAll("td")
            .data( function (row) {
                return columns.map(function (column) {
                    if(column == "Carfax Link"){
                        return {column: column, value: "https://www.carfax.com/vehicle/" + row['Vin']}
                    }else{
                        return {column: column, value: row[column]};
                    }
                    });
            }).enter()
            .append('td')
                .style("padding-top", "3px")
                .style("padding-bottom", "3px")
                .style("padding-left", "10px")
                .html(function(d) { 
                    if(d.column == "Carfax Link"){
                        return "<a target='_blank' href=" + d.value + ">" + d.value + "</a>";
                    }
                    if(d.column == "Price"){
                        return "$ " + d.value;
                    }
                    if(d.column == "Difference"){
                        if(d.value < 0){
                            d3.select(this).style("color", "green")
                        }else{
                            d3.select(this).style("color", "red")
                            if(d.value != "N/A"){
                                return "+" + d.value;
                            }
                        }
                    }
                    return d.value;
                })

        $(document).ready(function () {
            $("#all_data_table").DataTable({
                "responsive": true,
                "scrollX": true
            });
        });
    });
}

function update_side_trim_state_bars(file_location){
    trim_state_svg_container.selectAll("g").remove();
    trim_state_svg_container.append("g")
        .attr("transform", "translate(" + h_margin.left + "," + h_margin.top + ")")
    
    d3.csv(file_location).then(function(data) {
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
        
        // trim_state_svg_container.append("g")
        //     .attr("transform", "translate(0," + trim_state_height + ")")
        //     .call(d3.axisBottom(x));

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
        .style("fill", "steelblue")
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
                d3.select(this).style("fill", "steelblue")
            });
    })
} 

function update_side_trim_bars(file_location){
    trim_svg_container.selectAll("g").remove();
    trim_svg_container.append("g")
        .attr("transform", "translate(" + h_margin.left + "," + h_margin.top + ")");

    d3.csv(file_location).then(function(data) {
        //data filter with given parameter
        var selected_year = document.getElementById('year').value;
        if( selected_year != "all"){
            filtered_data = filter_data_by_year(data, selected_year);
            data = filtered_data;
        }

        //adding the total of trims section
        trim_count_data = get_total_for_each_trims(data);

        var x = d3.scaleLinear()
            .range([0, trim_width])
            .domain([0, d3.max(trim_count_data, function(d) {
                return d.value;
            })]);
        
        var y = d3.scaleBand()
            .rangeRound([trim_height, 0])
            .padding(0.1)
            .domain(d3.map(trim_count_data, function(d){
                return d.trim;
            }));

        trim_svg_container.append("g")
            .attr("transform", "translate(0," + trim_height + ")")
            .call(d3.axisBottom(x));
      
        // add the y Axis
        trim_svg_container.append("g")
            .call(d3.axisLeft(y));
      
        var bars = trim_svg_container.selectAll(".bar")
            .data(trim_count_data)
            .enter()
            .append("g")

        bars.append("rect")
            .attr("class", "bar")
            .style("fill", "steelblue")
            .attr("y", function(d) {
                return y(d.trim);
            })
            .attr("x", 0)
            .attr("height", y.bandwidth())
            .attr("width", function(d){
                return 0
            });

        bars.selectAll("rect")
            .transition()
            .duration(4000)
            .attr("width", function(d){
                return x(d.value);
            })

        bars.append("text")
            .attr("class", "label")
            //y position of the label is halfway down the bar
            .attr("y", function (d) {
                return y(d.trim) + y.bandwidth() / 2 + 4;
            })
            //x position is 3 pixels to the right of the bar
            .attr("x", function (d) {
                return 3;
            })
        
        bars.selectAll("text")
            .transition()
            .duration(4000)
            .attr("x", function(d) {
                return x(d.value) + 3;
            })
            .tween("text", function(d){
                var i = d3.interpolate(0, d.value)
                return function(t) {
                    d3.select(this).text(
                        parseFloat(i(t)).toFixed(0));
                };
            });
    });
}

function update_cost_analysis(file_location){
    d3.csv(file_location).then(function (data){
        var cost_tooltip = d3.select("body").append("div")
            .attr("class", "cost_tooltip")
            .style("position", "absolute");
        
        //data filter with given parameter
        var selected_year = document.getElementById('year').value;
        if( selected_year != "all"){
            filtered_data = filter_data_by_year(data, selected_year);
            data = filtered_data;
        }

        var own_mapping = map_trim_to_color(data);

        //add the x-axis and y-axis
        var max_x = get_x_max_value(data);
        var x = d3.scaleLinear().domain([0, max_x]).range([0, c_dep_width]);
        (async function(){
            var new_data, cost_max, cost_min = await calculate_cost(global_regression, x);
        })();

        var y = d3.scaleLinear().domain([cost_min, cost_max]).range([c_dep_height - margin.top - margin.bottom, 0]);

        cost_svg.selectAll(".y-axis").remove();
        cost_svg.selectAll(".x-axis").remove();

        cost_svg.append("g")
            .attr("class", "y-axis")
            .style("font-size", global_graph_font_size + "px")
            .call(d3.axisLeft(y));

        cost_svg.append("g")
            .attr("class", "x-axis")
            .style("font-size", global_graph_font_size + "px")
            .attr("transform", "translate(0," + (c_dep_height - margin.top - margin.bottom)  + ")")
            .call(d3.axisBottom(x));

        d3.selectAll(".curve-line").remove();
        d3.selectAll(".cost-label").remove();

        for(trim in new_data){
            text_position_element = new_data[trim][1]
            cost_svg.append("path")
                .datum(new_data[trim])
                .attr("class", "curve-line")
                .attr("fill", "none")
                .style("stroke", function(){
                    return own_mapping.get(trim);
                })
                .style("opacity", "0.7")
                .style("stroke-width", "2px")
                .attr("d", d3.line()
                    .x(function(d) { return x(d[0]);})
                    .y(function(d) { return y(d[1]);})
                    .curve(d3.curveCatmullRom));

            cost_svg.append("text")
                .attr("class", "cost-label")
                .attr("transform", "translate (" +  x(text_position_element[0]) + ", " + (y(text_position_element[1]) - 5) + ")")
                .attr("text-anchor", "start")
                .text(trim)
                .style("fill", own_mapping.get(trim));
        }


        all_points = []
        for(var trim in new_data){
            for(var i = 0; i < new_data[trim].length; i++){
                all_points.push(new_data[trim][i])
            }
        }

        var circles  = cost_svg.selectAll("circle")
            .data(all_points);

        circles.exit().remove();

        circles.enter()
            .append("circle")
                .attr("r", 5)
                .style("opacity", 0.5)
                .style("fill", "steelblue")
            .merge(circles)
                .attr("class", "dot")
                .style("position", "absolute")
                .style("opacity", 0.5)
                .attr("cx", function(d) { return x(parseInt(d[0]))})
                .attr("cy", function(d) { return y(parseInt(d[1]))})

        cost_svg.selectAll("circle")
                .on("mousemove", function(event, d) {
                    var xPosition = event.clientX + 50;
                    var yPosition = window.scrollY + (event.clientY);
                    cost_tooltip
                        .html(
                            "Cost: " + d[1].toFixed(0) + "</br>" + 
                            "Miles: " + d[0] + "</br>"
                        )
                        //don't use attr here, use style here.
                        .style("display", "inline-block")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .style("padding", "10px")
                        .style("background-color", "lightsteelblue")
                        .style("border-radius", "7px")
                        .style("position", "absolute")
                })
                .on("mouseout", function(event, d) {
                    cost_tooltip.style("display", "none");
                });
    });
}

function update_search_selection(){
    update_model_list();
    update_year_selection();
}


make = document.getElementById('make').value;
model = document.getElementById('model').value;
var global_trim_selection = {};


//global variable for depreciation equation
var global_regression = {};

var element = d3.select("#general_depreciation").node();
width = (typeof width !== 'undefined') ? width : element.getBoundingClientRect().width;
height = (typeof height !== 'undefined') ? height : element.getBoundingClientRect().height;

svg_left = (typeof svg_left !== 'undefined') ? svg_left : 60;

var margin = {};
var global_graph_font_size = 10;

if(width < 320){
    margin = {top: 40, right: 20, bottom: 50, left: 40}
    global_graph_font_size = 6;
}
else if(width < 425){
    margin = {top: 40, right: 20, bottom: 45, left: 40}
}
else{
    margin = {top: 40, right: 60, bottom: 50, left: svg_left}
}

dep_width = parseInt(width) - margin.left - margin.right,
dep_height = parseInt(height) - margin.top - margin.bottom

var svgContainer = d3.select("#general_depreciation")
var svg_depreciation = svgContainer
    .attr("class", "graph")
    .append("svg")
        .attr("width", dep_width)
        .attr("height", dep_height)
        // .attr("viewBox", '0 0 ' + dep_width + " " + dep_height)
        // .call(d3.zoom().on("zoom", function(event){
        //     svg_depreciation.attr("transform", event.transform);
        // }))
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")")

svg_depreciation.append("text")
    .attr("text-anchor", "end")
    .attr("x", dep_width - 60)
    .attr("y", function(){
        if(width < 320){
            return dep_height - 60;
        }
        return dep_height - 40;
    })
    .style("stroke", "black")
    .text("Miles")

svg_depreciation.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.left - 20)
    .attr("y", function(){
        return margin.top - 60;
    })
    .style("stroke", "black")
    .text("Price($)");

//starting here is the horizontal bar trim graph
var h_margin = {
    top: 15,
    right: 50,
    bottom: 50,
    left: 70
};

var horizontal_graph_element = d3.select(".trim_total_info").node();
var h_width = horizontal_graph_element.getBoundingClientRect().width;
var h_height = horizontal_graph_element.getBoundingClientRect().height;

var trim_width = h_width - h_margin.left - h_margin.right;
var trim_height = h_height - h_margin.top - h_margin.bottom;

var trim_svg_container = d3.select(".trim_total_info").append("svg")
    .attr('width', h_width)
    .attr('height', h_height)
    .append("g")
    .attr("transform", "translate(" + h_margin.left + "," + h_margin.top + ")");

//starting here is the horizontal bar trim for each state
var horizontal_state_graph_element = d3.select(".trim_in_states").node();
var hs_width = horizontal_state_graph_element.getBoundingClientRect().width;
var hs_height = horizontal_state_graph_element.getBoundingClientRect().height;

var trim_state_width = hs_width - h_margin.right;
var trim_state_height = hs_height - h_margin.top - h_margin.bottom;

var trim_state_svg_container = d3.select(".trim_in_states")
    .append('svg')
        .attr("viewBox", "0 0 " +  (hs_width +  50) + " " + hs_height)
    .append("g")
    .attr("transform", "translate(" + 30 + "," + 0 + ")");

//starting here is the cost vs miles graph
var cost_element = d3.select(".cost_analysis_container").node();
c_width = cost_element.getBoundingClientRect().width;
c_height = cost_element.getBoundingClientRect().height;

c_dep_width = undefined;
c_dep_height = undefined;

if(width < 320){
    c_dep_width = c_width - margin.left - margin.right + 30;
    c_dep_height = c_height - margin.top - margin.bottom - 60;
}
else if(width < 425){
    c_dep_width = c_width - margin.left - margin.right + 40;
    c_dep_height = c_height - margin.top - margin.bottom - 70;
}
else{
    c_dep_width = c_width - margin.left - margin.right + 30;
    c_dep_height = c_height - margin.top - margin.bottom - 20;
}

var costSvgContainer = d3.select("#cost_analysis")
var cost_svg = costSvgContainer
    .attr("class", "graph")
    .append("svg")
        .attr("viewBox", "0 0 " +  (c_dep_width + 70) + " " + c_dep_height)
        // .attr("width", c_dep_width)
        // .attr("height", c_dep_height)
        // .call(d3.zoom().on("zoom", function(event){
        //     svg_depreciation.attr("transform", event.transform);
        // }))
    .append("g")
        .attr("transform", 
            "translate(" + (margin.left + 10) + "," + margin.top + ")")

cost_svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", c_dep_width - 20)
    .attr("y", function(){
        if(width > 320 && width < 425){
            return c_dep_height - 50;
        }
        return c_dep_height - 60;
    })
    .style("stroke", "black")
    .text("Miles")

cost_svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", margin.left - 20)
    .attr("y", margin.top - 60)
    .style("stroke", "black")
    .text("Cost ($)");

if(width <= 425){
    alert("For better and full experience, Carconomics recommend using either tablet or computer");
}

// var github_url = "https://raw.githubusercontent.com/wookjinjang95/wookjinjang95.github.io/main/data/";
var github_url = "data/";
var file_location = github_url + make + "/" + model + ".csv";
var maintenance_file_loation = github_url +"maintenance_data/" + make + "_" + model + "/report.csv";

// get_global_regression_for_all(file_location);
// update_miles_vs_price(file_location);
// update_side_trim_bars(file_location);
// update_cost_analysis(file_location);
// // update_maintenance_bar_graph(maintenance_file_loation);
// add_raw_data_table(".raw_data_table_container", file_location);