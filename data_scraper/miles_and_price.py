from carfax_selenium import CarFaxScraper
import argparse

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("-z", "--zip", required=True, dest="zipcode")
    parser.add_argument("-m", "--model", required=True, dest="model")
    parser.add_argument("-ma", "--make", required=True, dest="make")
    parser.add_argument('-f', "--outputfile", required=True, dest="outputfile")
    parser.add_argument('-mi', "--miles", required=False, dest="miles")
    parser.add_argument('-na', "--no-accident", required=False, dest="no_accident")
    parser.add_argument('-t', "--trim", required=False, dest="trim")
    options = parser.parse_args()
    options = vars(options)
    if not options['miles']:
        options['miles'] = "3000"
    if not options['no_accident']:
        options['no_accident'] = True
    return options
    
if __name__ == "__main__":
    #Testing code: python miles_and_price.py -z 95116 -m 'Model 3' -ma Tesla -f tesla_model_3.csv
    options = get_args()
    carfax_obj = CarFaxScraper()
    carfax_obj.search(
        make=options['make'],
        model=options['model'],
        zip_code=options['zipcode']
    )
    carfax_obj.show_progress(
        no_accident=options['no_accident'],
        search_range_miles=options['miles'],
        trim=options['trim']
    )
    carfax_obj.produce_data(
        filename=options['outputfile'], 
        output_type="csv"
    )
    carfax_obj.close_browser()