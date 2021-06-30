async function generate_calculator(){
    var model = document.getElementById('model').value.replace("_", " ");
    var brand = document.getElementById('make').value;
    var selected_year = document.getElementById('year').value;
    var file_location = retrieve_data_location();
    var data = await d3.csv(file_location);
    global_regression = await get_global_regression_for_all(data);
    if( selected_year != "all"){
        data = filter_data_by_year(data, selected_year);
    }
    var trims = get_unique_trims(data);
    create_cost_analyzer(trims, brand, model);

    var depreciation_graph_container = d3.select(".graph_containers")
        .append("div")
            .attr("class", "depreciation_graph")
            .style("background-color", "white")
            .style("width", "52vw")
            .style("height", "45vh")
            .style("margin", "10px")
            .style("float", "left")
            .style("display", "inline-block")

    depreciation_graph_container
        .append("div")
            .attr("class", "depreciation_graph_title")
            .text(`Depreciation Cost Report for ${brand} ${model}`)
            .style("color", "grey")
            .style("padding-left", "10px")
    
    var container = d3.select(".depreciation_graph").node();
    var height = container.getBoundingClientRect().height - document.getElementsByClassName("depreciation_graph_title")[0].clientHeight;
    var width = container.getBoundingClientRect().width;

    margin = {
        left: 50,
        top: 40,
        right: 10,
        bottom: 20
    }
    c_dep_width = width - margin.left - margin.right;
    c_dep_height = height - margin.top - margin.bottom;

    var cost_svg = depreciation_graph_container
        .append("svg")
            // .attr("viewBox", "0 0 " +  height + " " + width)
            .attr("width", width)
            .attr("height", height)
        .append("g")
            .attr("transform", 
                "translate(" + (margin.left + margin.right) + "," + margin.top + ")")
        
    cost_svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", c_dep_width - margin.right)
        .attr("y", c_dep_height)
        .style("stroke", "black")
        .text("Miles")
        
    cost_svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", margin.right)
        .attr("y", margin.top - 50)
        .style("stroke", "black")
        .text("Cost ($)");

    update_cost_analysis(cost_svg, data);
    create_market_price_report(trims, brand, model);
}

function create_cost_analyzer(trims, brand, model){
    var cost_analyzer = d3.select(".graph_containers")
        .append("div")
            .attr("class", "cost_analyzer")
            .style("background-color", "white")
            .style("width", "30vw")
            .style("height", "45vh")
            .style("margin", "10px")
            .style("margin-right", "0px")
            .style("float", "left")

    cost_analyzer
        .append("div")
            .attr("class", "cost_analyzer_title")
            .text(`Depreciation Cost Analyzer for ${brand} ${model}`)
            .style("color",  "grey")
            .style("padding-left", "10px")

    // cost_analyzer
    //     .append("p")
    //         .attr("class", "justify-content-center")
    //         .style("color", "grey")
    //         .text("*Starting mileage is a mileage you had when you first purchased the car.")
    //     .append("p")
    //         .attr("class", "justify-content-center")
    //         .style("color", "grey")
    //         .text("*Ending mileage is a mileage you think you will stop driving the vehicle.")
    
    var cost_analyze_selector = cost_analyzer.append("div")
        .attr("class", "row")

    cost_analyze_selector
        .append("div")
            .attr("class", "col")
            .html('\
                <label for="select_trim" style="padding-left: 5%">Trim:</label> \
                <select class="form-select" style="display: inline-block; width: 70%" name="analyze_trim" id="analyze_trim"></select> \
            ')

    cost_analyze_selector.select("#analyze_trim")
        .selectAll("option")
        .data(trims)
        .enter()
        .append("option")
            .text(function (d){
                return (d.charAt(0).toUpperCase() + d.slice(1)).replace("_", " ");
            })
            .attr("value", function(d) { return d; });

    cost_analyze_selector
        .append("div")
            .attr("class", "col d-flex justify-content-center")
            .html('\
                <label for="start_mileage" style="padding-right: 5%">Starting Mileage </label> \
                <input type="text" id="starting_mileage" name="starting_mileage" style="width: 80%"> \
            ')

    cost_analyze_selector
        .append("div")
            .attr("class", "col d-flex justify-content-center")
            .html('\
                <label for="ending_mileage">Ending Mileage </label> \
                <input type="text" id="ending_mileage" name="ending_mileage" style="margin-right: 5%; width: 80%"> \
            ')

    cost_analyzer
        .append("div")
            .attr("class", "analyze_report")
            .style("margin-left", "5%")
            .style("margin-right", "5%")
            .style("margin-top", "3%")
            .style("width", "90%")
            .style("height", "50%")
            .style("overflow-y", "auto")
            .style("border-radius", "10px")
            .style("border-style", "solid")
            .style("border-color", "grey")
            .style("border-width", "thin")

    //generate cost analyzer buttons
    var cost_analyzer_btns = cost_analyzer.append("div")
        .attr("class", "row")
        .style("margin-top", "5%")

    cost_analyzer_btns.append("div")
        .attr("class", "col d-flex justify-content-center")
        .html('<button onclick="calculate_depreciation_cost()" class="btn btn-primary" style="background-color: #33334d">Calculate</button>')

    cost_analyzer_btns.append("div")
        .attr("class", "col d-flex justify-content-center")
        .html('<button onclick="clear_cost_calculation()" class="btn btn-primary" style="background-color: #33334d">Clear Result</button>')
}

