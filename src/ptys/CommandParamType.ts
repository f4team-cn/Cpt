import CommandParam from '../CommandParam';

export default abstract class CommandParamType {
	public type: string = '';

	/**
	 * 参数合法验证
	 * @param value
	 * @param params
	 */
	abstract validate(value: any, params: CommandParam[]): boolean;

	/**
	 * 参数额外规则
	 */
	abstract props(): string[];

	/**
	 * 转换成可执行的值
	 * @param value
	 */
	abstract toValue(value: any): any;
}