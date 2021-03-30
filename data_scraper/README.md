# Data Scraper

This is the readme section for data scraper. The readme will guide users/developers how to use our data scraper to extract information from websites such as carfax. We also have tutorial how to use CarMD API, which is a vehicle API, which mostly used for maintenance list and maintenance costs.

## Before you start

Before you start, there are things you need to install.

### Carfax Web Scraper

#### Step 1: Installing Chrome Driver
**Selenium** is a python library tool that developers can use to scrape information from website.
Before running selenium, installing chrome driver comes first. If you are using different web browser, you can also install that driver also. However, I prefer Chrome driver since web-scraping will be done much faster. 

**To install the chrome driver, please visit: https://chromedriver.chromium.org/**

**Driver** (ChromeDriver) allows the selenium code to work with web browser to perform any action such as click, searching through the web, and scraping information. 

Once finish installing the driver, **make sure the driver location is the same directory as the selenium python code is.** If they are not in same directory, there is a way for python selenium to find the driver from remote folders. However, it will be extra step and won’t be as easy as putting them together in the same directory.

Lastly, if you are using mac, you need to run the command below

    which chromedriver

The output might look similar as below:

    /usr/local/bin/chromedriver

You can move this chromedriver where our current folder is. To copy the chromedriver to your current folder, you can run the following command below.

    cp /usr/local/bin/chromedriver {your directory}

For example

    cp /usr/local/bin/chromedriver /Users/wookjinjang/Desktop/AIFA/data_scraper

#### Step 2: Installing Selenium

To install selenium for python, please visit this website: https://pypi.org/project/selenium/

#### Step 3: To test
To test to see both selenium and chromedriver is working, please run the command below

    python miles_and_price.py -z 95116 -m 'Model 3' -ma Tesla -f tesla_model_3.csv

## miles_and_price.py 
Parameters
- (-z) --zip: the zipcode (**required**)
- (-m) --model: the model of a vehicle (ex. M3, M5) (**required**)
- (-ma) --make: the maker of a vehicle (ex. Tesla, BMW, etc.) (**required**)
- (-f) --outputfile: the output file (ex. tesla_model_3.csv) (**required**)
- (-mi) --miles: the mile range for search (the default will be 3000, which is unlimited)
- (-na) --no_accident: true or false if you want no accidents search.
- (-t) --trim: trim of the vehicle. (for BMW M3, there are CS and regular trims)

**Example:**
Get miles and price for Tesla Model 3 with zip code 95116 and store the result into 'tesla_model_3.csv'.

    python miles_and_price.py -z 95116 -m 'Model 3' -ma Tesla -f tesla_model_3.csv
    
**Example**
Get miles and price for BMW M3 with only 200 miles range in zipcode 95116

    python miles_and_price.py -z 95116 -m 'M3' -ma BMW -f bmw_m3.csv
    