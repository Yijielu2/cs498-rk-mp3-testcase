function printErrorInfo(requestType, url, query, body) {
    console.log(requestType + ' at ' + url + ' failed.');
    console.log({
        query: query,
        body: body
    });
}

function printSuccessInfo(requestType, url, query, body) {
    console.log(requestType + ' at ' + url + ' successed.');
    console.log({
        query: query,
        body: body
    });
}

function printExpectedGot(expect, result) {
    console.log('EXPECTED: ');
    console.log(expect);
    console.log('GOT: ');
    console.log(result);
}

module.exports.printErrorInfo = printErrorInfo;
module.exports.printSuccessInfo = printSuccessInfo;
module.exports.printExpectedGot = printExpectedGot;