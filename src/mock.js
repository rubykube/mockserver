const http = require('http');
const mockserver = require('mockserver');

class Mock {
    constructor (version, port, verbose = true) {
        http.createServer(mockserver(`src/mocks-${version}`, verbose)).listen(port, (error) => {
            if (error) {
                console.log(`Mock server ${version} unhandled exception`, error);
                return;
            }

            if (verbose) {
                const url = `http://0.0.0.0:${port}`.green
                console.log(`Mockserver ${version} serving mocks: ${url}`);
            }
        })
    }
}

module.exports = Mock;
