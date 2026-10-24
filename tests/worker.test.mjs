import assert from 'node:assert/strict';
import worker from '../worker/worker.mjs';
const base='https://jarvis-worker.example.workers.dev';
const origin='https://shabbykhan1-star.github.io';
const env={OPENAI_API_KEY:'sample-not-real',JARVIS_ACCESS_TOKEN:'long-random-secret-code-for-tests-only',ALLOWED_ORIGIN:origin};
const req=(path,method='POST',token='')=>new Request(base+path,{method,headers:{Origin:origin, ...(method==='POST'?{'Content-Type':'application/json',Authorization:'Bearer '+token}: {})}, ...(method==='POST'?{body:JSON.stringify({messages:[{role:'user',content:'Tu zyada bolta ni'}]})}: {})});
let r=await worker.fetch(req('/chat','POST','bad-token'),env);assert.equal(r.status,401);
r=await worker.fetch(new Request(base+'/chat',{method:'POST',headers:{Origin:'https://evil.example',Authorization:'Bearer '+env.JARVIS_ACCESS_TOKEN},body:'{}'}),env);assert.equal(r.status,403);
r=await worker.fetch(req('/health','GET'),env);assert.equal((await r.json()).ok,true);
r=await worker.fetch(new Request(base+'/chat',{method:'OPTIONS',headers:{Origin:origin}}),env);assert.equal(r.status,204);assert.equal(r.headers.get('Access-Control-Allow-Origin'),origin);
const nativeFetch=globalThis.fetch;
try{
 globalThis.fetch=async(url,options)=>{
  assert.equal(url,'https://api.openai.com/v1/responses');
  assert.equal(options.headers.Authorization,'Bearer sample-not-real');
  const data=JSON.parse(options.body);assert.equal(data.store,false);assert.ok(data.instructions.includes('Roman Urdu/Hinglish'));
  assert.equal(data.input.at(-1).content,'Tu zyada bolta ni');
  return Response.json({output:[{type:'message',content:[{type:'output_text',text:'Haan Boss, batao kya scene hai?'}]}]});
 };
 r=await worker.fetch(req('/chat','POST',env.JARVIS_ACCESS_TOKEN),env);
 assert.equal(r.status,200);assert.equal((await r.json()).reply,'Haan Boss, batao kya scene hai?');
}finally{globalThis.fetch=nativeFetch;}
console.log('Worker tests passed: unauthorized, origin, health, CORS, Responses API success.');