import urllib2, urllib
import sys, os, time

# keeps track of when the files were last pushed to the server 
_statusFilename = ".devStatus"
# NOTE: the dev files must always include the file extension as well!  
_devFiles = {"main.js", "instruction.html", "strings.js", "draggableListElements.js", "ex.data.json"}

def readFile(filename):      
    if (not os.path.exists(filename)):
        return None 
    with open(filename, "r") as f:
        return f.read()

def writeToFile(filename, content):
    if (not os.path.exists(filename)):
        return None 
    with open(filename, 'w') as f:
        print("Writing to file now", filename, content)
        f.write(content)

def getFileLastModifiedTime(filename):
    if (not os.path.exists(filename)):
        return None
    return str(os.path.getmtime(filename))

def getFilesToBeUpdated():
    devFilesStatus = parseStatusFile()
    filesToUpdate = set()
    for devFile in _devFiles:
        if (devFile not in devFilesStatus):
            # the developer has never pushed this file to the server
            if (os.path.exists(devFile)):
                filesToUpdate.add(devFile)
        else:
            devFileModifiedTime = getFileLastModifiedTime(devFile)
            if (devFileModifiedTime == None):
                # should not get here unless the developed pushed the file 
                # at some point and then deleted it 
                continue
            if (devFileModifiedTime != devFilesStatus[devFile]):
                # the most updated version has not been pushed to the server
                filesToUpdate.add(devFile)
    return filesToUpdate

def updateStatusFile(currentStatus, filesUpdated):
    newContent = ""
    for devFile in _devFiles:
        if (devFile in filesUpdated):
            # a new version of the file was pushed to the server
            lastVersion = getFileLastModifiedTime(devFile)
            fileStatus = devFile + "," + lastVersion + "\n"
            newContent += fileStatus
        elif (devFile in currentStatus):
            # file exists but wasn't recently modified
            fileStatus = devFile + "," + currentStatus[devFile] + "\n"
            newContent += fileStatus
    if ("exerciseKey" in currentStatus):
        newContent = "exerciseKey" + "," + currentStatus["exerciseKey"] + \
                     "\n" + newContent
    writeToFile(_statusFilename, newContent) 

def parseArguments(args):
    # while this currently only parses the key from the command line input, it 
    # can easily be extended to obtain other passed arguments as this becomes 
    # a more robous script
    cmdArgs = dict()
    if "-k" in args:
        keyIndex = args.index("-k")
        if (keyIndex + 1 < len(args)):
            cmdArgs["exerciseKey"] = args[keyIndex + 1]
    return cmdArgs

# reads the status file, which indicates what version of each file was last 
# pushed to the server. This function creates a dictionary with filenames as 
# keys and version of the file last pushed to the server as value
def parseStatusFile():
    status = dict()
    content = readFile(_statusFilename)
    if (content == None):
        # status file did not exist before, create one
        with open(_statusFilename, 'w') as f:
            return status
    for line in content.splitlines():
        # key should probably be the first line
        entries = line.split(",")
        filename = entries[0]
        lastUpdatedTime = entries[1] 
        status[filename] = lastUpdatedTime
    return status

def constructPostRequestData(filesToUpdate, exerciseKey):
    data = {"key": exerciseKey}
    for devFile in _devFiles:
        #fileExtensionStart should never be -1, since all the files in 
        #_devFiles include the file extension as well
        fileExtentionStart = devFile.find(".")
        filename = devFile[ : fileExtentionStart]
        if (devFile in filesToUpdate):
            data[filename] = readFile(devFile)
        else:
            data[filename] = None
    encodedArgs = urllib.urlencode(data)
    return encodedArgs

def constructSucessReply(filesUpdated):
    s = "The following files were successfully updated: "
    for filename in filesUpdated:
        s += filename + "\n"
    return s

def main():
    cmdArgs = parseArguments(sys.argv)
    statusFileContent = parseStatusFile()
    exerciseKey = None
    if "exerciseKey" in cmdArgs:
        exerciseKey = cmdArgs["exerciseKey"]
        # save the exercise hash code so that developers don't have to provide
        # it every time they run the script 
        statusFileContent["exerciseKey"] = exerciseKey
    else:
        if ("exerciseKey" in statusFileContent):
            # we have saved the exercise hash code from previous 
            # script executions
            exerciseKey = statusFileContent["exerciseKey"]
    # no exercise key was provided, can't move forward
    if (exerciseKey == None):
        print('Invalid input: No exercise key provided. Type the following:' \
              '\npython devScript.py -k exerciseKey')
        return

    filesToUpdate = getFilesToBeUpdated()
    if (len(filesToUpdate) == 0):
        print("The files in the server are up to date. No changes detected")
        return

    #construct the POST request     
    data = constructPostRequestData(filesToUpdate, exerciseKey)
    url = "http://cmu-unlocked.herokuapp.com/update-exercise"

    try:
        response = urllib2.urlopen(url, data)
        print("Updating status file", statusFileContent)
        updateStatusFile(statusFileContent, filesToUpdate)
        # indicate to the user what files were updated
        print(constructSucessReply(filesToUpdate))
    except urllib2.HTTPError as e:
        print("Failed to upload the files. Server error code: %d and message %s", 
              e.code, e.reason)
        return

if __name__ == "__main__":
    main()    