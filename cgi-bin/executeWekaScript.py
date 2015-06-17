#!/usr/bin/python

# Import modules for CGI handling
import cgi, cgitb
import json, sys
from subprocess import call
import time
import os.path

cgitb.enable()

#Load input with JSON format
request = json.load(sys.stdin)

# Get data from fields

script1 = request['script1']
script2 = request['script2']

#File_arff = "arff_file.arff"

inputFile_s1 = request['inputFile_s1']
#script1= "java /usr/share/weka/packages/weka.core.converters.CSVLoader " + "../cgi-data/"+inputFile_s1

with open(inputFile_s1,'w') as f:
    for line in request['data']:
        lineToWrite = ""
        for value in line:
            lineToWrite =  lineToWrite + value + ", "
        f.write(lineToWrite.rstrip(", ")+'\n')

outputFile_s2 = request['nonExistingOutputFile_s2']

with open (request["stdout1"],"w") as fout1:
    call(script1.split(" "),stdout=fout1)

with open (request["stdout2"],"w") as fout2:
    call(script2.split(" "),stdout=fout2)

keepPolling=True

while (keepPolling):
	if (True):
	#if (os.path.isfile(outputFile)):
		keepPolling=False
	time.sleep(0.05)

result=outputFile_s2

print "Content-Type: text/html\n"
print result