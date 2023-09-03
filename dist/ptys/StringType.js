"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CommandParamType_1 = require("./CommandParamType");
const ParamPropException_1 = require("../exceptions/ParamPropException");
class StringType extends CommandParamType_1.default {
    constructor() {
        super();
        this.type = 'string';
    }
    validate(value, param) {
        let str = value;
        if (str.length === 0) {
            return false;
        }
        if (param !== undefined) {
            // len
            if (param.props['len']) {
                let len = value.length;
                let arr = param.props['len'].split('@').map(v => Number(v));
                let max = arr[1];
                let min = arr[0];
                if (!(len >= min && len <= max)) {
                    return false;
                }
            }
            // regex
            if (param.props['regex']) {
                let regex = param.props['regex'];
                regex = regex.substring(1, regex.length - 1);
                return new RegExp(regex).test(str);
            }
        }
        return true;
    }
    toValue(value) {
        return value;
    }
    props() {
        return [
            'regex',
            'len'
        ];
    }
    propValidate(key, value) {
        switch (key) {
            case 'regex': {
                if (!(value.startsWith('/') && value.endsWith('/'))) {
                    throw new ParamPropException_1.default(this.type, key, `正则表达式需要使用 / 包裹。`);
                }
                break;
            }
            case 'len': {
                let arr = value.split('@').map(v => Number(v));
                let max = arr[1];
                let min = arr[0];
                if (isNaN(max) || isNaN(min)) {
                    throw new ParamPropException_1.default(this.type, key, `范围需要是数字，最小值在左，最大值在右，之间使用 @ 分隔。`);
                }
                break;
            }
        }
        return true;
    }
}
exports.default = StringType;
