const queryIndex = request.url.indexOf('?')
let k = [];

const parseQuery = (url) => {
    let vars = {};
    url.substring(queryIndex + 1).split("&").forEach((chunk) => {
        const arr = chunk.split("=");
        vars[arr[0]] = arr[1];
    });
    return vars;
}

// Those functions are the same used in k-line mocked ranger event
const timeToPrice = (time) => {
    const fakePeriod = 86400;
    const step = 100;
    return (step / 4 * (1 + Math.cos((time / fakePeriod) * 2 * Math.PI)) + parseInt(step * time / fakePeriod));
}

const kLine = (time, period) => {
    const open = timeToPrice(time);
    const close = timeToPrice(time + period);
    const high = close + 2;
    const low = open - 2;
    return [time, open, high, low, close]
}

if (queryIndex != -1) {
    const vars = parseQuery(request.url);
    const period = parseInt(vars.period) * 60;
    const time_to = parseInt(vars.time_to);
    const time_from = parseInt(vars.time_from);
    let time = time_from;

    while (time < time_to) {
        k.push(kLine(time, period));
        time += period;
    }
}

module.exports = k;
