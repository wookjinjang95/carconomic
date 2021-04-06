import csv
import os
import json


class MaintenanceDataGenerator:
    @staticmethod
    def get_data_from_csvfile(csv_filename, trim=None):
        data = []
        first_time = True
        with open(csv_filename, newline='') as csvfile:
            csv_reader = csv.reader(csvfile, delimiter=' ', quotechar='|')
            
            for row in csv_reader:
                if first_time:
                    first_time = False
                else:
                    temp_dict = {}
                    content = row[0].split(",")
                    temp_dict['Price'] = content[0]
                    temp_dict['Miles'] = content[1]
                    temp_dict['Trim'] = content[2]
                    data.append(temp_dict)
        return data
    
    @staticmethod
    def write_on_csv_format(data, output_filename="maintenance_data/benz_cla250/report.csv"):
        headers = ['mileage', 'average', 'max', 'min']
        with open(output_filename, "w", newline='') as fp:
            dict_writer = csv.DictWriter(fp, headers)
            dict_writer.writeheader()
            for mileage, content in data.items():
                tmp_dict = {
                    'mileage': mileage,
                    'average': content['average'],
                    'max': content['max'],
                    'min': content['min']
                }
                dict_writer.writerow(tmp_dict)

    @staticmethod
    def get_the_maintenance_data(jsondir, trim=None):
        result = {}
        json_files = [os.path.join(jsondir, f) for f in os.listdir(jsondir) if ".json" in f]
        for each_json_file in json_files:
            with open(each_json_file, "r") as fp:
                content = json.load(fp)
                content = content['data']
                for each_data in content:
                    if not each_data['due_mileage'] in result:
                        result[each_data['due_mileage']] = [each_data['repair']['total_cost']]
                    else:
                        result[each_data['due_mileage']].append(each_data['repair']['total_cost'])
        return result
    
    @staticmethod
    def get_insight_each_due_mileage(m_data):
        new_data = {}
        for mileage, costs in m_data.items():
            new_data[mileage] = {}
            new_data[mileage]['average'] = sum(costs) / len(costs)
            new_data[mileage]['max'] = max(costs)
            new_data[mileage]['min'] = min(costs)
        return new_data

    @staticmethod
    def output_csvfile(csv_filename, trim=None):
        pass

    @staticmethod
    def compute_total_cost(maintenance_data, depreciation_data):
        pass

if __name__=="__main__":
    # d_data = MaintenanceDataGenerator.get_data_from_csvfile(
    #     csv_filename="cla_data.csv")
    m_data = MaintenanceDataGenerator.get_the_maintenance_data(
        jsondir="maintenance_data/benz_cla250"
    )
    insight_data = MaintenanceDataGenerator.get_insight_each_due_mileage(m_data)
    MaintenanceDataGenerator.write_on_csv_format(insight_data)
