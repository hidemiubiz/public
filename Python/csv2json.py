import csv
import json
import sys

#---------------------------------------
# change string(0/1) to Boolean(False/True)
#---------------------------------------
def to_boolean(s):
    if(s == "0"):
        return False
    elif(s=="1"):
        return True
    else:
        raise ValueError("not boolean")


#---------------------------------------
# main
#--------------------------------------
args = sys.argv
jdata = {"field01":"hello", "filed02":"world", "country_records":[]}
r = open(args[1],"r")

d_reader = csv.DictReader(r)
d_list = [row for row in d_reader]

for row in d_list:
    row["population"] = int(row["population"])
    row["capital"] = to_boolean(row["capital"])

jdata["country_records"] = d_list
print(json.dumps(jdata, ensure_ascii=False, indent=2))
