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
    getTickers: (markets) => {
        let tickers = {}
        markets.forEach(name => {
            let { baseUnit, quoteUnit, marketId } = Helpers.getMarketInfos(name);
            tickers[marketId] = {
                "name": name,
                "base_unit": baseUnit,
                "quote_unit": quoteUnit,
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
        return tickers;
    },
    getOrderBook: () => {
        return {
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
    }
}

module.exports = Helpers;
