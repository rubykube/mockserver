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
        const minDay = 3865;
        const maxDay = 5000;
        const fakePeriod = 86400;
        const time = parseInt(Date.now() / 1000);
        const delta = minDay + (maxDay - minDay) / 2 * (1 + Math.cos((time / fakePeriod) * 2 * Math.PI));
        const fP = (price) => parseFloat(price) + delta;
        const fV = (volume) => parseFloat(volume) + delta * 10;
        return {
            "asks": [
                [fP("10"), fV("1")],
                [fP("20"), fV("2")],
                [fP("30"), fV("3")],
                [fP("40"), fV("4")]
            ],
            "bids": [
                [fP("-10"), fV("1")],
                [fP("-20"), fV("2")],
                [fP("-30"), fV("3")],
                [fP("-40"), fV("4")],
            ]
        }
    },
    getStreamsFromUrl: (url) => url.replace("/", "").split(/[&?]stream=/).filter(stream => stream.length > 0),
    unique: (list) => list.filter((value, index, self) => self.indexOf(value) === index)
};

module.exports = Helpers;
