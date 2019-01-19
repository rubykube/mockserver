const WebSocket = require('ws');
const Helpers = require('./helpers')

function isSubscribed(streams, routingKey) {
  for (const i in streams) {
    if(routingKey.indexOf(streams[i]) != -1) {
      return true;
    }
  }
  return false;
}

const sendEvent = (ws, event) => {
  const routingKey = event[0]
  if(isSubscribed(ws.streams, routingKey)) {
    ws.send(JSON.stringify(event));
  }
}

const tickersMock = (ws, markets) => () => {
  sendEvent(ws, ["global.tickers", Helpers.getTickers(markets)]);
};

/*
  Example: ["btcusd.update",{"asks":[["1000.0","0.1"]],"bids":[]}]
*/
const orderBookUpdateMock = (ws, marketId) => () => {
  sendEvent(ws, [`${marketId}.update`, Helpers.getOrderBook()]);
};

/*
  Success order scenario:
    * Private messages:
      ["order",{"id":758,"at":1546605232,"market":"macarstc","kind":"bid","price":"1.17","state":"wait","volume":"0.1","origin_volume":"0.1"}]
      ["order",{"id":758,"at":1546605232,"market":"macarstc","kind":"bid","price":"1.17","state":"done","volume":"0.0","origin_volume":"0.1"}]
      ["trade",{"id":312,"kind":"bid","at":1546605232,"price":"1.17","volume":"0.1","ask_id":651,"bid_id":758,"market":"macarstc"}]

    * Public messages:
      ["macarstc.trades",{"trades":[{"tid":312,"type":"buy","date":1546605232,"price":"1.17","amount":"0.1"}]}]
*/

let tradeId = 100000;
let orderId = 100;

const matchedTradesMock = (ws, marketId) => {
  let kind = "bid";
  let price = 0.0001;
  let volume = 0.0001;
  return function () {
    orderId++;
    tradeId++;
    kind = kind == "bid" ? "ask" : "bid";
    price += 0.0001;
    volume += 0.00005;
    let bidId = kind == "bid" ? orderId : orderId - 10;
    let askId = kind == "ask" ? orderId : orderId - 10;
    let at = Date.now();
    if (ws.authenticated) {
      sendEvent(ws, ["order",{"id":orderId,"at":at,"market":marketId,"kind":kind,"price":price,"state":"wait","volume":volume,"origin_volume":volume}]);
      sendEvent(ws, ["order",{"id":orderId,"at":at,"market":marketId,"kind":kind,"price":price,"state":"done","volume":"0.0","origin_volume":volume}]);
      sendEvent(ws, ["trade",{"id":tradeId,"kind":kind,"at":at,"price":price,"volume":volume,"ask_id":askId,"bid_id":bidId,"market":marketId}]);
    }
    sendEvent(ws, [`${marketId}.trades`,{"trades":[{"tid":tradeId,"type":kind,"date":at,"price":price,"amount":volume}]}]);
  }
};

class RangerMock {
  constructor(port, markets) {
    this.markets = markets;
    const wss = new WebSocket.Server({ port: port });
    const url = `ws://0.0.0.0:${port}`.green
    console.log(`Ranger: listening on ${url}`);
    const ranger = this;
    wss.on('connection', function connection(ws, request) {
      ranger.initConnection(ws, request);
      ws.on('message', (message) => ranger.onMessage(ws, message));
      ws.on('close', () => ranger.closeConnection(ws));
    });

  }
  initConnection(ws, request) {
    ws.authenticated = false;
    ws.timers = [];
    ws.streams = [];

    console.log(`Ranger: connection accepted, url: ${request.url}`);
    this.subscribe(ws, Helpers.getStreamsFromUrl(request.url));
    ws.timers.push(setInterval(tickersMock(ws, this.markets), 3000));
    this.markets.forEach((name) => {
      let { baseUnit, quoteUnit, marketId } = Helpers.getMarketInfos(name);
      ws.timers.push(setInterval(orderBookUpdateMock(ws, marketId), 3000));
      ws.timers.push(setInterval(matchedTradesMock(ws, marketId), 1000))
    });
  }
  closeConnection(ws) {
    console.log('Ranger: connection closed');
    if (ws.timers) {
      ws.timers.forEach((t) => {
        clearInterval(t);
      })
    }
  }
  onMessage(ws, message) {
    if (message.length === 0)
      return;
    try {
      console.log('Ranger: received: %s', message);
      var payload = JSON.parse(message);

      if ("jwt" in payload) {
        if (payload["jwt"] === "Bearer null") {
          ws.send(JSON.stringify({ "error": { "message": "Authentication failed." } }));
        } else {
          ws.send(JSON.stringify({ "success": { "message": "Authenticated." } }));
          ws.authenticated = true;
        }
      }
      switch (payload["event"]) {
        case "subscribe":
          this.subscribe(ws, payload["streams"]);
          break;

        case "unsubscribe":
          this.unsubscribe(ws, payload["streams"]);
          break;
      }
    } catch (err) {
      console.log(`Ranger: Something went wrong: ${err} (message: ${message})`);
    }

  }
  subscribe(ws, streams) {
    ws.streams = Helpers.unique(ws.streams.concat(streams));
    ws.send(JSON.stringify({ "success": { "message": "subscribed", "streams": ws.streams } }))
  }
  unsubscribe(ws, streams) {
    ws.streams = ws.streams.filter((value) => streams.indexOf(value) === -1);
    ws.send(JSON.stringify({ "success": { "message": "unsubscribed", "streams": ws.streams } }))
  }

}
module.exports = RangerMock;
