const WebSocket = require('ws');
const Helpers = require('./helpers')

const tickersMock = (ws, channel, markets) => () => {
  ws.send(JSON.stringify({"event": "tickers","data": Helpers.getTickers(markets),"channel": channel}));
};

const orderBookUpdateMock = (ws, channel) => () => {
  ws.send(JSON.stringify({"event": "update","data": Helpers.getDepth(),"channel": channel}))
};

var tradeId = 100000;
const tradesMock = (ws, channel) => {
  var tradeSide = "buy";
  var price = 0.0001;
  var amount = 0.0001;
  return function () {
    tradeId++;
    tradeSide = tradeSide == "buy" ? "sell" : "buy";
    price += 0.0001;
    amount += 0.00005;
    var data = {
      "trades":
        [
          {
            "tid": tradeId,
            "type": tradeSide,
            "date": Date.now(),
            "price": price.toString(),
            "amount": amount.toString(),
          }
        ]
    }
    ws.send(JSON.stringify({"event": "trades", "data": data, "channel": channel}));
  }
};

class SlangerMock {
  constructor(port, markets) {
    const wss = new WebSocket.Server({ port: port });
    const url = `ws://0.0.0.0:${port}`.green
    console.log(`Slanger: listening on ${url}`);

    wss.on('connection', function connection(ws) {
      console.log("Slanger: connection accepted");
      ws.timers = {};
      ws.on('message', function incoming(message) {
        if(message.length === 0)
          return;
        try {
          console.log('Slanger: received: %s', message);
          var payload = JSON.parse(message);
          var channel = payload["data"]["channel"];
          var timers = [];

          switch (payload["event"]) {
            case "pusher:subscribe":
              ws.send(JSON.stringify({ "event": "pusher_internal:subscription_succeeded", "data": {}, "channel": channel }));
              if (channel === "market-global") {
                timers.push(setInterval(tickersMock(ws, channel, markets), 3000));
              } else {
                if (channel.match(/market-([^-]*)-global/)) {
                  timers.push(setInterval(orderBookUpdateMock(ws, channel), 3000));
                  timers.push(setInterval(tradesMock(ws, channel), 5000));
                }
              }
              break;

            case "pusher:unsubscribe":
              if (ws.timers[channel]) {
                ws.timers[channel].forEach((t) => {
                  clearInterval(t);
                })
              }
              break;
          }
          if (!ws.timers[channel]) {
            ws.timers[channel] = [];
          }
          timers.forEach((timer) => {
            ws.timers[channel].push(timer);
          });
        } catch (err) {
          console.log(`Slanger: Something went wrong: ${err}`);
        }
      });

      ws.send(JSON.stringify({"event":"pusher:connection_established","data":{"socket_id":"5.612235","activity_timeout":120}}));

      ws.on('close', () => {
        console.log('Slanger: connection closed');
        if(ws.timers) {
          for(var channel in ws.timers) {
            ws.timers[channel].forEach((t) => {
              clearInterval(t);
            })
          }
        }
      });
    });

  }
}
module.exports = SlangerMock;
