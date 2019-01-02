#!/usr/bin/env node
const http = require('http');
const mockserver = require('mockserver');
const SlangerMock = require('./slanger');
const argv = require('yargs').argv;
const colors = require('colors');
const httpPort = argv.p || argv.port || 9001;
const wsPort = argv.wsPort || 9002;
const help = argv.h || argv.help;
const verbose = true;

const markets = [
  "ETH/ZAR",
  "BTC/ZAR",
  "BCH/ZAR",
  "BCH/BTC",
  "ETH/BTC",
  "XRP/BTC",
  "LTC/BTC"
]

if (help) {
  console.log([
    "Usage:",
    "  index.js [ARGS]",
    "",
    "Options:",
    "  -p, --port=PORT  - Port for the http server to listen on",
    "  --ws-port=PORT   - Port for the websocket to listen on",
  ].join("\n"));
} else {
  http.createServer(mockserver("src/mocks", verbose)).listen(httpPort, (error) => {
    if (error) {
      console.log("Unhandled exception", error);
      return;
    }

    if (verbose) {
      console.log('Mockserver serving mocks {'
                  + 'verbose'.yellow + ':' + (verbose && 'true'.green || 'false')
                  + '} ' + `http://localhost:${httpPort}`.green);
    }
  })

  new SlangerMock(wsPort, markets);
}
