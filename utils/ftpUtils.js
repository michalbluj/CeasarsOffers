var jsFtp = require("jsftp");
var fs = require("fs");
var path = require("path");
var fileUtils = require('./fileUtils.js');
var caesarsLogger = require('./caesarsLogger.js');

var temp_dir = path.join(process.cwd(), 'temp/');

/*
* @description : Saves file on ftp server
* @param records : list of records to be saved in file
* @param fileName : name of the file that should be created
*/
exports.saveFileOnFTPServer = function(records, fileName){
    var startTime = new Date().getTime();
    if(records){
        var connectionParams = connectionParameters();
        var ftpClient = new jsFtp(connectionParams);
        var buffer = Buffer.from(fileUtils.convertToNiceFileContent(records));
        var filePath = 'upload/'+fileName;
        ftpClient.put(buffer, filePath, function(hadError) {
          console.log('Transferring file ' + fileName + ' into FTP server')
          if (!hadError){
            caesarsLogger.log('info','exports.saveFileOnFTPServer','{"timeDiff":"' + new Date().getTime() - startTime + '"}',this.logkey);
            console.log("File transferred successfully!");
          } else {
            caesarsLogger.log('error','exports.saveFileOnFTPServer','{"timeDiff":"' + new Date().getTime() - startTime + '"}',this.logkey);
            console.log("Error occured during transfer " + hadError);
          }
        });
    } else {
        caesarsLogger.log('info','exports.saveFileOnFTPServer','{"timeDiff":"' + new Date().getTime() - startTime + '"}',this.logkey);
    }
}

/*
* @description : Copies file from ftp into heroku temp directory and fires up callback method
* @param fileName : name of the file that should be read
* @param callback : callback method to be invoked after successful upload
*/
exports.readFileFromFTPServer = function(fileName,callback){
    var startTime = new Date().getTime();
    var connectionParams = connectionParameters();
    var ftpClient = new jsFtp(connectionParams);
    var fileContent = "";
    console.log('Start read file from FTP server');

    if (!fs.existsSync(temp_dir)){
        fs.mkdirSync(temp_dir);
    }

    ftpClient.get(fileName, temp_dir+fileName, function(hadErr) {
        if (hadErr){
            console.error('There was an error retrieving the file.');
        } else {
          console.log('File copied successfully!');
          callback(temp_dir+fileName);
        }
    });
}

/*
* @description : Resturns ftp server connection details
*/
var connectionParameters = function(){
    return {host: "speedtest.tele2.net",port: 21,user: "anonymous",pass: "anonymous"};
}