function calculate_depreciation_cost(){
    //select the trim, starting mileage, and ending mileage.
    //Calculate the car worth value for starting mileage and ending mileage for that trim.
    //Calculate the difference and show the result.
    var report = d3.select(".analyze_report")
}

function clear_cost_calculation(){
    d3.select(".analyze_report").selectAll("p").remove().exit();
}

function create_market_price_report(trims, brand, model){
    var price_report = d3.select(".graph_containers")
        .append("div")
            .attr("class", "price_reporter")
            .style("width", "83.5vw")
            .style("margin", "10px")
            .style("margin-top", 0)
            .style("height", "45vh")
            .style("background-color", "white")
            .style("float", "left");

    price_report.append("div")
        .attr("class", "depreciation_graph_title")
        .text(`Check Market Price for ${brand} ${model}`)
        .style("color", "grey")
        .style("padding-left", "10px")

    var price_report_desc = price_report.append("div")
        .attr("class", "row")

    price_report_desc.append("div")
        .attr("class","col")
        .append("p")
            .style("color", "red")
            .style("padding-left", "5%")
            .text("Please select trim")

    price_report_desc.append("div")
        .attr("class", "col")
        .append("p")
            .style("color", "red")
            .text("What is the current price of the vehicle you are looking into?")

    price_report_desc.append("div")
        .attr("class", "col")
        .append("p")
            .style("color", "red")
            .text("What is the current mileage of the vehicle?")

    var price_report_selection = price_report.append("div")
        .attr("class", "row")
    
    price_report_selection.append("div")
        .attr("class", "col")
        .html('<label for="select_trim" style="padding-left: 5%;">Choose the Trim: </label> \
        <select class="form-select" style="display: inline-block" name="select_trim" id="select_trim"></select>')

    price_report_selection.append("div")
        .attr("class", "col")
        .html('<label for="Price" style="padding-left: 5%;">Current Price ($): </label><input type="text" id="price_text" name="price_text">')

    price_report_selection.append("div")
        .attr("class", "col")
        .html('<label for="Price" style="padding-left: 5%;">Current Mileage (mi): </label><input type="text" id="mileage_text" name="mileage_text">')

    //populate the choose trim selection
    price_report_selection.select("#select_trim")
        .selectAll("option")
        .data(trims)
        .enter()
        .append("option")
            .text(function (d){
                return (d.charAt(0).toUpperCase() + d.slice(1)).replace("_", " ");
            })
            .attr("value", function(d) { return d; });

    //adding report textbox
    var price_report_textbox = price_report.append("div")
            .attr("class", "report")
            .style("margin-left", "5%")
            .style("margin-right", "5%")
            .style("margin-top", "3%")
            .style("width", "90%")
            .style("height", "35%")
            .style("overflow-y", "auto")
            .style("border-radius", "10px")
            .style("border-style", "solid")
            .style("border-color", "grey")
            .style("border-width", "thin")
        
    //adding buttons
    var price_report_buttons = price_report.append("div")
        .attr("class", "row")
        .style("padding-top", "3%")

    price_report_buttons.append("div")
        .attr("class", "col d-flex justify-content-center")
            .html('<button onclick="generate_report()" class="btn btn-primary" style="background-color: #33334d">Generate Report</button>')
    
    price_report_buttons.append("div")
        .attr("class", "col d-flex justify-content-center")
            .html('<button onclick="clear_report()" class="btn btn-primary" style="background-color: #33334d">Clear Report</button>')
    
}

