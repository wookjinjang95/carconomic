from carfax_selenium import CarFaxScraper
import argparse

class VehicleHistoryScraper:
    def __init__(self, carfax_obj):
        self.carfax = carfax_obj
    

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
    """
        Example Command
        python vehicle_history.py -z 95116 -mi 50 -m 'CLA' -ma Mercedes-Benz -f tesla_model_3.csv
    """
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
        trim=options['trim'],
        get_accident_report=True,
        service_history=True
    )
    vin_numbers = carfax_obj.return_vin_numbers(filename=options['outputfile'])
    print(vin_numbers)