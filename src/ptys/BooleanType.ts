import CommandParamType from './CommandParamType';
import CommandParam from '../CommandParam';

export default class BooleanType extends CommandParamType {

	constructor() {
		super();
		this.type = 'boolean';
	}

	validate(value: any, params?: CommandParam): boolean {
		return true;
	}

	props(): string[] {
		return [];
	}

	toValue(value: any): boolean {
		return Boolean(value);
	}

	propValidate(key: string, value: string): boolean {
		return true;
	}
}