## Simple command system (简易命令系统)

一个简易的命令系统，支持自定义参数类型，自定义参数规则。

这件事应该从 `2023-08-30` 说起，我看见了某个机器人的触发方式，类似于 `Minecraft` 的命令系统，但是她是使用 `正则表达式（Regular expression）` 实现的，有那么一点点不符合逻辑（我看不顺眼），所以就产出了这个项目。

其他语言将在”近期“陆续发布。

### 使用

#### 安装

使用 `npm`
```shell
npm install yingyya-cpt
```
使用 `yarn`
```shell
yarn add yingyya-cpt
```

#### 代码

`index.ts`：

```typescript
import Cpt from 'yingyya-cpt';
import MyCustomParam from './MyCustomParam';

// 注册自定义类型 自定义类型必须优先注册
Cpt.CommandFactory.registerParamType(MyCustomParam);
//                                                       内置类型-string                 内置类型-number             自定义类型-my
// 内置类型有 string number boolean
// 注册命令
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
// 触发命令
Cpt.CommandFactory.commit('/music search song "aaa" 1 a');
console.log('----------------------------------------');
// 自定义命令上下文
const context = new Cpt.CommandContext();
context.set('my-ctx-prop', new Date());
Cpt.CommandFactory.commit('/music search song "aaa" 1 a', context);
```

`MyCustomParam.ts`：

```typescript
import Cpt from 'yingyya-cpt';

class MyParamType extends Cpt.CommandParamType {
	constructor() {
		super();
		// 填写参数类型时的内容
		// [KEY:my]
		this.type = 'my';
	}

	// 额外规则验证
	// [KEY:my,append=aa]
	propValidate(key: string, value: string): boolean {
		if (key === 'append') {
			if (value.length === 0) {
				throw new ParamPropException(this.type, key, `需要正确的追加文字。`);
			}
		}
		return true;
	}

	// 支持的额外规则列表
	// 参数声明中的额外规则必须在此处声明
	props(): string[] {
		return [
			'append'
		];
	}

	// 转换成内部类型
    // 如字符串"true"转成true
	toValue(value: any): any {
		return value;
	}

	// 参数验证
    // value为参数值
    // params为当前参数对象
	validate(value: any, params?: CommandParam): boolean {
		return (value as string).length !== 0;
	}
}
```