import csv
import math
import hdf5_getters
import operator

tagsWithId = {}

similarsWithId = {}

dellist = []

def loadFile(path,container):
	print('load data ... ')
	with open(path,'r+') as datafile:
		reader = csv.reader(datafile,delimiter='\t')
		for row in reader:
			temp = ''.join(row).split(",")
			container.update({temp[0]:temp[1:len(temp)]})

def outputFile(path,container):
	print('write data ... ')
	with open(path, 'w+') as f:
		writer = csv.writer(f, delimiter='\t')
		for key, value in tagsWithId.items():
			value.insert(0, key)
			writer.writerow(value)
		
	f.close()

def main():
	loadFile("TrackIdAndSimilars.csv",similarsWithId)

	loadFile("TrackIdAndTags.csv",tagsWithId)

	count = 0
	for key, value in tagsWithId.items():
		if value[0] == '':
			tempTags = []
			tempSimilars = similarsWithId.get(key)
			for SongKey in tempSimilars:
				if SongKey == '': break;
				if tagsWithId.get(SongKey) is not None:
					tempTags = [] + tagsWithId.get(SongKey)
			if not tempTags or tempTags[0] =='':
				dellist.append(key)
				count+=1
				print(count)
			else: tagsWithId.update({key:tempTags})
	
	for idx in dellist:
		del tagsWithId[idx]

	outputFile("FilteredTrackIdAndTags.csv",tagsWithId)

main()