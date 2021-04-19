from carmd import CarMD
import json
import os
import csv


# list_of_vin = [
#     "WDDSJ4GB1JN609502", "WDDSJ4EB7JN583717", "WDDSJ4EB1JN551877",
#     "WDDSJ4EB0JN585437", "WDDSJ4EB5JN609926", "WDDSJ4EB8KN767162",
#     "WDDSJ4EB1JN603735", "WDDSJ4EB8EN047168", "WDDSJ4EB1JN591392",
#     "WDDSJ4EB9JN675671"
# ]

list_of_vin =  [
            "WBS8M9C55J5K98741",
            "WBS8M9C58J5K99771",
            "WBS8M9C52J5J77990",
            "WBS8M9C59J5L01124",
            "WBS8M9C55H5G84069",
            "WBS8M9C57J5K98353",
            "WBS3C9C5XFP803889",
            "WBSKG9C54BE645863",
            "WBS8M9C51J5L00386",
            "WBS8M9C57J5J79170",
            "WBS8M9C52H5G42104",
            "WBSKG9C54CE797966",
            "WBSBF0324SEN91209",
            "WBS8M9C58G5E68375",
            "WBSAK0308KAE33214",
            "WBSPM9C51AE202096"
        ]

def get_data_from_files(dir="maintenance_data/benz_cla250"):
    list_of_data = {}
    files = [f for f in os.listdir(dir) if os.path.isfile(os.path.join(dir, f))]
    for each_file in files:
        vin_number = each_file.split(".")[0]
        filename = os.path.join(dir, each_file)
        with open(filename, 'r') as fp:
            data = json.load(fp)
            list_of_data[vin_number] = data
    return list_of_data

def prep_data_for_prob(data):
    probability_data = {}
    for vin, content in data.items():
        for each_service in content['data']:
            if not each_service['due_mileage'] in probability_data:
                probability_data[each_service['due_mileage']] = {}
                probability_data[each_service['due_mileage']]['desc'] = [each_service['desc']]
                probability_data[each_service['due_mileage']]['cost'] = [each_service['repair']['total_cost']]
            else:
                probability_data[each_service['due_mileage']]['desc'].append(each_service['desc'])
                probability_data[each_service['due_mileage']]['cost'].append(each_service['repair']['total_cost'])
    return probability_data

def count_desc(desc_list):
    count_dict = {}
    for desc in desc_list:
        if not desc in count_dict:
            count_dict[desc] = 1
        else:
            count_dict[desc] += 1
    
    result = []
    for desc, total in count_dict.items():
        prob = float(total/len(desc_list))
        result.append((desc, prob, total, len(desc_list)))

    sorted_result = sorted(result, key=lambda d: d[1], reverse=True)
    return sorted_result

def calculate_prob_for_desc(data):
    result = {}
    for each_mileage, content in data.items():
        result[each_mileage] = count_desc(content['desc'])
    return result

def convert_data_to_csv(data, filename):
    fields = ['miles', 'desc', 'unqiue_total', 'total', 'prob']
    rows = []
    for mile, services in data.items():
        for service in services:
            rows.append(
                [mile, service[0], service[2], service[3], service[1]]
            )
        
    with open(filename, 'w', newline='') as csvfile:
        csv_writer = csv.writer(csvfile, quoting=csv.QUOTE_NONNUMERIC)
        csv_writer.writerow(fields)
        csv_writer.writerows(rows)
        
def csv_for_stacked_data(data, filename):
    header = ['miles']
    unique_services = []
    dict_data_holder = {}
    #getting unqiue description into list
    for _mile, services in data.items():
        for service in services:
            if not service[0] in header:
                new_service = service[0].replace(" ", "_")
                new_service = new_service.replace(",", "_")
                unique_services.append(service[0])
                header.append(service[0])
    
    for service in unique_services:
        dict_data_holder[service] = 0

    formatted_dict = {}
    
    for mile, services in data.items():
        if not mile in formatted_dict:
            formatted_dict[mile] = dict_data_holder.copy()

        for service in services:
            new_service = service[0].replace(" ", "_")
            new_service = new_service.replace(",", "_")
            formatted_dict[mile][service[0]] = service[2]
        
    csv_format_dict = []

    for mile, content in formatted_dict.items():
        temp_dict = {'miles': mile}
        for desc, value in content.items():
            temp_dict[desc] = value
        csv_format_dict.append(temp_dict)
    
    #start storing this format into csv.
    with open(filename, 'w', newline='') as csvfile:
        csv_writer = csv.DictWriter(csvfile, header, quoting=csv.QUOTE_NONNUMERIC)
        csv_writer.writeheader()
        csv_writer.writerows(csv_format_dict)

        

if __name__ == "__main__":
    # car = CarMD("Basic MmI3MzZhODMtMjVlZC00ZjMxLWE0MzktYWQ0ZGVlZDRkZWQ4",
    #         "64f31825775e4c7cbc1cf3870f42fcea")
    # # For fetching maintenance data
    # for each_vin in list_of_vin:
    #     my_vehicle = car.vin(each_vin)
    #     data_file_location = os.path.join(
    #         "maintenance_data", "bmw_m3", "{}.json".format(each_vin))
    #     with open(data_file_location, 'w') as fp:
    #         my_vehicle = car.vin(each_vin)
    #         data = my_vehicle.maintenance_list()
    #         pretty_format = json.dumps(data, indent=4)
    #         fp.write(pretty_format)

    # For generating the bar graph
    # data = get_data_from_files()
    # data = prep_data_for_prob(data)
    # sorted_data = calculate_prob_for_desc(data)
    # csv_for_stacked_data(
    #     data=sorted_data,
    #     filename="benz_cla_stat.csv"
    # )

    # convert_data_to_csv(
    #     data=sorted_data, filename="benz_cla_stat.csv"
    # )
    # with open("benz_cla_stat.json", "w") as fp:
    #     pretty_format = json.dumps(sorted_data, indent=4)
    #     fp.write(pretty_format)
    