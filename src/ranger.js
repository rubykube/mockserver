const WebSocket = require('ws');
const Helpers = require('./helpers')

const tickersMock = (ws, markets) => () => {
  ws.send(JSON.stringify(["global.tickers", Helpers.getTickers(markets)]));
};

// Example: ["btcusd.update",{"asks":[["1000.0","0.1"]],"bids":[]}]
const orderBookUpdateMock = (ws, marketId) => () => {
  ws.send(JSON.stringify([`${marketId}.update`, Helpers.getOrderBook()]))
};

class RangerMock {
  constructor(port, markets) {
    const wss = new WebSocket.Server({ port: port });
    const url = `ws://0.0.0.0:${port}`.green
    console.log(`Ranger: listening on ${url}`);

    wss.on('connection', function connection(ws) {
      console.log("Ranger: connection accepted");
      ws.timers = [];
      ws.timers.push(setInterval(tickersMock(ws, markets), 3000));
      markets.forEach((name) => {
        let {baseUnit, quoteUnit, marketId} = Helpers.getMarketInfos(name);
        ws.timers.push(setInterval(orderBookUpdateMock(ws, marketId), 3000));
      });

      // TODO: Mock trades events
      ws.on('message', function incoming(message) {
        if(message.length === 0)
          return;
        try {
          console.log('Ranger: received: %s', message);
          var payload = JSON.parse(message);

          if ("jwt" in payload) {
            if (payload["jwt"] === "Bearer null") {
              ws.send(JSON.stringify({"error":{"message":"Authentication failed."}}));
            } else {
              ws.send(JSON.stringify({"success":{"message":"Authenticated."}}));
              // TODO: Mock user own trades events
            }

          }
        } catch (err) {
          console.log(`Ranger: Something went wrong: ${err}`);
        }
      });

      ws.on('close', () => {
        console.log('Ranger: connection closed');
        if(ws.timers) {
          ws.timers[channel].forEach((t) => {
            clearInterval(t);
          })
        }
      });
    });

  }
}
module.exports = RangerMock;
