import CommandFactory from '../src/CommandFactory';
import CommandContext from '../src/CommandContext';

CommandFactory.register('/music search song [keyword:string]', (ctx: CommandContext) => {
	console.log(`/music search song触发`);
	console.log(`keyword: ${ctx.get('input.keyword')}`);
});


CommandFactory.commit('/music search song "s s s"');