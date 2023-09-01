import CommandParamType from './ptys/CommandParamType';

export interface StateParams {
	params: string[],
	start: number,
	cmd: string
}

export interface ParamProps {
	type: CommandParamType,
	props: object,
	key: string
}

export interface ParamPropsDeclaration {
	[key: string]: any
}