import CommandParamType from './ptys/CommandParamType';

export default class CommandParam {
	public type: CommandParamType;
	public key: string;
	public props: object;

	constructor(type: CommandParamType, key: string, props: object) {
		this.type = type;
		this.key = key;
		this.props = props;
	}
}