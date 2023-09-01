export default class RepeatTypeException extends Error {
	constructor(key: string) {
		super(key);
		this.name = 'RepeatTypeException';
	}
}