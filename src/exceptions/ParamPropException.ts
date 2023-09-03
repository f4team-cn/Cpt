export default class ParamPropException extends Error {
	constructor(type: string, key: string, s: string) {
		super(`参数额外规则验证错误，出现在 ${type} 类型的 ${key} 额外规则，${s}`);
	}
}