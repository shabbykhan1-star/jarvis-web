const vm=require('node:vm');const fs=require('node:fs');const assert=require('node:assert/strict');
const elements={};function el(id){return elements[id]??=( { id, value:'', checked:false, textContent:'',innerHTML:'',scrollHeight:0,scrollTop:0, classList:{add(){},remove(){},toggle(){}},addEventListener(){},click(){},focus(){} });}
const mem=new Map();const storage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
let seenBody=null;
const ctx={console,Intl,Date,Math,JSON,String,Array,Object,Number,Boolean,RegExp,URL,AbortController,setTimeout,clearTimeout,localStorage:storage,sessionStorage:storage,location:{protocol:'https:'},navigator:{},window:{addEventListener(){},scrollTo(){}},document:{getElementById:el,querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){},createElement:()=>({className:'',textContent:'',remove(){}}),body:{append(){}},},
fetch:async (url,options)=>{seenBody=JSON.parse(options.body);return {ok:true,status:200,json:async()=>({reply:'Boss, tumhari baat sun raha hoon! Ab real AI reply aa rahi hai.'})};}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(__dirname+'/../app.js','utf8'),ctx);
el('chat-input').value='Tu zyada bolta ni';vm.runInContext('sendChat()',ctx);
let reply=vm.runInContext('s.chat.at(-1).body',ctx);assert.match(reply,/Sahi keh rahe ho Boss/);
vm.runInContext("brainUrl='https://jarvis.example.workers.dev';brainToken='session-secret';",ctx);
el('chat-input').value='How are you?';
(async()=>{await vm.runInContext('sendChat()',ctx);
 reply=vm.runInContext('s.chat.at(-1).body',ctx);assert.match(reply,/real AI reply/);
 assert.equal(seenBody.context,null,'Context should not be shared without opt-in');
 assert.equal(seenBody.messages.at(-1).content,'How are you?');
 assert.equal(el('send-chat').disabled,false);
 console.log('Client tests passed: feedback handled, AI gateway reply, no default context sharing, send button reset.');
})().catch(e=>{console.error(e);process.exitCode=1});