async function update_cost_analysis(cost_svg, data){
    var cost_tooltip = d3.select("body").append("div")
        .attr("class", "cost_tooltip")
        .style("position", "absolute");

    var own_mapping = map_trim_to_color(data);

    //add the x-axis and y-axis
    var max_x = get_x_max_value(data);
    var x = d3.scaleLinear().domain([0, max_x]).range([0, c_dep_width]);
    var result = await calculate_cost(global_regression, x);
    var new_data = result[0];
    var cost_max = result[1];
    var cost_min = result[2];
    var y = d3.scaleLinear().domain([cost_min, cost_max]).range([c_dep_height - margin.top, 0]);

    cost_svg.selectAll(".y-axis").remove();
    cost_svg.selectAll(".x-axis").remove();

    cost_svg.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(y));

    cost_svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + (c_dep_height - margin.top)  + ")")
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
}

function calculate_cost(global_regression, x_axis){
    new_data = {};
    cost_max = 0;
    cost_min = 0;
    ticks = x_axis.ticks();
   
    //generate the points
    for(var trim in global_regression){
        if( global_regression[trim]['points'].length < 2) {
            continue;
        }
        new_data[trim] = [];
        a = global_regression[trim].equation[0]; 
        b = global_regression[trim].equation[1];
        for(var i = 0; i < ticks.length; i++){
            if(i == 0){
                new_data[trim].push([0,0])
            }
            else{
                if(i == 1){
                    zero_point = get_the_first_point(global_regression[trim])
                    prev_value = zero_point[1]
                    curr_value = a + (b*Math.log(ticks[i]))
                }else{
                    prev_value = a + (b*Math.log(ticks[i-1]))
                    curr_value = a + (b*Math.log(ticks[i]))
                }
                point = [ticks[i], prev_value - curr_value];
                if( (prev_value - curr_value) > cost_max) cost_max = prev_value - curr_value;
                if( (prev_value - curr_value) < cost_min) cost_min = prev_value - curr_value;
                new_data[trim].push(point);
            }
        }
    }
    return [new_data, cost_max, cost_min];
}

function get_the_first_point(log_equation){
    points = log_equation.points;
    sorted_points = points.sort( function (a,b){
        if( a[0] == b[0] ) return 0;
        return a[0] < b[0] ? -1 : 1;
    })
    return sorted_points[0]
}

function clear_report(){
    d3.select(".report").selectAll("p").remove().exit();
}

function get_certain_points(miles, equation) {
    return equation[0] + (Math.log(miles)*equation[1]);
}

function generate_report(){
    var selected_trim = document.getElementById('select_trim').value;
    var price = document.getElementById('price_text').value;
    var mileage = document.getElementById('mileage_text').value;
    
    //replace comma with empty string
    price = price.replace(",", "")
    mileage = mileage.replace(",", "")

    var report = d3.select(".report");
    //check if those are empty or not.
    if(isNaN(mileage) || isNaN(price)){
        report.append("p")
            .style("margin", 0)
            .style("background-color", "rgb(255, 0, 0, 0.5)")
            .html("<a style='color:black'>ERROR: Couldn't generate due to incorrect inputs from either price or mileage. Please check inputs again.</a>")
    }
    else if(mileage == "" || price == ""){
        report.append("p")
            .style("margin", 0)
            .style("background-color", "rgb(255, 153, 0, 0.5)")
            .html("<a style='color:black'>WARNING: Please fill out both mileage and price to generate accurate report</a>")
    }
    else{
         //Check if price is above or below
        expected_price = get_certain_points(mileage, global_regression[selected_trim].equation).toFixed(0)
        price_diff = (price - expected_price).toFixed(0);
        var text_color = "green"
        if(price_diff >= 0){
            text_color = "red"
        }
        price_diff = numberWIthCommas(price_diff);
        
        report.append("p")
            .style("margin", 0)
            .style("background-color", "rgb(0, 204, 0, 0.5)")
            .html(
                "The current vehicle you reported has a price of $" + numberWIthCommas(price) +
                "; however, we expect the price to be estimated $" + numberWIthCommas(expected_price) + "." +
                " That is the price difference of <a style='color:" + text_color + "'>$" + numberWIthCommas(price_diff) + "</a>."
            )
    }
}