import csv
import json

with open('alc.csv') as f:
    readCSV = csv.reader(f, delimiter=',')
    next(readCSV, None)
    results = []
    row1 = next(readCSV, None)
    name = row1[1]
    lob_name = row1[2]
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
        name = row[1]
        lob_name = row[2]
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


    with open('alc.json', 'w') as outfile:
        json.dump(results, outfile)

    with open('test.json', 'w') as outfile:
        json.dump(results[10], outfile)








        if name != old_name:
            ald = {}
            ald["name"] = name
            ald["out"] = None
            ald["in"] = row[3]
            ald["children"] = []
            lob_name = row[2]
            lob["name"] = lob_name
            lob["in"] = row[5]
            lob["out"] = row[3]
            lob["children"] = []
            lob["children"].append(client)
            if lob_name != old_lob_name:
                lob = {}
                lob["name"] = lob_name
                lob["in"] = row[5]
                lob["out"] = row[3]
                lob["children"] = []
                client = {}
                client["name"] = row[4]
                client["out"] = row[5]
                lob["children"].append(client)
            else:
                client = {}
                client["name"] = row[4]
                client["out"] = row[5]
                lob["children"].append(client)
            old_lob_name = lob_name
            ald["children"].append(lob)
        else:
            lob_name = row[2]
            lob["name"] = lob_name
            lob["in"] = row[5]
            lob["out"] = row[3]
            lob["children"] = []
            lob["children"].append(client)
            if lob_name != old_lob_name:
                lob = {}
                lob["name"] = lob_name
                lob["in"] = row[5]
                lob["out"] = row[3]
                lob["children"] = []
                client = {}
                client["name"] = row[4]
                client["out"] = row[5]
                lob["children"].append(client)
            else:
                client = {}
                client["name"] = row[4]
                client["out"] = row[5]
                lob["children"].append(client)
            old_lob_name = lob_name
            ald["children"].append(lob)
        
        results.append(ald)
                
