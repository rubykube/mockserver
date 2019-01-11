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
    const step = 5;
    let time = parseInt(vars.time_from);
    let open = 100;
    let high;
    let low;
    let close;

    while(time < time_to) {
        open += step;
        high = open + 10 * step;
        low  = open - 10 * step;
        close = open + step;
        k.push([time, open, high, low, close]);
        time += period;
    }
}

module.exports = k;
