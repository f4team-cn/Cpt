import NoEndException from './exceptions/NoEndException';
import {ParamProps, ParamPropsDeclaration, StateParams} from './I';
import NullityDeclarationException from './exceptions/NullityDeclarationException';
import StringType from './ptys/StringType';
import CommandParamType from './ptys/CommandParamType';
import RepeatTypeException from './exceptions/RepeatTypeException';
import Command from './Command';
import CommandParam from './CommandParam';

/**
 * 命令工厂
 */
export default class CommandFactory {
	private static isRegisterParamType: CommandParamType[] = [
		new StringType()
	];

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
		let commands: string[] = cmd.substring(paramInformation.start).split(' ');
		let parent = new Command(commands[0]);
		// TODO: 先把所有子命令保存到一个变量中，最后再把参数添加到最后一个子命令中。
		for (let i = 1; i < commands.length; i ++) {
			let c = new Command(commands[i]);
			let props = this.getParamProps(paramInformation.params[0]);
			c.addParam(new CommandParam(props.type, props.key, props.props));
			parent.addChildren(c);
		}
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
	 * 获取参数的规则
	 * @param param
	 */
	public static getParamProps(param: string): ParamProps {
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
						throw new Error('未知的参数类型。');
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
						throw new Error('未知的参数类型。');
					}
					currentValue = '';
					isType = false;
					isProp = true;
				} else if (isProp && isPropVal) {
					propVal = currentValue;
					if (propKey === '' || propVal === '') {
						throw new Error('无效的参数声明。');
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
			type: null,
			key
		}
	}
}