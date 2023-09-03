"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandParamType_1 = require("./CommandParamType");
class BooleanType extends CommandParamType_1.default {
    constructor() {
        super();
        this.type = 'boolean';
    }
    validate(value, params) {
        return true;
    }
    props() {
        return [];
    }
    toValue(value) {
        return Boolean(value);
    }
    propValidate(key, value) {
        return true;
    }
}
exports.default = BooleanType;
