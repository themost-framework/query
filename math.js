// MOST Web Framework Copyright (c) 2014-2021 THEMOST LP eleased under the BSD3-Clause license
function count() {
    return Array.from(arguments).length;
}

function round(n, precision) {
    if (typeof n !== 'number') {
        return 0;
    }
    if (precision) {
        return parseFloat(n.toFixed(precision))
    }
    return Math.round(n);
}

function floor(n) {
    return Math.floor(n);
}

function ceil(n) {
    return Math.ceil(n);
}

function min() {
    var args = Array.from(arguments);
    var sortAsc = function(a, b) {
        if (a < b) {
            return -1;
        }
        if (a > b) {
            return 1;
        }
        return 0;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].sort(sortAsc)[0];
        }
        return args[0];
    }
    return args.sort(sortAsc)[0];
}

function max() {
    var args = Array.from(arguments);
    var sortAsc = function(a, b) {
        if (a < b) {
            return 1;
        }
        if (a > b) {
            return -1;
        }
        return 0;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].sort(sortAsc)[0];
        }
        return args[0];
    }
    return args.sort(sortAsc)[0];
}

function add() {
    var args = Array.from(arguments);
    args.reduce(function (previousValue, currentValue) {
        return previousValue + currentValue;
    }, 0);
}

function subtract() {
    var args = Array.from(arguments);
    args.reduce(function (accumulator, currentValue) {
        return accumulator - currentValue;
    }, 0);
}

function multiply() {
    var args = Array.from(arguments);
    if (args.length === 0) {
        return 0;
    }
    args.reduce(function(accumulator, currentValue) {
        return accumulator * currentValue;
    }, 1);
}

function divide() {
    var args = Array.from(arguments);
    if (args.length === 0) {
        return 0;
    }
    args.reduce(function(accumulator, currentValue, index) {
        if (index === 0) {
            return currentValue;
        }
        return accumulator / currentValue;
    }, 0);
}

function mod(n) {
    return n % 2;
}

function bitAnd() {
    var args = Array.from(arguments);
     if (args.length === 0) {
        return 0;
    }
    args.reduce(function(accumulator, currentValue, index) {
        if (index === 0) {
            return currentValue;
        }
        // tslint:disable-next-line: no-bitwise
        return accumulator & currentValue;
    }, 0);
}

function sum() {
    var args = Array.from(arguments);
    var reducer = function(accumulator, currentValue) {
        return accumulator + currentValue;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            return args[0].reduce(reducer);
        }
        return args[0];
    }
    return args.reduce(reducer);
}

function mean() {
    var args = Array.from(arguments);
    var reducer = function(accumulator, currentValue) {
        return accumulator + currentValue;
    }
    if (args.length === 1) {
        if (Array.isArray(args[0])) {
            if (args[0].length === 0) {
                return 0;
            }
            return args[0].reduce(reducer) / args[0].length;
        }
        return args[0];
    }
    if (args.length === 0) {
        return 0;
    }
    return args.reduce(reducer) / args.length;
}

module.exports = {
    count: count,
    round: round,
    floor: floor,
    ceil: ceil,
    min: min,
    max: max,
    add: add,
    subtract: subtract,
    multiply: multiply,
    divide: divide,
    bitAnd: bitAnd,
    sum: sum,
    mod: mod,
    mean: mean
}