async function generate_calculator(){
    var model = document.getElementById('model').value.replace("_", " ");
    var brand = document.getElementById('make').value;
    var selected_year = document.getElementById('year').value;
    var file_location = retrieve_data_location();
    var data = await d3.csv(file_location);
    if( selected_year != "all"){
        data = filter_data_by_year(data, selected_year);
    }

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
            .text(`Cost Analyzer for ${brand} ${model}`)
            .style("color",  "grey")
            .style("padding-left", "10px")

    var depreciation_graph_container = d3.select(".graph_containers")
        .append("div")
            .attr("class", "depreciation_graph")
            .style("background-color", "white")
            .style("width", "53vw")
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
        left: 40,
        top: 10,
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
                "translate(" + margin.left + "," + margin.top + ")")
        
    cost_svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", c_dep_width)
        .attr("y", c_dep_height)
        .style("stroke", "black")
        .text("Miles")
        
    cost_svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", margin.left + margin.right)
        .attr("y", margin.top + margin.bottom)
        .style("stroke", "black")
        .text("Cost ($)");

    update_cost_analysis(cost_svg, data);
}

function update_cost_analysis(cost_svg, data){
    var cost_tooltip = d3.select("body").append("div")
        .attr("class", "cost_tooltip")
        .style("position", "absolute");

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
        .call(d3.axisLeft(y));

    cost_svg.append("g")
        .attr("class", "x-axis")
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
}