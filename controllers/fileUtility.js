var jsFtp = require("jsftp");

var convertToNiceFileContent = function(records){
    var fileContent = '';
    fileContent = attachHeader(fileContent);
    for(var i = 0; i < records.length; i++){
        fileContent += records[i].name + '\n';
    }
    return fileContent;
}

var attachHeader = function(fileContent){
    fileContent += 'Name'+'\n';
    return fileContent;
}

exports.saveFileOnFTPServer = function(records, fileName){
    if(records){
        var ftpClient = new jsFtp({host: "speedtest.tele2.net",port: 21,user: "anonymous",pass: "anonymous"});
        var dataToBeSaved = convertToNiceFileContent(records);
        var buffer = Buffer.from(dataToBeSaved);
        var filePath = 'upload/'+fileName;
        ftpClient.put(buffer, filePath, function(hadError) {
          console.log('Transferring file ' + fileName + ' into FTP server')
          if (!hadError){
            console.log("File transferred successfully!");
          } else {
            console.log("Error occured during transfer " + hadError);
          }
        });
    }
}

exports.readFileFromFTPServer = function(fileName){
    var ftpClient = new jsFtp({host: "test.talia.net",port: 21,user: "anonymous",pass: "michal.bluj@wp.pl"});

    var fileContent = "";

    console.log('Retreiveing ' + fileName);

    ftpClient.get(fileName, function(err, socket) {

        console.log('err ' + err);

        if (err) {
            return;
        } else {

            socket.on("data", function(d) {
                fileContent += d.toString();
                console.log('file content 111 ' + d.toString());
            });

            socket.on("close", function(hadErr) {
                if (hadErr){
                    console.error('There was an error retrieving the file.');
                }
            });
            socket.resume();
        }
      }
    );
}

