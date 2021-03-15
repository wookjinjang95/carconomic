var m3 = d3.csv("data_scraper/bmw_data/bmw_m3.csv")
    .then(data =>{
        render(data, "#bmw_m3_depreciation", 60);
    });

var m5 = d3.csv("data_scraper/bmw_data/bmw_m5.csv")
    .then(data => {
        render(data, "#bmw_m5_depreciation", 60);
    });