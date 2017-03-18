import csv
import math
import hdf5_getters
import operator

print("loading...")
h5 = hdf5_getters.open_h5_file_read("files/msd_summary_file.h5")
data = []

length = hdf5_getters.get_num_songs(h5)

print("number of songs = ",length)

count = 0;
for i in range(0,length):
	tmp = [];
	if hdf5_getters.get_year(h5,songidx=i) == 0 :
		continue;
	#if math.isnan(hdf5_getters.get_artist_latitude(h5,songidx=i)) and hdf5_getters.get_artist_location(h5,songidx=i) =='':
	#	continue;
	count+=1;
	tmp.append(str(hdf5_getters.get_track_id(h5,songidx=i)).replace("b'","").replace("'",""));	
	tmp.append(hdf5_getters.get_year(h5,songidx=i)); #0
	tmp.append(hdf5_getters.get_song_hotttnesss(h5,songidx=i)); #1
	tmp.append(str(hdf5_getters.get_title(h5,songidx=i)).replace("b'","").replace("'",""));	#2
	tmp.append(str(hdf5_getters.get_artist_id(h5,songidx=i)).replace("b'","").replace("'","")); #3	
	tmp.append(hdf5_getters.get_artist_latitude(h5,songidx=i)); #4
	tmp.append(hdf5_getters.get_artist_longitude(h5,songidx=i)); #5
	tmp.append(str(hdf5_getters.get_artist_location(h5,songidx=i)).replace("b'","").replace("'","")); #6
	tmp.append(str(hdf5_getters.get_artist_name(h5,songidx=i)).replace("b'","").replace("'","")); #7
	tmp.append(str(hdf5_getters.get_song_id(h5,songidx=i)).replace("b'","").replace("'",""));	
	data.append(tmp)
	print(count)

h5.close()
data = sorted(data, key = operator.itemgetter(1))

#print hdf5_getters.get_artist_location(h5,songidx=8540))
print("writing...")

f = open('files/TrackIdAndInformation.csv','w+')
w = csv.writer(f,delimiter=',')
w.writerows(data)
f.close()
