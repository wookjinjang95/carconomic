
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
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom

var svg = d3.select("#model3_depreciation")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");

var x = d3.scaleLinear().domain([0, 100000]).range([0, width]);
var y = d3.scaleLinear().domain([0, 100000]).range([height, 0]);

svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));
svg.append("g").call(d3.axisLeft(y));

//note that when you are selectall, you have to pass the entire array
const render = data => {
    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("r", 1.5)
            .attr("cx", function(d) { return x(d.Miles)})
            .attr("cy", function(d) { return y(d.Price)})
            .attr("fill", "#9834eb")
}

const linear_regression = data => {

}

var data = d3.csv("data.csv")
    .then(data =>{
        render(data);
});



