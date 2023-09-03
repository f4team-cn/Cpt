export default class CommandSyntaxException extends Error {
	constructor(s: string) {
		super(s);
	}
}