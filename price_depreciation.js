
const fs = require('fs')

function get_info(myfile){
    var full_file = 'data_scraper/' + myfile;
    var rawdata = fs.readFileSync(full_file);
    var json_data = JSON.parse(rawdata);
    json_data = filter_out_correct_data(json_data);
    console.log(json_data);
    return json_data;
}

function filter_out_correct_data(data){
    var filtered_array = new Array();
    data.forEach(function(each_data, index, array){
        if(!isNaN(each_data['Price'])){
            filtered_array.push(each_data)
        }
    });
    return filtered_array
}
get_info("data.json")