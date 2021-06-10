# #Tesla Data Scraping
python3 miles_and_price.py -z 91214 -m 'Model X' -ma Tesla -f ../dashboard/data/tesla/model_x.csv
python3 miles_and_price.py -z 91214 -m 'Model S' -ma Tesla -f ../dashboard/data/tesla/model_s.csv
# python3 miles_and_price.py -z 91214 -m 'Model 3' -ma Tesla -f ../dashboard/data/tesla/model_3.csv

# # #Porsche Data Scraping
# echo "##### Porsche ######"
# python3 miles_and_price.py -z 91214 -m '911' -ma Porsche -f ../dashboard/data/porsche/911.csv
# python3 miles_and_price.py -z 91214 -m '718 Boxster' -ma Porsche -f ../dashboard/data/porsche/718_boxster.csv

# #Mclaren Data Scraping
echo "##### Mclaren ######"
python3 miles_and_price.py -z 91214 -m '720S' -ma Mclaren -f ../dashboard/data/mclaren/720s.csv
python3 miles_and_price.py -z 91214 -m '600LT' -ma Mclaren -f ../dashboard/data/mclaren/600lt.csv

# #lamborghini
echo "##### Lamborghini ######"
python3 miles_and_price.py -z 91214 -m 'Aventador' -ma Lamborghini -f ../dashboard/data/lamborghini/aventador.csv
python3 miles_and_price.py -z 91214 -m 'Huracan' -ma Lamborghini -f ../dashboard/data/lamborghini/huracan.csv

# #chevrolet
# echo "##### Chevrolet ######"
# python3 miles_and_price.py -z 91214 -m 'Corvette' -ma Chevrolet -f ../dashboard/data/chevrolet/corvette.csv

#bmw
echo "##### BMW ######"
python3 miles_and_price.py -z 91214 -m 'M3' -ma BMW -f ../dashboard/data/bmw/m3.csv
python3 miles_and_price.py -z 91214 -m 'M4' -ma BMW -f ../dashboard/data/bmw/m4.csv
python3 miles_and_price.py -z 91214 -m 'M5' -ma BMW -f ../dashboard/data/bmw/m5.csv
python3 miles_and_price.py -z 91214 -m '3 Series' -ma BMW -f ../dashboard/data/bmw/m340i.csv -t "M340i"
python3 miles_and_price.py -z 91214 -m '2 Series' -ma BMW -f ../dashboard/data/bmw/m235i.csv -t "M235i"
python3 miles_and_price.py -z 91214 -m '2 Series' -ma BMW -f ../dashboard/data/bmw/m240i.csv -t "M240i"

# #Ford Mustang
echo "##### MUSTING ######"
python3 miles_and_price.py -z 91214 -m 'Mustang' -ma Ford -f ../dashboard/data/ford/shelby_gt_350.csv -t "GT350"
python3 miles_and_price.py -z 91214 -m 'Mustang' -ma Ford -f ../dashboard/data/ford/shelby_gt_500.csv -t "GT500"

# Toyota
# echo "##### TOYOTA ######"
# python3 miles_and_price.py -z 91214 -m 'Supra' -ma Toyota -f ../dashboard/data/toyota/supra.csv

python3 miles_and_price.py -z 91214 -m 'LC' -ma 'Lexus' -f ../dashboard/data/lexus/lc.csv
python3 miles_and_price.py -z 91214 -m 'RC' -ma 'Lexus' -f ../dashboard/data/lexus/rc.csv