#!/usr/bin/env node
const SlangerMock = require('./slanger');
const Mock = require('./mock');
const argv = require('yargs').argv;
const colors = require('colors');
const apiv1Port = argv.p || argv.port || 9001;
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
  new Mock("v1", apiv1Port);
  new SlangerMock(wsPort, markets);
}
