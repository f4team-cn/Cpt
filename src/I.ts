import CommandParamType from './ptys/CommandParamType';

export interface StateParams {
	params: string[],
	start: number,
	cmd: string
}

export interface ParamPropsDeclaration {
	[key: string]: any
}