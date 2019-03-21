import csv
import json

def capitalize_names(name):
    return " ".join([x.capitalize() for x in name.split(" ")])


with open('data/alc.csv') as f:
    readCSV = csv.reader(f, delimiter=',')
    next(readCSV, None)
    results = []
    row1 = next(readCSV, None)
    name = capitalize_names(row1[1])
    lob_name = capitalize_names(row1[2])
    contrib = int(float(row1[3]))
    client_name = row1[4]
    comp = int(float(row1[5]))

    ald = {}
    ald["name"] = name
    ald["out"] = None
    ald["in"] = contrib
    ald["children"] = []

    lob = {}
    lob["name"] = lob_name
    lob["in"] = comp
    lob["out"] = contrib
    lob["children"] = []

    client = {}
    client["name"] = client_name
    client["in"] = None
    client["out"] = comp
    lob["children"].append(client)

    old_name = name
    old_lob_name = lob_name

    for row in readCSV:
        name = capitalize_names(row[1])
        lob_name = capitalize_names(row[2])
        contrib = int(float(row[3]))
        client_name = row[4]
        comp = int(float(row[5]))
        #print(name, lob_name, contrib, client, comp)
        client = {}
        client["name"] = client_name
        client["in"] = None
        client["out"] = comp
        if lob_name == old_lob_name:
            lob["children"].append(client)
            lob["in"] += comp
        else:
            ald["children"].append(lob)
            if name == old_name:
                #print(ald)
                ald["in"] += contrib                
            else:
                results.append(ald)
                #print(results)
                ald = {}
                ald["name"] = name
                ald["out"] = None
                ald["in"] = contrib
                ald["children"] = []
            lob = {}
            lob["name"] = lob_name
            lob["in"] = comp
            lob["out"] = contrib
            lob["children"] = []
            lob["children"].append(client)
            old_name = name
        old_lob_name = lob_name


    with open('data/alc3.json', 'w') as outfile:
        json.dump(results, outfile)

    with open('data/test2.json', 'w') as outfile:
        json.dump(results[10], outfile)

