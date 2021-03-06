import test from 'ava';

var rewire = require("rewire");

var myModule = rewire("../model/contact.js");

var caesarsLoggerMock = {
    log : function(a,b,c,d){}
}

var dbUtilsMock = {
    buildContactInsertStatement : function(a){},
    runQuery : function(a,b,c){},
    buildContactInsertStatementFromFile : function(a,b){}
}

var pgMock ={
    connect : function(a,b){}
}

myModule.__set__("logger", caesarsLoggerMock);
myModule.__set__("dbUtils", dbUtilsMock);
myModule.__set__("pg", pgMock);

test('get contacts',  t => {
    myModule.getContacts(null,null,null);
    t.true(true);
});

test('get Records Before Date And Post To FTP Server', t => {
    myModule.getRecordsBeforeDateAndPostToFTPServer(null,null,new function(a,b,c){});
    t.true(true);
});

test('post Contact', t => {
   myModule.postContact(null,null,null);
   t.true(true);
});

test('upload Contacts', t => {
   myModule.uploadContacts(null);
   t.true(true);
});