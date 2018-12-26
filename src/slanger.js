#!/usr/bin/env node
const WebSocket = require('ws');

const tickersMock = (ws, channel, markets) => () => {
  var tickers = {}
  markets.forEach(name => {
    var pairs = name.split("/");
    var base_unit = pairs[0].toLowerCase();
    var quote_unit = pairs[1].toLowerCase();
    var marketId = `${base_unit}${quote_unit}`
    tickers[marketId] = {
      "name": name,
      "base_unit": base_unit,
      "quote_unit": quote_unit,
      "low": "0.001",
      "high": "0.145",
      "last": "0.134",
      "open": 0.134,
      "volume": "0.0",
      "sell": "0.0",
      "buy": "0.0",
      "at": Date.now()
    }
  });
  ws.send(JSON.stringify({"event": "tickers","data": tickers,"channel": channel}));
};

const orderBookUpdateMock = (ws, channel) => () => {
  var data = {
    "asks": [
      ["0.0005", "97.4"],
      ["2.0", "0.8569"],
      ["2.5", "1.0"],
      ["3.0", "1.0"]
    ],
    "bids": [
      ["0.0001", "10.0"],
      ["0.0000008", "8.9"]
    ]
  }
  ws.send(JSON.stringify({"event": "update","data": data,"channel": channel}))
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
  constructor(wsPort, markets) {
    const wss = new WebSocket.Server({ port: wsPort });
    console.log(`WebSocket listening on ${wsPort}`.green);

    wss.on('connection', function connection(ws) {
      console.log("New connection on websocket");
      ws.timers = {};
      ws.on('message', function incoming(message) {
        if(message.length === 0)
          return;
        try {
          console.log('received: %s', message);
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
          console.log(`Something went wrong: ${err}`);
        }
      });

      ws.send(JSON.stringify({"event":"pusher:connection_established","data":{"socket_id":"5.612235","activity_timeout":120}}));

      ws.on('close', () => {
        console.log('websocket disconnection');
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
