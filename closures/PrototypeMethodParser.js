// MOST Web Framework 2.0 Codename Blueshift Copyright (c) 2017-2022, THEMOST LP All rights reserved

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
