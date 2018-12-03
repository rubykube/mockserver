var http = require('http');
var mockserver = require('mockserver');
const port = 9001;

http.createServer(mockserver('src/mocks')).listen(port, (error) => {
  if (error) {
    console.log("Unhandled exception", error);
    return;
  }

  console.log(`Server is listening on port ${port}`);
})
