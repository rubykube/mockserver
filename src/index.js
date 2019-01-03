#!/usr/bin/env node
const { spawn } = require('child_process');
const SlangerMock = require('./slanger');
const Mock = require('./mock');
const argv = require('yargs').argv;
const colors = require('colors');
const apiV1Port = argv.portV1 || 9001;
const apiV2Port = argv.portV2 || 9002;
const wsPort = argv.wsPort || 9010;
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

const startMock = (port, version) => {
  const log = (message) => console.log(`Mock ${version}: ${message}`.trim());
  const mock = spawn("./src/mock.js", ["--port", port, "--dir", `src/mocks-${version}`]);
  mock.stdout.on('data', log);
  mock.stderr.on('data', log);
  mock.on('close', (code) => log(`process exited with code ${code}`.red));
  return mock;
}

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
  const mockV1 = startMock(apiV1Port, "v1")
  const mockV2 = startMock(apiV2Port, "v2")
  try {
    new SlangerMock(wsPort, markets);
  } catch (error) {
    mockV1.kill();
    mockV2.kill();
    throw(error);
  }
}
