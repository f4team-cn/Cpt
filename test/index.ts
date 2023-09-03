import Cpt from '../src/index';
import CommandParam from '../src/CommandParam';
import ParamPropException from '../src/exceptions/ParamPropException';

class MyParamType extends Cpt.CommandParamType {
	constructor() {
		super();
		this.type = 'my'
	}

	propValidate(key: string, value: string): boolean {
		if (key === 'append') {
			if (value.length === 0) {
				throw new ParamPropException(this.type, key, `需要正确的追加文字。`);
			}
		}
		return true;
	}

	props(): string[] {
		return [
			'append'
		];
	}

	toValue(value: any): any {
		return value;
	}

	validate(value: any, params?: CommandParam): boolean {
		return (value as string).length !== 0;
	}
}

Cpt.CommandFactory.registerParamType(new MyParamType());

Cpt.CommandFactory.register('/music search song [keyword:string,regex=/.+/,len=2@3] [num:number,range=1@3] [t:my,append=abdc]', (ctx) => {
	console.log(`/music search song触发`);
	// 获取参数的内容
	// input.${参数键}
	console.log(`keyword: ${ctx.get('input.keyword')}`);
	console.log(`num: ${ctx.get('input.num')}`);
	console.log(`t: ${ctx.get('input.t')}`);
	console.log('===============================');
	console.log((ctx.get('my-ctx-prop') as Date)?.toLocaleString());
});

const context = new Cpt.CommandContext();

context.set('my-ctx-prop', new Date());

Cpt.CommandFactory.commit('/music search song "aaa" 1 a');
console.log('----------------------');
// 自定义上下文
Cpt.CommandFactory.commit('/music search song "aaa" 1 a', context);