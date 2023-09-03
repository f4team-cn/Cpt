import NoEndException from './exceptions/NoEndException';
import {ParamPropsDeclaration, StateParams} from './I';
import NullityDeclarationException from './exceptions/NullityDeclarationException';
import StringType from './ptys/StringType';
import CommandParamType from './ptys/CommandParamType';
import RepeatTypeException from './exceptions/RepeatTypeException';
import Command from './Command';
import CommandParam from './CommandParam';
import NoParamTypeException from './exceptions/NoParamTypeException';
import CommandContext from './CommandContext';
import CommandParamValidateException from './exceptions/CommandParamValidateException';
import CommandSyntaxException from './exceptions/CommandSyntaxException';
import NoParamPropException from './exceptions/NoParamPropException';

/**
 * 命令工厂
 */
export default class CommandFactory {
	private static isRegisterParamType: CommandParamType[] = [
		new StringType()
	];
	private static isRegisterCommandList: Command[] = [];

	/**
	 * 验证参数类型是否有效
	 * @param type
	 */
	public static validateParamType(type: string) {
		return (this.isRegisterParamType.filter(v => v.type === type)).length !== 0;
	}

	/**
	 * 注册新参数类型
	 * @param type
	 */
	public static registerParamType(type: CommandParamType) {
		if (this.isRegisterParamType.filter(v => v.type === type.type).length !== 0) {
			throw new RepeatTypeException(`重复声明的参数类型，${type.type}`);
		}
		this.isRegisterParamType.push(type);
	}

	/**
	 * 注册命令
	 * @param cmd
	 * @param callback
	 */
	public static register(cmd: string, callback: Function): void {
		let paramInformation = this.getStateParam(cmd);
		let commands: string[] = cmd.substring(0, paramInformation.start).split(' ');
		let cmds = commands.map(v => new Command(v)).filter(v => v.getCmd().length !== 0);
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
	public static commit(cmd: string, ctx?: CommandContext) {
		if (cmd.length === 0) return;
		let argv: string[] = this.getCommitCommandArgv(cmd);
		let result = this.searchCommandObject(argv);
		if (result.cmd === null) {
			return;
		}
		if (ctx === undefined) {
			ctx = new CommandContext();
		}
		let params: string[] = argv.slice(result.endPos);
		let command: Command = result.cmd as Command;
		// 参数验证
		ctx.clearProps();
		for (let i = 0; i < command.getCommandParams().length; i++) {
			let param = command.getCommandParams()[i];
			let value = params[i];
			if (value === undefined && command.getCommandParams().length !== params.length) {
				// TODO: 参数补全
			}
			// 调用类型的验证方法
			if (!param.type.validate(value)) {
				throw new CommandParamValidateException(`参数 ${param.key} 验证失败，${value} 不符合类型 ${param.type.type} 的规则。`);
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
	private static searchCommandObject(argv: string[]): {
		endPos: number,
		cmd?: Command
	} {
		let pos: number = 0;
		let flag: boolean = true;
		let queryList: Command[] = this.isRegisterCommandList;
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

	private static getCommitCommandArgv(cmd: string): string[] {
		let pos: number = 0;
		let str: string = '';
		let mark: boolean = false;
		let sts: string[] = [];
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
				} else {
					str += char;
				}
			} else {
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
	public static getStateParam(cmd: string): StateParams {
		let params: string[] = [];
		let mark: boolean = false;
		let pos: number = 0;
		let temp: string = '';
		let first: boolean = true;
		let firstPos: number = 0;
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
						throw new NullityDeclarationException(`无效的参数声明，${temp}`);
					}
					params.push(temp);
					temp = '';
				}
			}
		}
		if (mark) {
			throw new NoEndException(`没有结尾的参数声明，${temp}`);
		} else if (temp.length !== 0) {
			if (temp === '[]') {
				throw new NullityDeclarationException(`无效的参数声明，${temp}`);
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
	public static parseCommandParam(param: string): CommandParam {
		let pos: number = 0;
		let isType: boolean = false;
		let isKey: boolean = false;
		let isProp: boolean = false;
		let isPropVal: boolean = false;
		let currentValue: string = '';
		let key: string = '';
		let type: string = '';
		let props: ParamPropsDeclaration = {};
		let propKey: string = '';
		let propVal: string = '';
		while (pos < param.length) {
			let char: string = param[pos++];
			if (char === '[') {
				isKey = true;
			} else if (char === ':') {
				if (isKey) {
					key = currentValue;
					currentValue = '';
					isKey = false;
					isType = true;
				} else {
					currentValue += char;
				}
			} else if (char === ',') {
				if (isType) {
					type = currentValue;
					if (!this.validateParamType(type)) {
						throw new NoParamTypeException('未知的参数类型。');
					}
					currentValue = '';
					isType = false;
					isProp = true;
				} else if (isProp && isPropVal) {
					propVal = currentValue;
					currentValue = '';
					props[propKey] = propVal;
					propKey = '';
					propVal = '';
				}
			} else if (char === '=') {
				if (isProp) {
					if (!this.hasParamProps(type, currentValue)) {
						throw new NoParamPropException(`未知的额外规则 ${currentValue} 在参数类型 ${type} 中。`);
					}
					propKey = currentValue;
					currentValue = '';
					isPropVal = true;
				} else {
					throw new CommandSyntaxException(`意外的 ${char}。`);
				}
			} else if (char === ']') {
				if (isType) {
					type = currentValue;
					if (!this.validateParamType(type)) {
						throw new NoParamTypeException('未知的参数类型。');
					}
					currentValue = '';
					isType = false;
					isProp = true;
				} else if (isProp && isPropVal) {
					propVal = currentValue;
					if (propKey === '' || propVal === '') {
						throw new NullityDeclarationException('无效的参数声明。');
					}
					currentValue = '';
					props[propKey] = propVal;
				}
			} else {
				currentValue += char;
			}
		}
		return {
			props,
			type: this.getParamType(type),
			key
		};
	}

	/**
	 * 根据类型字符串获取类型对象
	 * @param type
	 * @private
	 */
	private static getParamType(type: string): CommandParamType {
		for (let param of this.isRegisterParamType) {
			if (param.type === type) {
				return  param;
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
	private static hasParamProps(type: string, propKey: string): boolean {
		for (let param of this.isRegisterParamType) {
			if (param.type === type) {
				return param.props().includes(propKey);
			}
		}
		return false;
	}
}