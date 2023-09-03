import CommandParamType from './CommandParamType';
import CommandParam from '../CommandParam';
import ParamPropException from '../exceptions/ParamPropException';

export default class StringType extends CommandParamType {

	constructor() {
		super();
		this.type = 'string';
	}

	validate(value: any, param: CommandParam): boolean {
		let str: string = value;
		if (str.length === 0) {
			return false;
		}
		if (param !== undefined) {
			// regex
			if (param.props['regex']) {
				let regex: string = param.props['regex'];
				regex = regex.substring(1, regex.length - 1);
				return new RegExp(regex).test(str);
			}
		}
		return true;
	}

	toValue(value: any): any {
		return value;
	}

	props(): string[] {
		return [
			'regex'
		];
	}

	propValidate(key: string, value: string): boolean {
		switch (key) {
			case 'regex': {
				if (!(value.startsWith('/') && value.endsWith('/'))) {
					throw new ParamPropException(this.type, key, `正则表达式需要使用 / 包裹。`);
				}
				break;
			}
		}
		return true;
	}
}