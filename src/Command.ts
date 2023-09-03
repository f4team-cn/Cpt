import CommandParam from './CommandParam';
import RepeatTypeException from './exceptions/RepeatTypeException';
import CommandContext from './CommandContext';

export default class Command {
	private readonly cmd: string = '';
	private children: Command[] = [];
	private params: CommandParam[] = [];
	private _end: boolean = false;
	private callback: Function | null = null;
	constructor(cmd: string) {
		this.cmd = cmd;
	}
	public getCmd(): string {
		return this.cmd;
	}
	public getChildrenCommands(): Command[] {
		return this.children;
	}
	public getCommandParams(): CommandParam[] {
		return this.params;
	}
	public addChildren(command: Command) {
		if (this.params.length !== 0) throw new RepeatTypeException('当前命令已被设置为终点命令。');
		this.children.push(command);
	}
	public addParam(param: CommandParam) {
		if (this.children.length !== 0) throw new RepeatTypeException('当前命令已被设置为子命令。');
		this.params.push(param);
		this._end = true;
	}
	public setCallback(cb: Function): void {
		this.callback = cb;
	}
	public async callCommandCallback(ctx: CommandContext): Promise<boolean> {
		return (this.callback !== null ? this.callback(ctx) : false) as boolean;
	}
	public isEnd(): boolean {
		return this._end;
	}
}