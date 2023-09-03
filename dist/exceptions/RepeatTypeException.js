"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RepeatTypeException extends Error {
    constructor(key) {
        super(key);
        this.name = 'RepeatTypeException';
    }
}
exports.default = RepeatTypeException;
