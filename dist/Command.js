"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const RepeatTypeException_1 = require("./exceptions/RepeatTypeException");
class Command {
    constructor(cmd) {
        this.cmd = '';
        this.children = [];
        this.params = [];
        this._end = false;
        this.callback = null;
        this.cmd = cmd;
    }
    getCmd() {
        return this.cmd;
    }
    getChildrenCommands() {
        return this.children;
    }
    getCommandParams() {
        return this.params;
    }
    addChildren(command) {
        if (this.params.length !== 0)
            throw new RepeatTypeException_1.default('当前命令已被设置为终点命令。');
        this.children.push(command);
    }
    addParam(param) {
        if (this.children.length !== 0)
            throw new RepeatTypeException_1.default('当前命令已被设置为子命令。');
        this.params.push(param);
        this._end = true;
    }
    setCallback(cb) {
        this.callback = cb;
    }
    callCommandCallback(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
            return (this.callback !== null ? this.callback(ctx) : false);
        });
    }
    isEnd() {
        return this._end;
    }
}
exports.default = Command;
