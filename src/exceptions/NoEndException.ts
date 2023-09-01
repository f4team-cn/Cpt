export default class NoEndException extends Error {
	constructor(str: string) {
		super(str);
	}
}