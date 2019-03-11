const Helpers = {
    getMarketInfos: (marketName) => {
        let pairs = marketName.split("/");
        let baseUnit = pairs[0].toLowerCase();
        let quoteUnit = pairs[1].toLowerCase();
        let marketId = `${baseUnit}${quoteUnit}`;
        return {
            baseUnit,
            quoteUnit,
            marketId,
        }
    },


    getTickers: (markets, prevPrice, price) => {
        let tickers = {};
        markets.forEach(name => {
            let { baseUnit, quoteUnit, marketId } = Helpers.getMarketInfos(name);
            const change = (price - prevPrice) / price;
            const signPrefix = change >= 0 ? '+' : '';

            tickers[marketId] = {
                "name": name,
                "base_unit": baseUnit,
                "quote_unit": quoteUnit,
                "low": "0.001",
                "high": "0.145",
                "last": price,
                "open": 0.134,
                "volume": "0.0",
                "sell": "0.0",
                "buy": "0.0",
                "avg_price": "0.0",
                "price_change_percent": `${signPrefix}${change.toFixed(2)}%`,
                "at": Date.now() / 1000,
            }
        });
        return tickers;
    },
    getDepth: () => {
        const delta = 2 * (1 + Math.cos(2 * Math.PI * Date.now() / 1000 / 3600));
        const fP = (price) => parseFloat(price) + delta;
        const fV = (volume) => parseFloat(volume) + delta * 10;
        return {
            "asks": [
                [fP("15.0"), fV("1.5")],
                [fP("20.0"), fV("80")],
                [fP("20.5"), fV("10.0")],
                [fP("30.0"), fV("1.0")]
            ],
            "bids": [
                [fP("10.95"), fV("1.5")],
                [fP("10.90"), fV("45")],
                [fP("10.85"), fV("35")],
                [fP("10.70"), fV("10")],
            ]
        }
    },
    getStreamsFromUrl: (url) => url.replace("/", "").split(/[&?]stream=/).filter(stream => stream.length > 0),
    unique: (list) => list.filter((value, index, self) => self.indexOf(value) === index)
};

module.exports = Helpers;
