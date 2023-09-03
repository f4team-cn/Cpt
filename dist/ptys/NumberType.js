"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandParamType_1 = require("./CommandParamType");
const ParamPropException_1 = require("../exceptions/ParamPropException");
class NumberType extends CommandParamType_1.default {
    constructor() {
        super();
        this.type = 'number';
    }
    validate(value, params) {
        let str = value;
        if (/[^0-9.]+/g.test(str)) {
            return false;
        }
        let num = Number(value);
        if (params !== undefined) {
            // range
            if (params.props['range']) {
                let arr = params.props['range'].split('@').map(v => Number(v));
                let max = arr[1];
                let min = arr[0];
                if (!(num >= min && num <= max)) {
                    return false;
                }
            }
        }
        return true;
    }
    props() {
        return [
            'range'
        ];
    }
    toValue(value) {
        return Number(value);
    }
    propValidate(key, value) {
        switch (key) {
            case 'range': {
                let arr = value.split('@').map(v => Number(v));
                let max = arr[1];
                let min = arr[0];
                if (isNaN(max) || isNaN(min)) {
                    throw new ParamPropException_1.default(this.type, key, `范围需要是数字，最小值在左，最大值在右，之间使用 @ 分隔。`);
                }
            }
        }
        return true;
    }
}
exports.default = NumberType;
