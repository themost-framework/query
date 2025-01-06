// MOST Web Framework Codename Zero Gravity Copyright (c) 2017-2025, THEMOST LP All rights reserved

class PrototypeMethodParser {
    constructor() {
    }
    test(name) {
        if (name === 'toString') {
            return;
        }
        if (typeof this[name] === 'function') {
            return this[name];
        }
    }
}

module.exports = {
    PrototypeMethodParser
};
