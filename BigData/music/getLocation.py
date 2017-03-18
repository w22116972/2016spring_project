
import requests
import codecs
import json
import csv

"""
print r.status_code
print r.headers
print r.content
"""

reslist = []
content = {}

def loadFile(path,container):
	print('load data ... ')
	with open(path,'r+') as datafile:
		reader = csv.reader(datafile,delimiter=',')
		for row in reader:
			container.append(row)

def main():
	loadFile("files/TagsWithYear.csv",reslist)
	for r in reslist:
		q = getRequest(r[1],0)
		print(q)
		#if r[1] == 'None' or r[1] == 'none': continue;
	

def getRequest(keyword,count):
	count+=1;
	res = requests.get("http://maps.google.com/maps/api/geocode/json?address="+keyword)
	string = res.content.decode("utf-8")
	obj = json.loads(string)
	result = obj.get("results")
	if len(result) < 1 and count < 100:
		return getRequest(keyword,count)
		#print(r[1],result)
	elif len(result) < 1:
		return False
	else: return (result[0].get("geometry").get("location"))

def saveJson(data,path):
	with open(path, "w") as outfile:
		json.dump(data, outfile, indent=4)

main()