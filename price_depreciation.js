
// const fs = require('fs')

// function get_info(myfile){
//     var full_file = 'data_scraper/' + myfile;
//     var rawdata = fs.readFileSync(full_file);
//     var json_data = JSON.parse(rawdata);
//     //json_data = filter_out_correct_data(json_data);
//     console.log(json_data);
//     return json_data;
// }

// function filter_out_correct_data(data){
//     var filtered_array = new Array();
//     data.forEach(function(each_data, index, array){
//         if(!isNaN(each_data['Price'])){
//             filtered_array.push(each_data)
//         }
//     });
//     return filtered_array
// }

// const model3_data = get_info('data.json');
var d3 = require("d3");

var local_data = [
    {
        "Price": "35995",
        "Miles": "23425"
    },
    {
        "Price": "36995",
        "Miles": "24377"
    }
]

var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom

var svg = d3.select("#model3_depreciation")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.json("data_scraper/data.json", function(data){
    //Add X axis
    var x = d3.scaleLinear()
        .domain([0, 100,000])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d4.axisBottom(x));
    
    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 100,000])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    svg.append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return x(d.Miles)})
            .attr("cy", function(d) { return y(d.Price)})
            .attr("r", 1.5)
            .style("fill", "#cc0000")
});
