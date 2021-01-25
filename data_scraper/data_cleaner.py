import os
import json

class DataCleanerUtils:
    @staticmethod
    def only_get_prices(data):
        """
            Expected data format
            [
                {"Miles": ...
                 "Price": ...
            ]
        """
        filtered_data = []
        for each_data in data:
            if each_data['Miles'].isnumeric() and each_data['Price'].isnumeric():
                filtered_data.append(each_data)
        return filtered_data
    
    @staticmethod
    def only_get_prices_with_dir(data_dir):
        with open(data_dir, 'r') as fp:
            data = json.load(fp)
        return DataCleanerUtils.only_get_prices(data)