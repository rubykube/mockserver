#!/usr/bin/env node
const { spawn } = require('child_process');
const SlangerMock = require('./slanger');
const RangerMock = require('./ranger');
const colors = require('colors');

const argv = require('yargs').argv;
const apiV1Port = argv.portV1 || 9001;
const apiV2Port = argv.portV2 || 9002;
const slangerPort = argv.slangerPort || 9010;
const rangerPort = argv.rangerPort || 9011;
const help = argv.h || argv.help;

const markets = [
  'BTC/USD',
  'ETH/USD',  
  'BCH/ZAR',
  'ETH/BTC',
  'DASH/BTC',
  'EUR/USD',
]

const startMock = (port, version) => {
  const log = (message) => console.log(`Mock ${version}: ${message}`.trim());
  const mock = spawn("./src/mock.js", ["--port", port, "--dir", `src/mocks-${version}`]);
  mock.stdout.on('data', log);
  mock.stderr.on('data', log);
  mock.on('close', (code) => {
    log(`process exited with code ${code}`.red);
    process.exit();
  });
  return mock;
}

if (help) {
  console.log([
    "Usage:",
    "  index.js [ARGS]",
    "",
    "Options:",
    "  --api-v1-port=PORT   - Port for the v1 API mockserver to listen on",
    "  --api-v2-port=PORT   - Port for the v2 API mockserver to listen on",
    "  --slanger-port=PORT  - Port for Slanger mock to listen on",
    "  --ranger-port=PORT   - Port for Ranger mock to listen on",
  ].join("\n"));
} else {
  const mockV1 = startMock(apiV1Port, "v1")
  const mockV2 = startMock(apiV2Port, "v2")
  new SlangerMock(slangerPort, markets);
  new RangerMock(rangerPort, markets);

  function exitHandler(options, exitCode) {
    mockV1.kill('SIGINT');
    mockV2.kill('SIGINT');
  }
  process.on('exit', exitHandler.bind(null, { cleanup: true }));
}
