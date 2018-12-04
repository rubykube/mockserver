var http = require('http');
var mockserver = require('mockserver');
var argv = require('yargs').argv;
var colors = require('colors')
var port = argv.p || argv.port || 9001;
var help = argv.h || argv.help;
var verbose = true;

if (help) {
  console.log([
    "Usage:",
    "  index.js [-q] -p PORT",
    "",
    "Options:",
    "  -p, --port=PORT    - Port to listen on",
    "",
    "Example:",
    "  mockserver -p 8080"
  ].join("\n"));
} else {
  http.createServer(mockserver("src/mocks", verbose)).listen(port, (error) => {
    if (error) {
      console.log("Unhandled exception", error);
      return;
    }

    if (verbose) {
      console.log('Mockserver serving mocks {'
                  + 'verbose'.yellow + ':' + (verbose && 'true'.green || 'false')
                  + '} ' + `http://localhost:${port}`.green);
    }
  })
}
