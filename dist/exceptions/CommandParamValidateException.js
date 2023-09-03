"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandParamValidateException extends Error {
    constructor(s) {
        super(s);
    }
}
exports.default = CommandParamValidateException;
