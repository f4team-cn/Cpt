"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NoEndException_1 = require("./exceptions/NoEndException");
const NullityDeclarationException_1 = require("./exceptions/NullityDeclarationException");
const StringType_1 = require("./ptys/StringType");
const RepeatTypeException_1 = require("./exceptions/RepeatTypeException");
const Command_1 = require("./Command");
const CommandParam_1 = require("./CommandParam");
const NoParamTypeException_1 = require("./exceptions/NoParamTypeException");
const CommandContext_1 = require("./CommandContext");
const CommandParamValidateException_1 = require("./exceptions/CommandParamValidateException");
const CommandSyntaxException_1 = require("./exceptions/CommandSyntaxException");
const NoParamPropException_1 = require("./exceptions/NoParamPropException");
const NumberType_1 = require("./ptys/NumberType");
const BooleanType_1 = require("./ptys/BooleanType");
/**
 * 命令工厂
 */
class CommandFactory {
    /**
     * 验证参数类型是否有效
     * @param type
     */
    static validateParamType(type) {
        return (this.isRegisterParamType.filter(v => v.type === type)).length !== 0;
    }
    /**
     * 注册新参数类型
     * @param type
     */
    static registerParamType(type) {
        if (this.isRegisterParamType.filter(v => v.type === type.type).length !== 0) {
            throw new RepeatTypeException_1.default(`重复声明的参数类型，${type.type}`);
        }
        this.isRegisterParamType.push(type);
    }
    /**
     * 注册命令
     * @param cmd
     * @param callback
     */
    static register(cmd, callback) {
        let paramInformation = this.getStateParam(cmd);
        let commands = cmd.substring(0, paramInformation.start).split(' ');
        let cmds = commands.map(v => new Command_1.default(v)).filter(v => v.getCmd().length !== 0);
        for (let i = cmds.length - 1; i >= 0; i--) {
            let current = cmds[i];
            let previous = cmds[i - 1];
            if (previous !== undefined) {
                previous.addChildren(current);
            }
        }
        // 添加参数到命令
        let endCommand = cmds[cmds.length - 1];
        for (let param of paramInformation.params) {
            let p = this.parseCommandParam(param);
            endCommand.addParam(p);
        }
        endCommand.setCallback(callback);
        this.isRegisterCommandList.push(cmds[0]);
    }
    /**
     * 触发命令
     * @param cmd
     * @param ctx
     */
    static commit(cmd, ctx) {
        if (cmd.length === 0)
            return;
        let argv = this.getCommitCommandArgv(cmd);
        let result = this.searchCommandObject(argv);
        if (result.cmd === null) {
            return;
        }
        if (ctx === undefined) {
            ctx = new CommandContext_1.default();
        }
        let params = argv.slice(result.endPos);
        let command = result.cmd;
        // 参数验证
        ctx.clearProps();
        for (let i = 0; i < command.getCommandParams().length; i++) {
            let param = command.getCommandParams()[i];
            let value = params[i];
            if (value === undefined && command.getCommandParams().length !== params.length) {
                // TODO: 参数补全
            }
            // 调用类型的验证方法
            if (!param.type.validate(value, param)) {
                throw new CommandParamValidateException_1.default(`参数 ${param.key} 验证失败，${value} 不符合类型 ${param.type.type} 的规则。`);
            }
            ctx.set(`input.${param.key}`, param.type.toValue(value));
        }
        ctx.set('input.origin.cmd', cmd);
        command.callCommandCallback(ctx).then(undefined);
    }
    /**
     * 根据命令查找命令对象
     * @private
     * @param argv
     */
    static searchCommandObject(argv) {
        let pos = 0;
        let flag = true;
        let queryList = this.isRegisterCommandList;
        parentWhile: while (flag) {
            for (let command of queryList) {
                if (argv[pos] === undefined) {
                    flag = false;
                    break parentWhile;
                }
                if (command.getCmd() === argv[pos]) {
                    if (command.isEnd()) {
                        return {
                            endPos: pos + 1,
                            cmd: command
                        };
                    }
                    pos++;
                    queryList = command.getChildrenCommands();
                }
            }
        }
        return {
            endPos: 0
        };
    }
    static getCommitCommandArgv(cmd) {
        let pos = 0;
        let str = '';
        let mark = false;
        let sts = [];
        while (pos < cmd.length) {
            let char = cmd[pos++];
            if (char === '"') {
                mark = !mark;
                continue;
            }
            if (char === ' ') {
                if (!mark) {
                    sts.push(str);
                    str = '';
                }
                else {
                    str += char;
                }
            }
            else {
                str += char;
            }
        }
        if (str.length !== 0) {
            sts.push(str);
        }
        return sts;
    }
    /**
     * 获取所有参数
     * @param cmd
     * @private
     */
    static getStateParam(cmd) {
        let params = [];
        let mark = false;
        let pos = 0;
        let temp = '';
        let first = true;
        let firstPos = 0;
        while (pos < cmd.length) {
            let char = cmd[pos++];
            if (char === '[') {
                mark = true;
                if (first) {
                    first = false;
                    firstPos = pos;
                }
            }
            if (mark) {
                temp += char;
            }
            if (char === ']') {
                mark = false;
            }
            if (char === ' ') {
                if (temp.length !== 0) {
                    if (temp === '[]') {
                        throw new NullityDeclarationException_1.default(`无效的参数声明，${temp}`);
                    }
                    params.push(temp);
                    temp = '';
                }
            }
        }
        if (mark) {
            throw new NoEndException_1.default(`没有结尾的参数声明，${temp}`);
        }
        else if (temp.length !== 0) {
            if (temp === '[]') {
                throw new NullityDeclarationException_1.default(`无效的参数声明，${temp}`);
            }
            params.push(temp);
        }
        return {
            params,
            cmd,
            start: firstPos - 1
        };
    }
    /**
     * 解析参数
     * @param param
     */
    static parseCommandParam(param) {
        let pos = 0;
        let isType = false;
        let isKey = false;
        let isProp = false;
        let isPropVal = false;
        let currentValue = '';
        let key = '';
        let type = '';
        let props = {};
        let propKey = '';
        let propVal = '';
        while (pos < param.length) {
            let char = param[pos++];
            if (char === '[') {
                isKey = true;
            }
            else if (char === ':') {
                if (isKey) {
                    key = currentValue;
                    currentValue = '';
                    isKey = false;
                    isType = true;
                }
                else {
                    currentValue += char;
                }
            }
            else if (char === ',') {
                if (isType) {
                    type = currentValue;
                    if (!this.validateParamType(type)) {
                        throw new NoParamTypeException_1.default('未知的参数类型。');
                    }
                    currentValue = '';
                    isType = false;
                    isProp = true;
                }
                else if (isProp && isPropVal) {
                    propVal = currentValue;
                    currentValue = '';
                    if (!this.getParamType(type).propValidate(propKey, propVal)) {
                        throw new NoParamPropException_1.default(`不符合的额外规则 ${propKey}=${propVal} 在 参数类型 ${type} 中。`);
                    }
                    props[propKey] = propVal;
                    propKey = '';
                    propVal = '';
                }
            }
            else if (char === '=') {
                if (isProp) {
                    if (!this.hasParamProps(type, currentValue)) {
                        throw new NoParamPropException_1.default(`未知的额外规则 ${currentValue} 在参数类型 ${type} 中。`);
                    }
                    propKey = currentValue;
                    currentValue = '';
                    isPropVal = true;
                }
                else {
                    throw new CommandSyntaxException_1.default(`意外的 ${char}。`);
                }
            }
            else if (char === ']') {
                if (isType) {
                    type = currentValue;
                    if (!this.validateParamType(type)) {
                        throw new NoParamTypeException_1.default('未知的参数类型。');
                    }
                    currentValue = '';
                    isType = false;
                    isProp = true;
                }
                else if (isProp && isPropVal) {
                    propVal = currentValue;
                    if (propKey === '' || propVal === '') {
                        throw new NullityDeclarationException_1.default('无效的参数声明。');
                    }
                    currentValue = '';
                    if (!this.getParamType(type).propValidate(propKey, propVal)) {
                        throw new NoParamPropException_1.default(`不符合的额外规则 ${propKey}=${propVal} 在 参数类型 ${type} 中。`);
                    }
                    props[propKey] = propVal;
                }
            }
            else {
                currentValue += char;
            }
        }
        return new CommandParam_1.default(this.getParamType(type), key, props);
    }
    /**
     * 根据类型字符串获取类型对象
     * @param type
     * @private
     */
    static getParamType(type) {
        for (let param of this.isRegisterParamType) {
            if (param.type === type) {
                return param;
            }
        }
        return null;
    }
    /**
     * 检查额外规则是否存在
     * @param type
     * @param propKey
     * @private
     */
    static hasParamProps(type, propKey) {
        for (let param of this.isRegisterParamType) {
            if (param.type === type) {
                return param.props().includes(propKey);
            }
        }
        return false;
    }
}
exports.default = CommandFactory;
CommandFactory.isRegisterParamType = [
    new StringType_1.default(),
    new NumberType_1.default(),
    new BooleanType_1.default()
];
CommandFactory.isRegisterCommandList = [];
