from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from webscraper_utils import GeneralUtils
from tqdm import tqdm

import time, os, json
import logging, csv
import argparse
from data_cleaner import DataCleanerUtils


class CarFaxScraper:
    """
        Order of Running CarFaxScraper
        1. Initiate the object
        2. Search
        3. Show Progress
        4. Produce Data
        5. Clean Data
        6. Close the selenium browser
    """
    def __init__(self):
        self.data = []
        self.carfax_link = "https://www.carfax.com/"
        self.carfax = webdriver.Chrome()
        self.action = ActionChains(self.carfax)
        #self.carfax.maximize_window()
        self.carfax.get(self.carfax_link)
        self.carfax.get(self.carfax_link)
        btn = self.carfax.find_elements_by_class_name("button--green")
        btn[0].click()
        time.sleep(2)
    
    def close_browser(self):
        self.carfax.close()
        self.carfax.quit()
    
    def search(self, make, model, zip_code):
        select_make = Select(self.carfax.find_elements_by_class_name("search-make")[0])
        if not select_make:
            raise Exception("Selecting Make Box wasn't found!")
        select_make.select_by_value(make)
        time.sleep(1)

        select_model = Select(self.carfax.find_elements_by_class_name("search-model")[0])
        if not select_model:
            raise Exception("Selecting Model Box wasn't found!")
        select_model.select_by_value(model)

        zip_code_input = self.carfax.find_elements_by_class_name("search-zip")[0]
        if not zip_code_input:
            raise Exception("ZIP Code Input Box wasn't found!")
        zip_code_input.send_keys(zip_code)

        start_searching_btn = self.carfax.find_elements_by_class_name("search-submit")[0]
        if not start_searching_btn:
            raise Exception("Search Button after selecting model and make is not found")
        start_searching_btn.click()

        time.sleep(5)
        start_show_me_btn = self.carfax.find_elements_by_class_name("button.large.primary-green")[0]
        start_show_me_btn.click()
        time.sleep(2)
    
    def check_search_range_miles_value(self, value):
        range_values = ["10", "25", "50", "75", "100", "150", "200", "250", "500", "3000"]
        if value not in range_values:
            raise Exception("The value you chose {} for search range miles is not part of the list: {}".format(value, range_values))
    
    def get_total_pages(self):
        pages = self.carfax.find_elements_by_class_name("pagination__list-item")
        last_page = pages[len(pages) - 1]
        last_page = GeneralUtils.getonly_numbers(last_page.text)
        logging.debug("Total Pages: {}".format(last_page))
        return int(last_page)
    
    def apply_search_range(self, search_range_miles):
        self.check_search_range_miles_value(value=search_range_miles)
        search_radius_box = Select(self.carfax.find_elements_by_class_name("form-control.search-radius")[0])
        search_radius_box.select_by_value(search_range_miles)
        search_button = self.carfax.find_elements_by_class_name("button.expanded.searchForm-submit-btn")[0]
        self.carfax.execute_script("arguments[0].click();", search_button)
        time.sleep(2)
    
    def get_miles_and_prices(self):
        #TODO: Currently the miles are not grepping well. Requires miles to grep well that's consider N/A
            #next_btn = self.carfax.find_elements_by_class_name("pagination__button--right")
            #disabled_btn = self.carfax.find_elements_by_class_name("pagination__button--right.pagination__button--disabled")

            #getting the price objects
            prices = self.carfax.find_elements_by_xpath(
                "//span[contains(text(), '$')][contains(@class, 'srp-list-item-price')] | \
                //span[contains(text(), 'Call for Price')][contains(@class, 'srp-list-item-price')] | \
                //span[contains(text(), 'Request Quote')][contains(@class, 'srp-list-item-price')]")

            #getting the mile objects
            miles = self.carfax.find_elements_by_xpath("//span[contains(text(), 'miles')][contains(@class, 'srp-list-item-basic-info')]")
            if len(prices) != len(miles):
                #Logging error that the length is not equal
                print("The length of prices: {} and miles: {}".format(
                    len(prices), len(miles))
                )
                raise Exception("Both data in prices and miles length does not match")

            for each_price, each_mile in zip(prices, miles):
                tmp_dict = {}
                price = GeneralUtils.getonly_numbers(each_price.text)
                mile = GeneralUtils.getonly_numbers(each_mile.text)
                tmp_dict['Price'] = price
                tmp_dict['Miles'] = mile
                self.data.append(tmp_dict)
    
    def show_progress(self, search_range_miles="3000", apply_search_range=True):
        if apply_search_range:
            self.apply_search_range(
                search_range_miles=search_range_miles
            )
        
        total_page_to_flip = self.get_total_pages()
        count_pages = 0
        with tqdm(total=total_page_to_flip-1) as pbar:
            for i in range(total_page_to_flip-1):
                self.get_miles_and_prices()
                next_btn = self.carfax.find_elements_by_class_name("pagination__button--right")
                self.action.move_to_element(next_btn[0]).click().perform()
                #next_btn[0].click()
                pbar.update(1)
                count_pages += 1
                time.sleep(2)
            
        if count_pages != total_page_to_flip-1:
            raise Exception("Failed to run all pages. Count Page: {}, Total Page: {}".format(
                count_pages, total_page_to_flip
            ))

    def produce_data(self, filename, output_type="json"):
        filtered_data = DataCleanerUtils.only_get_prices(self.data)
        if output_type == "json":
            pretty_json_content = json.dumps(filtered_data, indent=4)
            with open(filename, 'w') as fp:
                fp.write(pretty_json_content)
        elif output_type == "csv":
            keys = filtered_data[0].keys()
            with open(filename, 'w', newline='') as fp:
                dict_writer = csv.DictWriter(fp, keys)
                dict_writer.writeheader()
                dict_writer.writerows(filtered_data)


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("-z", "--zip", required=True, dest="zipcode")
    parser.add_argument("-m", "--model", required=True, dest="model")
    parser.add_argument("-ma", "--make", required=True, dest="make")
    parser.add_argument('-f', "--outputfile", required=True, dest="outputfile")
    parser.add_argument('-mi', "--miles", required=False, dest="miles")
    options = parser.parse_args()
    options = vars(options)
    if not options['miles']:
        options['miles'] = 3000
    return options
    
if __name__ == "__main__":
    options = get_args()
    carfax_obj = CarFaxScraper()
    carfax_obj.search(
        make=options['make'],
        model=options['model'],
        zip_code=options['zipcode']
    )
    carfax_obj.show_progress(
        search_range_miles=options['miles']
    )
    carfax_obj.produce_data(
        filename=options['outputfile'], 
        output_type="csv"
    )
    carfax_obj.close_browser()
