function remove_the_current_dashboard_graph(){
    d3.select(".graph_containers").remove().exit();
    d3.select(".content")
        .append("div")
            .attr("class", "graph_containers")
            .style("float", "left")
    d3.selectAll(".dot_tooltip").remove().exit();
    d3.selectAll(".cost_tooltip").remove().exit();
}

function get_client_ip_address(){
    if(selected_menu != 'general'){
        $.getJSON("https://api.ipify.org?format=json", function(data){
            console.log(data.ip);
            console.log(selected_menu);
        })
    }
}