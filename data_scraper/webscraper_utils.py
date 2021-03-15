import requests

class CarFaxWebScraper:
    @staticmethod
    def request_html_link(html_link):
        page = requests.get(html_link)
        if page.status_code != 200:
            raise Exception("Failed to open the page: {}".format(page.status_code))
        else:
            return page
    
    @staticmethod
    def get_price_and_miles(soup):
        prices = soup.findAll("span", class_="srp-list-item-price")
        info = soup.findAll("span", class_="srp-list-item-basic-info-value")
        result = []
        miles = []
        for each_info in info:
            if "miles" in each_info.text:
                miles.append(each_info)
    
        if len(miles) != len(prices):
            raise Exception("Both miles and price data are not equal length")

        for each_price, mile in zip(prices, miles):
            filtered_price = GeneralUtils.getonly_numbers(each_price.text)
            filtered_mile = GeneralUtils.getonly_numbers(mile.text)
            print("Miles: {}, Prices: {}".format(filtered_mile, filtered_price))
        

class GeneralUtils:
    @staticmethod
    def getonly_numbers(content):
        filtered_content = [s for s in content if s.isdigit()]
        if not filtered_content:
            return content
        return "".join(filtered_content)

if __name__ == "__main__":
    html_link = "https://www.carfax.com/Used-Tesla-Model-3-San-Jose-CA_w9421_c1023"
    raw_html = CarFaxWebScraper.request_html_link(html_link)
    CarFaxWebScraper.get_price_and_miles(soup)
