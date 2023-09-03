import CommandParamType from './ptys/CommandParamType';
import CommandContext from './CommandContext';

export interface StateParams {
	params: string[],
	start: number,
	cmd: string
}

export interface ParamPropsDeclaration {
	[key: string]: any
}

export type CommandCallback = (ctx: CommandContext) => void;