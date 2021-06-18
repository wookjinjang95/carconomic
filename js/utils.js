function calculate_cost(global_regression, x_axis){
    new_data = {};
    cost_max = 0;
    cost_min = 0;
    ticks = x_axis.ticks();
   
    //generate the points
    for(var trim in global_regression){
        if( global_regression[trim]['points'].length < 2) {
            continue;
        }
        new_data[trim] = [];
        a = global_regression[trim].equation[0]; 
        b = global_regression[trim].equation[1];
        for(var i = 0; i < ticks.length; i++){
            if(i == 0){
                new_data[trim].push([0,0])
            }
            else{
                if(i == 1){
                    zero_point = get_the_first_point(global_regression[trim])
                    prev_value = zero_point[1]
                    curr_value = a + (b*Math.log(ticks[i]))
                }else{
                    prev_value = a + (b*Math.log(ticks[i-1]))
                    curr_value = a + (b*Math.log(ticks[i]))
                }
                point = [ticks[i], prev_value - curr_value];
                if( (prev_value - curr_value) > cost_max) cost_max = prev_value - curr_value;
                if( (prev_value - curr_value) < cost_min) cost_min = prev_value - curr_value;
                new_data[trim].push(point);
            }
        }
    }
    return new_data, cost_max, cost_min;
}

function get_the_first_point(log_equation){
    points = log_equation.points;
    sorted_points = points.sort( function (a,b){
        if( a[0] == b[0] ) return 0;
        return a[0] < b[0] ? -1 : 1;
    })
    return sorted_points[0]
}

function get_x_max_value(data){
    var max = d3.max(data.map(function (d) { return parseInt(d.Miles)}));
    return max + 10000;
}

function get_y_max_value(data){
    var max = d3.max(data.map(function (d) { return parseInt(d.Price)}));
    return max + 10000;
}

function regression(data) {
    var sum_x = 0, sum_y = 0
      , sum_xy = 0, sum_xx = 0
      , count = 0
      , m, b;
  
    if (data.length === 0) {
      throw new Error('Empty data');
    }
  
    // calculate sums
    for (var i = 0, len = data.length; i < len; i++) {
      var point = data[i];
      sum_x += point[0];
      sum_y += point[1];
      sum_xx += point[0] * point[0];
      sum_xy += point[0] * point[1];
      count++;
    }
  
    // calculate slope (m) and y-intercept (b) for f(x) = m * x + b
    m = (count * sum_xy - sum_x * sum_y) / (count * sum_xx - sum_x * sum_x);
    b = (sum_y / count) - (m * sum_x) / count;
    return [m,b];
}

function logarithmic(data) {
    var sum = [0, 0, 0, 0], n = 0, results = [];

    for (len = data.length; n < len; n++) {
      if (data[n][1] != null) {
        sum[0] += Math.log(data[n][0]);
        sum[1] += data[n][1] * Math.log(data[n][0]);
        sum[2] += data[n][1];
        sum[3] += Math.pow(Math.log(data[n][0]), 2);
      }
    }

    var B = (n * sum[1] - sum[2] * sum[0]) / (n * sum[3] - sum[0] * sum[0]);
    var A = (sum[2] - B * sum[0]) / n;

    for (var i = 0, len = data.length; i < len; i++) {
        var coordinate = [data[i][0], A + B * Math.log(data[i][0])];
        results.push(coordinate);
    }

    var string = 'y = ' + Math.round(A*100) / 100 + ' + ' + Math.round(B*100) / 100 + ' ln(x)';

    return {equation: [A, B], points: results, string: string};
}

function map_trim_to_color(data){
    var trims = get_unique_trims(data);
    var mapping = new Map();
    for(var i = 0; i < trims.length; i++){
        r = Math.floor(Math.random() * Math.floor(256));
        g = Math.floor(Math.random() * Math.floor(256));
        b = Math.floor(Math.random() * Math.floor(256));
        mapping.set(trims[i], 'rgb(' + r + ',' + g + ',' + b + ')');
    }
    return mapping;
}

function get_unique_trims(data){
    var trims = [];
    for(var i = 0; i < data.length; i++){
        if(!trims.includes(data[i].Trim)){
            trims.push(data[i].Trim)
        }
    }
    return trims;
}

function numberWIthCommas(num){
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}