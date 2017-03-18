import csv
import math
import collections
import operator

songs = {}

tags = {}

years = collections.defaultdict(list)

locseq = collections.defaultdict(list)

def loadFile(path,container,notation):
	print('load data ... ')
	with open(path,'r+') as datafile:
		reader = csv.reader(datafile,delimiter='\t')
		for row in reader:
			if notation is None: temp = row
			else: temp = ''.join(row).split(notation)
			container.update({temp[0]:temp[1:len(temp)]})

def outputFile(path,container):
	print('write data ... ')
	f = open(path,'w+')
	w = csv.writer(f,delimiter=',')
	w.writerows(container)
	f.close()

def main():

	yrlist = []
	loclist = []


	loadFile("files/FilteredTrackIdAndTags.csv",tags,None)

	loadFile("files/TrackIdAndInformation.csv",songs,",")

	count = 0
	for key, value in songs.items():
		temp = years.get(value[0])
		if temp is None: temp = [];
		tagarr = tags.get(key)
		if tagarr is not None:
			count+=1;
			print(count)
			for tag in tagarr: temp.append(tag)
			if value[6] =='' : years.update({value[0]+",None":temp})
			else: years.update({value[0]+","+value[6]:temp})
	
	for key, value in years.items():
		temp = {}
		ehyr = []
		yrAndlocal = key.replace('"',"").split(",")
		print(yrAndlocal)
		for k in yrAndlocal:
			ehyr.append(k)
		for tag in value:
			freq = temp.get(tag)
			if freq is not None: temp.update({tag:freq+1})
			else : temp.update({tag:0})

		if key == '2011': continue;
		length = len(temp)
		if length > 10 : length = 10
		for i in range(1):
			fretag = max(temp.items(), key=operator.itemgetter(1))[0]
			del temp[fretag]
			ehyr.append(fretag)
		yrlist.append(ehyr)
		#print(ehyr)

	yrlist = sorted(yrlist, key = operator.itemgetter(0))

	length = 0

	for row in yrlist:
		val = locseq.get(row[1])
		if val is None: val = []
		val.append(row[2])
		locseq.update({row[1]:val})
		#if la is None:

	for k,v in locseq.items():
		tmp = [];
		tmp.append(k);
		for vs in v:
			tmp.append(vs)
		loclist.append(tmp);

	outputFile("files/LocationAndTagsPerYear.csv",loclist)

main()