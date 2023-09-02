import NoEndException from './exceptions/NoEndException';
import {ParamProps, ParamPropsDeclaration, StateParams} from './I';
import NullityDeclarationException from './exceptions/NullityDeclarationException';
import StringType from './ptys/StringType';
import CommandParamType from './ptys/CommandParamType';
import RepeatTypeException from './exceptions/RepeatTypeException';
import Command from './Command';
import CommandParam from './CommandParam';
import NoParamTypeException from './exceptions/NoParamTypeException';

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
		for (let i = cmds.length - 1; i >= 0; i --) {
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
	 */
	public static commit(cmd: string) {

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
						throw new NullityDeclarationException(`无效的参数声明，${temp}`)
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
				throw new NullityDeclarationException(`无效的参数声明，${temp}`)
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
					propKey = currentValue;
					currentValue = '';
					isPropVal = true;
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
			type: new StringType(),
			key
		}
	}
}