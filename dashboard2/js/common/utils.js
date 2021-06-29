function remove_the_current_dashboard_graph(){
    d3.select(".graph_containers").remove().exit();
    d3.select(".content")
        .append("div")
            .attr("class", "graph_containers")
            .style("float", "left")
}