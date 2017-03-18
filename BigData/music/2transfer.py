import csv
import math
import hdf5_getters
import operator

similars = []
tags = []

def loadFile(path,container):
	print('load data ... ')
	with open(path,'r+') as datafile:
		reader = csv.reader(datafile,delimiter='\t')
		for row in reader:
			container.append(row)

def outputFile(path,container):
	print('write data ... ')
	with open(path, 'w+') as f:
		writer = csv.writer(f, delimiter='\t')
		writer.writerows(container)
		
	f.close()

def main():
	for i in range(65,91):
		print(str(chr(i)))
		loadFile("/home/hugo/ddd/music/IdAndSimilars"+str(chr(i))+"/part-00000",similars)
		loadFile("/home/hugo/ddd/music/IdAndSimilars"+str(chr(i))+"/part-00001",similars)
		loadFile("/home/hugo/ddd/music/TestIdAndSimilars"+str(chr(i))+"/part-00000",similars)
		loadFile("/home/hugo/ddd/music/TestIdAndSimilars"+str(chr(i))+"/part-00001",similars)
		loadFile("/home/hugo/ddd/music/IdAndTags"+str(chr(i))+"/part-00000",tags)
		loadFile("/home/hugo/ddd/music/IdAndTags"+str(chr(i))+"/part-00001",tags)
		loadFile("/home/hugo/ddd/music/TestIdAndTags"+str(chr(i))+"/part-00000",tags)
		loadFile("/home/hugo/ddd/music/TestIdAndTags"+str(chr(i))+"/part-00001",tags)

	outputFile("TrackIdAndSimilars.csv",similars)
	outputFile("TrackIdAndTags.csv",tags)

main()