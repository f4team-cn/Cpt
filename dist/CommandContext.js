"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DuplicateKeyException_1 = require("./exceptions/DuplicateKeyException");
/**
 * 命令上下文
 */
class CommandContext {
    constructor() {
        this.extra = {};
    }
    /**
     * 获取上下文值
     * @param key
     * @param defaultVal
     */
    get(key, defaultVal) {
        var _a;
        return (_a = this.extra[key]) !== null && _a !== void 0 ? _a : (defaultVal !== null && defaultVal !== void 0 ? defaultVal : undefined);
    }
    /**
     * 设置上下文值
     * @param key
     * @param value
     */
    set(key, value) {
        this.extra[key] = value;
    }
    /**
     * 获取上下文保存对象
     */
    all() {
        return this.extra;
    }
    /**
     * 合并上下文
     * @param ctx
     */
    merge(ctx) {
        for (let key of Object.keys(ctx.all())) {
            if (this.extra.hasOwnProperty(key)) {
                throw new DuplicateKeyException_1.default(key);
            }
            this.set(key, ctx.get(key));
        }
    }
    clearProps() {
        for (let key of Object.keys(this.extra)) {
            if (key.startsWith('input.') && this.extra.hasOwnProperty(key)) {
                delete this.extra[key];
            }
        }
    }
}
exports.default = CommandContext;
