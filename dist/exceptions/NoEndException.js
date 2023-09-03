"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NoEndException extends Error {
    constructor(str) {
        super(str);
    }
}
exports.default = NoEndException;
