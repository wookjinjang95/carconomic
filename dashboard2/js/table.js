async function generate_data_table(){
    console.log("running table.js")
    d3.select('.graph_containers')
        .style('background-color', 'white')
        .style('position', 'relative')
        .style('z-index', '-1')
        .style('width', '85vw');
    
    var model = document.getElementById('model').value.replace("_", " ");
    var brand = document.getElementById('make').value;
    var selected_year = document.getElementById('year').value;
    d3.select('.graph_containers')
        .append("div")
        .text("Data Table for " + brand + " " + model + " in year " + selected_year)
        .style("color", "grey")

    var file_location = retrieve_data_location();
    var data = await d3.csv(file_location);
    var global_regression = await get_global_regression_for_all(data);
    add_raw_data_table('.graph_containers', data, global_regression);
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

function add_raw_data_table(id, data, global_regression){
    console.log(global_regression)
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
    var tfoot = table.append("tfoot")
    var tbody = table.append("tbody")

    //add tfoot
    tfoot.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
            .text(function(d){ return d;})

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
        $("#all_data_table tfoot th").each(function(){
            var title = $(this).text();
            $(this).html( '<input type="text" placeholder="Filter By '+title+'" />' );
        });

        var data_table = $("#all_data_table").DataTable({
            // "responsive": true,
            "scrollX": true
        });

        data_table.columns().every( function () {
            var that = this;
            $( 'input', this.footer()).on( 'keyup change', function () {
                that
                    .search( this.value )
                    .draw();
            });
        });
    });
}

var global_regression = {};