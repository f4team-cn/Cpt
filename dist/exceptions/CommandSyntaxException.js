"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandSyntaxException extends Error {
    constructor(s) {
        super(s);
    }
}
exports.default = CommandSyntaxException;
