import CommandParamType from './CommandParamType';
import CommandParam from '../CommandParam';
import ParamPropException from '../exceptions/ParamPropException';

export default class NumberType extends CommandParamType {

	constructor() {
		super();
		this.type = 'number';
	}

	validate(value: any, params?: CommandParam): boolean {
		let str: string = value;
		if (/[^0-9.]+/g.test(str)) {
			return false;
		}
		let num: number = Number(value);
		if (params !== undefined) {
			// range
			if (params.props['range']) {
				let arr: number[] = (params.props['range'] as string).split('@').map(v => Number(v));
				let max = arr[1];
				let min = arr[0];
				if (!(num >= min && num <= max)) {
					return false;
				}
			}
		}
		return true;
	}

	props(): string[] {
		return [
			'range'
		];
	}

	toValue(value: any): number {
		return Number(value);
	}

	propValidate(key: string, value: string): boolean {
		switch (key) {
			case 'range': {
				let arr: number[] = value.split('@').map(v => Number(v));
				let max = arr[1];
				let min = arr[0];
				if (isNaN(max) || isNaN(min)) {
					throw new ParamPropException(this.type, key, `范围需要是数字，最小值在左，最大值在右，之间使用 @ 分隔。`);
				}
			}
		}
		return true;
	}
}