export default class DuplicateKeyException extends Error {
	constructor(key: string) {
		super(`出现相同的键: ${key}`);
		this.name = 'DuplicateKeyException';
	}
}