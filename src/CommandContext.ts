import DuplicateKeyException from './exceptions/DuplicateKeyException';

/**
 * 命令上下文
 */
export default class CommandContext {
	private extra: object = {};
	constructor() {
	}

	/**
	 * 获取上下文值
	 * @param key
	 * @param defaultVal
	 */
	public get(key: string, defaultVal?: any): any {
		return this.extra[key] ?? (defaultVal ?? undefined);
	}

	/**
	 * 设置上下文值
	 * @param key
	 * @param value
	 */
	public set(key: string, value: any) {
		this.extra[key] = value;
	}

	/**
	 * 获取上下文保存对象
	 */
	public all(): object {
		return this.extra;
	}

	/**
	 * 合并上下文
	 * @param ctx
	 */
	public merge(ctx: CommandContext) {
		for (let key of Object.keys(ctx.all())) {
			if (this.extra.hasOwnProperty(key)) {
				throw new DuplicateKeyException(key);
			}
			this.set(key, ctx.get(key));
		}
	}

	public clearProps() {
		for (let key of Object.keys(this.extra)) {
			if (key.startsWith('input.') && this.extra.hasOwnProperty(key)) {
				delete this.extra[key];
			}
		}
	}
}