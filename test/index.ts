import CommandFactory from '../src/CommandFactory';

CommandFactory.register('/music search song [keyword:string]', () => console.log(111));


CommandFactory.commit('/music search song "s s s"');