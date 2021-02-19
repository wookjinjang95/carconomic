from carmd import CarMD
import json
import os



list_of_vin = [
    "WDDSJ4GB1JN609502", "WDDSJ4EB7JN583717", "WDDSJ4EB1JN551877",
    "WDDSJ4EB0JN585437", "WDDSJ4EB5JN609926", "WDDSJ4EB8KN767162",
    "WDDSJ4EB1JN603735", "WDDSJ4EB8EN047168", "WDDSJ4EB1JN591392",
    "WDDSJ4EB9JN675671"
]
# for each_vin in list_of_vin:
#     my_vehicle = car.vin("WDDSJ4EB6GN358441")
#     data_file_location = os.path.join(
#         "maintenance_data", "benz_cla250", "{}.json".format(each_vin))
#     with open(data_file_location, 'w') as fp:
#         my_vehicle = car.vin(each_vin)
#         data = my_vehicle.maintenance_list()
#         pretty_format = json.dumps(data, indent=4)
#         fp.write(pretty_format)

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
        result.append((desc, prob, len(desc_list)))

    sorted_result = sorted(result, key=lambda d: d[1], reverse=True)
    return sorted_result

def calculate_prob_for_desc(data):
    result = {}
    for each_mileage, content in data.items():
        result[each_mileage] = count_desc(content['desc'])
    return result   

if __name__ == "__main__":
    data = get_data_from_files()
    data = prep_data_for_prob(data)
    sorted_data = calculate_prob_for_desc(data)
    
