import CommandParamType from './CommandParamType';

export default class StringType extends CommandParamType {

	constructor() {
		super();
		this.type = 'string';
	}

	validate(value: any): boolean {
		let str: string = value;
		return str.length !== 0;
	}

	toValue(value: any): any {
		return value;
	}

	props(): string[] {
		return [
			'regex'
		];
	}
}