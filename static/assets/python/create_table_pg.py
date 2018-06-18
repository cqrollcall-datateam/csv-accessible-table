import datetime

current = str(datetime.datetime.now())

with open(current + ".txt", "w") as ofile:
	ofile.write(current);
ofile.close()