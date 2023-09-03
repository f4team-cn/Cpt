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
			// len
			if (param.props['len']) {
				let len = (value as string).length;
				let arr: number[] = (param.props['len'] as string).split('@').map(v => Number(v));
				let max = arr[1];
				let min = arr[0];
				if (!(len >= min && len <= max)) {
					return false;
				}
			}
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
			'regex',
			'len'
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
			case 'len': {
				let arr: number[] = value.split('@').map(v => Number(v));
				let max = arr[1];
				let min = arr[0];
				if (isNaN(max) || isNaN(min)) {
					throw new ParamPropException(this.type, key, `范围需要是数字，最小值在左，最大值在右，之间使用 @ 分隔。`);
				}
				break;
			}
		}
		return true;
	}
}