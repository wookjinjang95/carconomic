var width = 600, height = 800;
var margin = {top: 20, right: 20, bottom: 40, left: 40}
var svg = d3.select("#maintenance_graph")
            .append("svg")
                .attr("width", "100%")
                .attr("height", height + margin.bottom)
            .append("g")
                .attr("transform",
                    "translate(" + margin.right + "," + margin.top + ")");


//this doesn't work because the d3.json has to be list of objects
d3.csv("./data_scraper/benz_cla_stat.csv").then(function(data){
    var subgroups = data.columns.slice(1);
    var groups = d3.map(data, function(d) {return (d.miles)})

    var xScale = d3.scaleBand()
                    .domain(groups)
                    .range([0, width])
                    .padding(0.4);

    var yScale = d3.scaleLinear()
                    .domain([0, 250])
                    .range([height, 0]);
    

    var colorSCale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(subgroups)
    
    //Add x-Axis
    svg.append("g")
        .attr("transform", "translate(" + margin.right + "," + height + ")")
        .call(d3.axisBottom(xScale));

    //Add y-Axis
    svg.append("g")
        .call(d3.axisLeft(yScale))
        .attr("transform", "translate(" + margin.right + ",0)")
    
    // make stacked data
    var stacked_data = d3.stack()
    .keys(subgroups)(data)

    svg.append("g")
        .selectAll("g")
        .data(stacked_data)
        .enter()
        .append("g")
            .attr("fill", function(d) { return colorSCale(d.key)})
            .selectAll("rect")
            .data(function (d) { return d;})
            .enter()
            .append("rect")
                .attr("x", function(d) { return xScale(d.data.miles)})
                .attr("y", function(d) { return yScale(d[1])})
                .attr("height", function(d) { return yScale(d[0]) - yScale(d[1])})
                .attr("width", xScale.bandwidth())
});