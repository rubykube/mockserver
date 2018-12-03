var http = require('http');
var mockserver = require('mockserver');
 
http.createServer(mockserver('src/mocks')).listen(9001);
