// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2020, THEMOST LP All rights reserved
var _closureParser = require('./ClosureParser');
var PrototypeMethodParser = require('./PrototypeMethodParser').PrototypeMethodParser;
var DateMethodParser = require('./DateMethodParser').DateMethodParser;
var StringMethodParser = require('./StringMethodParser').StringMethodParser;
var MathMethodParser = require('./MathMethodParser').MathMethodParser;

module.exports.ClosureParser = _closureParser.ClosureParser;
module.exports.count = _closureParser.count;
module.exports.min = _closureParser.min;
module.exports.max = _closureParser.max;
module.exports.mean = _closureParser.mean;
module.exports.round = _closureParser.round;
module.exports.sum = _closureParser.sum;
module.exports.PrototypeMethodParser = PrototypeMethodParser;
module.exports.DateMethodParser = DateMethodParser;
module.exports.StringMethodParser = StringMethodParser;
module.exports.MathMethodParser = MathMethodParser;
