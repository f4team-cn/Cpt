"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DuplicateKeyException extends Error {
    constructor(key) {
        super(`出现相同的键: ${key}`);
        this.name = 'DuplicateKeyException';
    }
}
exports.default = DuplicateKeyException;
