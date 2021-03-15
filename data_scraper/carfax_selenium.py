from selenium import webdriver
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.action_chains import ActionChains
from webscraper_utils import GeneralUtils
from tqdm import tqdm

import time, os, json
import csv
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
        self.carfax.maximize_window()
        self.carfax.get(self.carfax_link)
        self.vehicle_history_data = {}
        self.vin_numbers = {}
  
        btn = self.carfax.find_elements_by_class_name("button--green")
        btn[0].click()
        time.sleep(2)
    
    def close_browser(self):
        self.carfax.close()
        self.carfax.quit()
    
    def return_vin_numbers(self, filename=None):
        if filename:
            pretty_json_content = json.dumps(self.vin_numbers, indent=4)
            with open(filename, 'w') as fp:
                fp.write(pretty_json_content)
        return self.vin_numbers
    
    def search(self, make, model, zip_code):
        select_make = Select(self.carfax.find_elements_by_class_name("search-make")[0])
        if not select_make:
            self.close_browser()
            raise Exception("Selecting Make Box wasn't found!")
        select_make.select_by_value(make)
        time.sleep(1)

        select_model = Select(self.carfax.find_elements_by_class_name("search-model")[0])
        if not select_model:
            self.close_browser()
            raise Exception("Selecting Model Box wasn't found!")
        select_model.select_by_value(model)

        zip_code_input = self.carfax.find_elements_by_class_name("search-zip")[0]
        if not zip_code_input:
            self.close_browser()
            raise Exception("ZIP Code Input Box wasn't found!")
        zip_code_input.send_keys(zip_code)

        start_searching_btn = self.carfax.find_elements_by_class_name("search-submit")[0]
        if not start_searching_btn:
            self.close_browser()
            raise Exception("Search Button after selecting model and make is not found")
        start_searching_btn.click()

        time.sleep(5)
        
        start_show_me_btn = self.carfax.find_elements_by_xpath("//button[contains(@class, 'button large primary-green')]")
        #start_show_me_btn = self.carfax.find_elements_by_xpath(("primary-green")
        if not start_show_me_btn:
            self.close_browser()
            raise Exception("Show me green button is not seeing through webscraping method.")
        start_show_me_btn[0].click()
        time.sleep(2)
    
    def check_search_range_miles_value(self, value):
        range_values = ["10", "25", "50", "75", "100", "150", "200", "250", "500", "3000"]
        if str(value) not in range_values:
            raise Exception("The value you chose {} for search range miles is not part of the list: {}".format(value, range_values))
    
    def get_total_pages(self):
        pages = self.carfax.find_elements_by_class_name("pagination__list-item")
        if not pages or len(pages) == 1:
            #needs to fix this later on the way..
            return 2
        last_page = pages[-1]
        last_page = GeneralUtils.getonly_numbers(last_page.text)
        print("Total Pages: {}".format(last_page))
        return int(last_page)
    
    def apply_search_range(self, search_range_miles):
        import pdb; pdb.set_trace()
        self.check_search_range_miles_value(value=search_range_miles)
        #search_radius_box = Select(self.carfax.find_elements_by_class_name("form-control.search-radius")[0])
        search_radius_box = Select(self.carfax.find_elements_by_xpath("//*[contains(@class, 'form-control search-radius')]")[0])
        search_radius_box.select_by_value(search_range_miles)
        #search_button = self.carfax.find_elements_by_class_name("button.expanded.searchForm-submit-btn")[0]
        search_button  = self.carfax.find_elements_by_xpath("//*[contains(@class, 'button expanded searchForm-submit-btn')]")[0]
        self.carfax.execute_script("arguments[0].click();", search_button)
        time.sleep(2)
    
    def get_miles_and_prices(self, trim):
        #TODO: Currently the miles are not grepping well. Requires miles to grep well that's consider N/A
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
                tmp_dict['Trim'] = trim
                self.data.append(tmp_dict)
    
    def perform_scraping_each_page(self, trim=None):
        total_page_to_flip = self.get_total_pages()
        count_pages = 0
        with tqdm(total=total_page_to_flip-1) as pbar:
            for i in range(total_page_to_flip-1):
                action = ActionChains(self.carfax)
                self.get_miles_and_prices(trim=trim)
                pbar.update(1)
                count_pages += 1
                if count_pages == total_page_to_flip-1:
                    break

                next_btn = self.carfax.find_elements_by_class_name("pagination__button--right")
                action.move_to_element(next_btn[0]).click().perform()
                time.sleep(2)

    #TODO: You have to flip the page also for vehicle data history report..
    def show_progress(
        self,
        no_accident,
        get_accident_report=False,
        service_history=False,
        trim=None,
        search_range_miles="3000",
        apply_search_range=True
        ):
        if apply_search_range:
            self.apply_search_range(
                search_range_miles=search_range_miles
            )
        
        #applying filter
        self.apply_filters(
            no_accident=no_accident,
            service_history=service_history
        )

        trims = self.get_all_trims(trim=trim)

        if not trims:
            print("Performing scraping without trims")
            self.perform_scraping_each_page()
        else:
            for each_trim in trims:
                str_trim = each_trim.get_attribute('id').split("_")[1]
                print("Perform scraping on trim: {}".format(str_trim))
                self.apply_trim(trim_name=str_trim)

                #check if get_accident_report
                if get_accident_report and no_accident:
                    self.get_vehicle_history_data(trim=str_trim)
                else:
                    self.perform_scraping_each_page(trim=str_trim)

                #click again to remove from the filter
                self.apply_trim(trim_name=str_trim)

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
  
    def apply_filters(self, no_accident, service_history):
        """
        Later you can add more filters here.
        """
        action = ActionChains(self.carfax)
        if no_accident:
            no_acc_obj = self.carfax.find_elements_by_xpath("//span[contains(@class, 'srp-filter--text')][contains(text(), 'No Accidents or Damage')]")
            if not no_acc_obj:
                raise Exception("Couldn't find the no acccident or damage reported button on the carfax website")
            action.move_to_element(no_acc_obj[0]).click().perform()
        time.sleep(3)
        if service_history:
            self.click_on_service_hisotry_checkmark()
        time.sleep(3)
    
    def get_trim_obj_by_name(self, trim_name):
        trims = self.carfax.find_elements_by_xpath("//span[contains(@id, 'trimFilter_')][contains(@class, 'srp-filter--fancyCbx')]")
        if not trims:
            raise Exception("Failed to get trims list from get_trim_obj_by_name() function")
        for each_trim in trims:
            if trim_name in each_trim.get_attribute('id'):
                return each_trim
    
    def get_all_trims(self, trim):
        trim_level_title = self.carfax.find_elements_by_xpath("//h4[contains(@class, 'srp-filter--title')][contains(text(), 'Trim Level')]")
        if trim_level_title:
            trims = self.carfax.find_elements_by_xpath("//span[contains(@id, 'trimFilter_')][contains(@class, 'srp-filter--fancyCbx')]")
            if trim:
                #get that trim only
                for each_trim in trims:
                    if each_trim.get_attribute('id') == trim:
                        return [each_trim]
            return trims
        else:
            print("There is no trim level for this search.. Skipping trim section")
            return []
    
    def apply_trim(self, trim_name:str):
        #have to select the trim object again.
        trim_obj = self.get_trim_obj_by_name(trim_name=trim_name)
        action = ActionChains(self.carfax)
        action.move_to_element(trim_obj).click().perform()
        time.sleep(3)
    
    def click_on_service_hisotry_checkmark(self):
        service_history_checkmark = self.carfax.find_elements_by_xpath("//span[contains(@class, 'srp-filter--text')][contains(text(), 'Service History')]")
        if not service_history_checkmark:
            raise Exception("Failed to find the button for service history")
        action = ActionChains(self.carfax)
        action.move_to_element(service_history_checkmark[0]).click().perform()
    
    def click_carfax_report(self):
        self.carfax.switch_to.window(self.carfax.window_handles[1])
        view_carfax_report_btn = self.carfax.find_elements_by_xpath("//a[contains(@class, 'carfax-snapshot-box__button')][contains(text(), 'View FREE CARFAX Report')]")
        action = ActionChains(self.carfax)
        action.move_to_element(view_carfax_report_btn[0]).click().perform()
        time.sleep(3)
        #closing the current tab
        self.carfax.close()
    
    def get_vin(self, trim):
        #there should be 13 objects of vehicle details
        self.carfax.switch_to.window(self.carfax.window_handles[1])
        vin_obj = self.carfax.find_elements_by_class_name("vehicle-info-details")
        vin_number = vin_obj[-3].text
        if not trim in self.vin_numbers:
            self.vin_numbers[trim] = [vin_number]
        else:
            self.vin_numbers[trim].append(vin_number)
    
    def get_vehicle_service_info(self):
        self.carfax.switch_to.window(self.carfax.window_handles[1])
        data_report_rows = self.carfax.find_elements_by_xpath("//div[contains(@class, 'details-row evenrow')] | //div[contains(@class, 'details-row oddrow')]")
        prev_mile = "0"
        for each_row in data_report_rows:
            temp_dict = {}
            mileage_obj = each_row.find_element_by_class_name("mileage")
            miles = DataCleanerUtils.only_number(mileage_obj.text)
            if not miles:
                temp_dict['mileage'] = prev_mile
            else:
                temp_dict['mileage'] = miles

            comments_obj = each_row.find_elements_by_class_name("detail-record-comments-group-inner-line")
            list_of_comments = [each_comment.text for each_comment in comments_obj]
            temp_dict['comments'] = list_of_comments

            if not temp_dict['mileage'] in self.vehicle_history_data:
                self.vehicle_history_data[temp_dict['mileage']] = []
                self.vehicle_history_data[temp_dict['mileage']] = temp_dict['comments']
            else:
                self.vehicle_history_data[temp_dict['mileage']] += temp_dict['comments']
            prev_mile = miles
    
    def get_vehicle_history_data(self, trim, history_data=False, vin=True):
        """
            1. Get objects to click for accidents only.
            2. Click the carfax report.
            3. Every Vehicle serviced, get the keyword for replaced.
        """
        total_page_to_flip = self.get_total_pages()
        count_pages = 0
        with tqdm(total=total_page_to_flip-1) as pbar:
            for i in range(total_page_to_flip-1):
                acc_objects = self.carfax.find_elements_by_xpath("//li[contains(@class, 'srp-accident-history-pillar')]")
                for each_acc in acc_objects:
                    action = ActionChains(self.carfax)
                    action.move_to_element(each_acc).click().perform()
                    time.sleep(2)

                    if vin:
                        self.get_vin(trim)
                        
                    elif history_data:
                        self.click_carfax_report()
                        self.get_vehicle_service_info()

                    self.carfax.close()
                    self.carfax.switch_to.window(self.carfax.window_handles[0])
                print(json.dumps(self.vehicle_history_data, indent=4))

                #update pbar
                pbar.update(1)
                count_pages += 1
                if count_pages == total_page_to_flip-1:
                    break
                
                next_btn = self.carfax.find_elements_by_class_name("pagination__button--right")
                action = ActionChains(self.carfax)
                action.move_to_element(next_btn[0]).click().perform()
                time.sleep(2)
        
    
