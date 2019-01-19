const queryIndex = request.url.indexOf('?')
let k = [];

const parseQuery = (url) => {
    let vars = {};
    url.substring(queryIndex+1).split("&").forEach((chunk) => {
        const arr = chunk.split("=");
        vars[arr[0]] = arr[1];
    });
    return vars;
}

if (queryIndex != -1) {
    const vars = parseQuery(request.url);
    const period = parseInt(vars.period) * 60;
    const time_to = parseInt(vars.time_to);
    const time_from = parseInt(vars.time_from);
    const step = 100;
    const fakePeriod = 86400;
    let time = time_from;
    let open;
    let high;
    let low;
    let close;

    while (time < time_to) {
        open = step / 4 * (1 + Math.cos((time / fakePeriod) * 2 * Math.PI)) + parseInt(step * time / fakePeriod);
        close = open + 4;
        high = close + 2;
        low  = open - 2;
        k.push([time, open, high, low, close]);
        time += period;
    }
}

module.exports = k;
