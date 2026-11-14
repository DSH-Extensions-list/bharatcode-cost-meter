import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
const {SlotCore}=await import(pathToFileURL(process.env.DSH_SOURCE+'/packages/client/ui-slots/lib/index.js'));
test('shipped cost turn contribution registers in the real RC3 chain slot',()=>{
 const source=fs.readFileSync(new URL('../lib/client.js',import.meta.url),'utf8');
 const object=source.match(/\{name:"conversation\.chat\.turnTail",id:"cost-meter-turn",[^}]+\}/)?.[0];assert.ok(object);
 const options=vm.runInNewContext('('+object+')',new Proxy({}, {get:()=>()=>({})}));
 const slots=new SlotCore();slots.register({name:'root',children:{'conversation.chat.turnTail':{kind:'chain',scope:'root'}}},()=>null);
 assert.doesNotThrow(()=>slots.register(options,()=>null));const props={sessionId:'fixture'};assert.equal(options.select(props),props);
});
