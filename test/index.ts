import Cpt from '../src/index';

Cpt.CommandFactory.register('/music search song [keyword:string,regex=/.+/,len=2@3] [num:number,range=1@3]', (ctx) => {
	console.log(`/music search song触发`);
	console.log(`keyword: ${ctx.get('input.keyword')}`);
	console.log(`num: ${ctx.get('input.num')}`);
});


Cpt.CommandFactory.commit('/music search song "aaaa" 1');