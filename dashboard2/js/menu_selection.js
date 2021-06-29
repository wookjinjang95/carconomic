function change_dashboard_data(selected_menu){
    remove_the_current_dashboard_graph();
    switch (selected_menu) {
        case "general":
            break;
        case "market":
            generate_market_report();
        case "calculate":
            generate_calculator();
        case "cost":
            break;
        case "table":
            generate_data_table();
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
            "m235i", "m240i", "m340i", "m2", "m2_competition", "m3", "m4", "m5"
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
    if(make == "ferrari"){
        data = [
            "458", "488"
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
function retrieve_data_location(){
    var make = document.getElementById('make').value;
    var model = document.getElementById('model').value;
    var github_url = "data/"
    var file_location = github_url + make + "/" + model + ".csv";
    fetch(file_location).then(response => {
        if(!response.ok){
            alert("No data available for " + make + " " + model);
        }
    });
    return file_location;
}

function update_year_selection(){
    var file_location = retrieve_data_location();
    d3.csv(file_location).then(function(data){
        var unique_years = ["all"].concat(get_unique_year(data));
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

function update_search_selection(){
    update_model_list();
    update_year_selection();
}

update_search_selection();