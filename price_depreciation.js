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
    // const linearRegression = d3.regressionLinear()
    //     .x(d => d.Miles)
    //     .y(d => d.Price)
    //     .domain([-1.7, 16]);

    // var line = d3.line()
    //     .x((d) => x(d.Miles))
    //     .y((d) => y(d.Price));
        
    // var res = linearRegression(data);
    var linearRegression = ss.linearRegression(data.map(d => [d.Miles, d.Price]));
    var linearRegressionLine = ss.linearRegressionLine(linearRegression);
    var regressionPoints = {
        const firstX = data[0].Miles;
        const lastX = data.slice(-1)[0].Price;
        const xCoordinates = [firstX, lastX];

        return xCoordinates.map(d => ({
            x: d,
            y: linearRegressionLine(d)
        }));
    }
    var line = d3.line()
            .x(d => xScale(d.Miles))
            .y(d => yScale(d.Price));


    svg.selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
            .attr("r", 1.5)
            .attr("cx", function(d) { return x(d.Miles)})
            .attr("cy", function(d) { return y(d.Price)})
            .attr("fill", "#9834eb");

    svg.append("line")
        .classed("regressionLine", true)
        .datum(regressionPoints)
        .attr('d', line)
        .style("style-width", 5);
};

var draw = d3.csv("tesla_model_3.csv")
    .then(data =>{
        render(data);
});



