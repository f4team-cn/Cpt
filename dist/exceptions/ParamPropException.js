"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ParamPropException extends Error {
    constructor(type, key, s) {
        super(`参数额外规则验证错误，出现在 ${type} 类型的 ${key} 额外规则，${s}`);
    }
}
exports.default = ParamPropException;
