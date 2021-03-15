var draw = d3.csv("data_scraper/bmw_data/bmw_m3.csv")
    .then(data =>{
        render(data, "#bmw_m3_depreciation");
    });