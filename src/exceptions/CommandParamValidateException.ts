export default class CommandParamValidateException extends Error {
	constructor(s: string) {
		super(s);
	}
}