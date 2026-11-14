import {registerHooks,createRequire} from 'node:module';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
const root=process.env.DSH_SOURCE;if(!root)throw Error('DSH_SOURCE must point to built Harness checkout');
const packages=new Map();
function scan(dir,depth=0){if(depth>4)return;const file=join(dir,'package.json');if(existsSync(file)){const pkg=JSON.parse(readFileSync(file));if(pkg.name)packages.set(pkg.name,file);}for(const entry of readdirSync(dir,{withFileTypes:true}))if(entry.isDirectory()&&!['node_modules','lib','src','tests','types','.git'].includes(entry.name))scan(join(dir,entry.name),depth+1);}
scan(join(root,'packages'));scan(join(root,'vendor'));
const fallback=createRequire(join(root,'package.json'));let resolving=false;
registerHooks({resolve(s,c,next){if(resolving)return next(s,c);const name=s.startsWith('@')?s.split('/').slice(0,2).join('/'):s.split('/')[0];const pkg=packages.get(name);if(pkg){resolving=true;try{return {url:pathToFileURL(createRequire(pkg).resolve(s)).href,shortCircuit:true}}finally{resolving=false}}try{return next(s,c)}catch(e){if(s.startsWith('.')||s.startsWith('/')||s.startsWith('file:'))throw e;resolving=true;try{return {url:pathToFileURL(fallback.resolve(s)).href,shortCircuit:true}}finally{resolving=false}}}});
