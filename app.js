'use strict';
const KEY='jarvis-web-2026-v1';
const defaultStore=()=>({tasks:[],notes:[],prefs:{channel:'Shabby Vlogs',thumbnail:'Natural, realistic, clickable. Preserve original face; avoid over-AI look. Clean, curiosity-driven composition.',tone:'Friendly Roman Urdu / Hinglish. Call me boss. Be practical and clear.',voiceLang:'en-IN',autoSpeak:false},mood:'',ideaOffset:0,chat:[]});
let s=readStore(), mission='',lastReply='';
const BRAIN_URL_KEY='jarvis-worker-url-v2';
const SHARE_CONTEXT_KEY='jarvis-ai-share-context-v2';
let brainUrl='',brainToken='',shareContext=false,aiBusy=false;
try{brainUrl=localStorage.getItem(BRAIN_URL_KEY)||'';shareContext=localStorage.getItem(SHARE_CONTEXT_KEY)==='yes';brainToken=sessionStorage.getItem('jarvis-temporary-brain-token')||'';}catch{}
function normalizeBrainUrl(raw){
 try{const url=new URL(String(raw||'').trim());if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash||url.href.length>350) return '';
 return url.origin+url.pathname.replace(/\/+$/,'');}catch{return '';}
}
function brainReady(){return !!(brainUrl&&brainToken);}
function renderBrain(){
 const mode=brainReady()?'AI ready (not yet tested)':brainUrl?'Needs access code':'Offline · AI not connected';
 $('brain-status').textContent=mode;
 $('top-mode').textContent=brainReady()?'AI configured':'Local mode';
 $('mode-tag').textContent=brainReady()?'AI setup saved':'Offline assistant';
 $('brain-url').value=brainUrl;$('brain-token').value=brainToken;
 $('brain-share').checked=shareContext;
}
function localCommand(q){return /^(?:add task|task add|task:|yaad rakho|remember|note:)\s*/i.test(q)||
 /\b(next upload|upload kab|video kab|wednesday|sunday|thumbnail idea|tasks pending|pending tasks|schedule)\b/i.test(q);}
async function askBrain(){
 const history=s.chat.slice(-12).map(m=>({role:m.role==='user'?'user':'assistant',content:String(m.body).slice(0,650)}));
 const context=shareContext?{channel:s.prefs.channel,thumbnailStyle:s.prefs.thumbnail,tone:s.prefs.tone,openTasks:s.tasks.filter(t=>!t.done).slice(0,8).map(t=>t.title),notes:s.notes.slice(0,6).map(n=>n.text),nextUpload:nextUpload().day+' '+display(nextUpload().date)}:null;
 const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),22000);
 try{
  const result=await fetch(brainUrl+'/chat',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+brainToken},body:JSON.stringify({messages:history,context}),signal:ctrl.signal,cache:'no-store'});
  if(result.status===401||result.status===403)throw Error('Access code galat hai ya backend permission nahi de raha. Setup check karo.');
  if(result.status===429)throw Error('AI usage limit hit hui hai. Thori der baad try karna.');
  if(!result.ok)throw Error('AI server ne response nahi diya (status '+result.status+').');
  const data=await result.json();if(typeof data.reply!=='string'||!data.reply.trim())throw Error('AI ne empty jawab diya.');
  return data.reply.trim().slice(0,2200);
 }catch(e){return 'Boss, AI connection is waqt kaam nahi kar rahi: '+(e.name==='AbortError'?'request timeout ho gaya.':e.message||'network issue.')+' Offline tasks aur upload schedule phir bhi available hain.';}
 finally{clearTimeout(timeout);}
}

function readStore(){try{const x=JSON.parse(localStorage.getItem(KEY));if(!x||!Array.isArray(x.tasks)||!Array.isArray(x.notes)||!x.prefs||typeof x.prefs!=='object')return defaultStore();return {...defaultStore(),...x,prefs:{...defaultStore().prefs,...x.prefs}};}catch{return defaultStore();}}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{toast('Browser storage unavailable. Backup your data.');}}
const $=id=>document.getElementById(id);
const html=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const id=()=>String(Date.now())+'-'+Math.random().toString(36).slice(2,8);
function pDate(){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());const m=Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return new Date(Number(m.year),Number(m.month)-1,Number(m.day),12);}
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
function upcoming(day,includeToday=true){let t=pDate();const delta=(day-t.getDay()+7)%7; t.setDate(t.getDate()+((delta===0&&!includeToday)?7:delta));return t;}
function display(d){return d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});}
function daysAway(d){return Math.round((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())-Date.UTC(pDate().getFullYear(),pDate().getMonth(),pDate().getDate()))/86400000);}
function nextUpload(){const w=upcoming(3),u=upcoming(0);return w<u?{day:'Wednesday',date:w}:{day:'Sunday',date:u};}
function getMission(){const n=nextUpload(),left=daysAway(n.date);const name=left===0?'UPLOAD DAY':left===1?'FINAL CHECK':left===2?'EDITING':'PREPARE';let title,detail;
if(left===0){title=`Aaj ${n.day} ki video publish karo`;detail='Title, thumbnail, description, sound aur chapters final check karo, phir publish.';}
else if(left===1){title='Kal ka upload ready karo';detail='Final edit, export, thumbnail aur upload schedule finish karo.';}
else if(left===2){title='Editing + thumbnail day';detail='Best hook first 10 sec mein rakho aur natural thumbnail short-list karo.';}
else {title=`Next ${n.day} vlog ka topic choose karo`;detail='1 story angle choose karo, intro hook likho aur shoot checklist banao.';}
return {name,title,detail};}
function toast(msg){document.querySelector('.toast')?.remove();let el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.append(el);setTimeout(()=>el.remove(),2600);}
function switchTab(tab){document.querySelectorAll('.tabview').forEach(e=>e.classList.toggle('active',e.id==='page-'+tab));document.querySelectorAll('.navbtn').forEach(e=>e.classList.toggle('active',e.dataset.tab===tab));window.scrollTo({top:0,behavior:'instant'});}
const ideas=[
 {kind:'Lahore Food',topic:'Hidden breakfast street',title:'Lahore Ka Hidden Nashta Spot — Kya Ye Sach Mein Worth It Hai?',hook:'Is gali ka nashta log kyun recommend karte hain?',shot:'Natural surprised face on right; steaming breakfast close-up on left; simple street backdrop; no unrealistic food or altered face.'},
 {kind:'Challenge',topic:'Budget street-food crawl',title:'Lahore Street Food Challenge: Kitna Kuch Try Kar Sakte Hain?',hook:'Ek budget, teen stops — best taste kis ka?',shot:'Three authentic food closeups + simple price badge + realistic candid reaction; avoid clutter.'},
 {kind:'Adventure',topic:'Unknown historic lane',title:'Lahore Ki Is Purani Gali Mein Kya Chhupa Hai?',hook:'Main is jagah se roz guzarta tha, aaj andar gaya.',shot:'Genuine Lahore old-street photo, natural curious expression, one clear focal point, authentic lighting.'},
 {kind:'Food Review',topic:'Sajji spot comparison',title:'Lahore Mein Best Sajji? Do Spots Ka Real Comparison',hook:'Do jagah, same dish — taste mein farq kitna?',shot:'Real sajji plate versus plate split-screen; original face centered; no fake dramatic mouth expression.'},
 {kind:'Family Vlog',topic:'Sunday family outing',title:'Lahore Mein Ek Simple Sunday — Unexpected Surprise!',hook:'Plan bilkul simple tha, lekin ek cheez unexpected nikli.',shot:'Warm candid family-safe frame outdoors, unobstructed subject, soft natural sunlight.'},
 {kind:'Exploration',topic:'Park discovery',title:'Ye Lahore Ka Park Itna Underrated Kyun Hai?',hook:'Ek aisi jagah jo log miss kar dete hain.',shot:'Real greenery and park path, no huge text, natural curious posture; no fabricated location.'},
 {kind:'Creator Life',topic:'Behind the vlog',title:'Ek Vlog Banane Mein Kitni Mehnat Lagti Hai?',hook:'Camera on hone se pehle aur baad ki asal story.',shot:'Real behind-the-scenes camera or editing desk; minimal two-frame composition.'},
 {kind:'Street Food',topic:'Evening snacks market',title:'Lahore Ki Shaam Aur Is Market Ka Street Food!',hook:'Sab se zyada rush kis stall pe hai?',shot:'Atmospheric authentic evening market, clear food focal point, high contrast but realistic.'},
 {kind:'Urban Exploring',topic:'Local bazaar',title:'Lahore Ka Ye Bazaar Pehli Baar Explore Kiya!',hook:'Yahan ek cheez ne surprise kar diya.',shot:'Candid walkthrough photo, authentic storefronts, natural face, avoid fake signboards.'},
 {kind:'Food Journey',topic:'Wrap versus roll',title:'Wrap Ya Roll — Lahore Mein Winner Kaun?',hook:'Dono try karke fair verdict denge.',shot:'Two real food photos with neat VS label, one natural reaction, clean background.'},
 {kind:'Vlog Story',topic:'One day no fixed plan',title:'Lahore Mein Bina Plan Ke Poora Din!',hook:'Aaj ka vlog bilkul unplanned hai.',shot:'Real candid road or street moment; single bold visual, avoid synthetic effects.'},
 {kind:'Food',topic:'Local dessert hunt',title:'Lahore Ki Sweetest Hidden Treat Dhoondne Nikle!',hook:'Is sweet spot ka hype kitna real hai?',shot:'Single well-lit authentic dessert in foreground and subtle location context.'},
 {kind:'Culture',topic:'Morning Lahore',title:'Subah 6 Baje Lahore Kaisa Lagta Hai?',hook:'Jo Lahore tum raat mein dekhte ho woh subah bilkul alag hai.',shot:'Real dawn street scene in soft light and calm expression; avoid invented skylines.'},
 {kind:'Food',topic:'Home-style local lunch',title:'Lahore Ka Ghar Jaisa Khana — Real Taste Test',hook:'Simple khana kabhi kabhi sab se best hota hai.',shot:'One authentic lunch plate shot, simple restaurant background, no overdone AI steam.'},
 {kind:'Travel Nearby',topic:'Low-cost local outing',title:'Lahore Mein Simple Day Out — Kya Kya Mila?',hook:'Aisi outing jo planning mein easy ho.',shot:'Natural scenic photo, candid pose, minimal contrast enhancement.'},
 {kind:'Creator Story',topic:'YouTube milestone',title:'Mera YouTube Journey — Kya Seekha Maine?',hook:'Views ke peeche ki asli mehnat.',shot:'Real desk + laptop editing timeline, face natural; no fake analytics numbers.'},
 {kind:'Comparison',topic:'Tea spot review',title:'Lahore Ki Chai Ka Real Test — Worth the Hype?',hook:'Chai sirf taste hai ya experience bhi?',shot:'A genuine chai cup sharp in foreground, cozy stall, natural human portrait.'},
 {kind:'Adventure',topic:'City walk',title:'Lahore Ke Is Raaste Par Pehli Baar Gaya!',hook:'Socha ordinary hoga, kuch aur hi mila.',shot:'Authentic street landscape, curious eyes without face manipulation.'}
];
function todaysIdeaIndex(){return Math.floor(pDate().getTime()/86400000)%ideas.length;}
function addTask(title,due=''){title=String(title||'').trim().slice(0,160);if(!title)return false;s.tasks.unshift({id:id(),title,due,done:false,added:new Date().toISOString()});persist();renderTasks();renderHome();toast('Task added');return true;}
function renderHome(){const t=pDate(),m=getMission();mission=m.title; $('today-label').textContent=t.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).toUpperCase()+' · PKT';$('greeting').textContent=t.getDay()===3||t.getDay()===0?'Upload day, boss!':'Ready when you are, boss.';$('wed-next').textContent=display(upcoming(3))+(t.getDay()===3?' · Today':'');$('sun-next').textContent=display(upcoming(0))+(t.getDay()===0?' · Today':'');$('mission-tag').textContent=m.name;$('mission-title').textContent=m.title;$('mission-detail').textContent=m.detail;$('open-count').textContent=s.tasks.filter(x=>!x.done).length;$('memory-count').textContent=s.notes.length;}
function renderTasks(){let out=s.tasks.map(x=>`<div class="task ${x.done?'done':''}"><input class="check" type="checkbox" aria-label="Complete task" data-complete="${html(x.id)}" ${x.done?'checked':''}/><div style="flex:1;min-width:0"><div class="task-title">${html(x.title)}</div><div class="task-meta">${x.due?'Due '+html(x.due):'No due date'}</div></div><button class="delete" aria-label="Delete task" data-delete-task="${html(x.id)}">×</button></div>`).join('');$('task-list').innerHTML=out||'<p class="sub">No tasks yet. Add your first one above.</p>';$('tasks-badge').textContent=s.tasks.filter(x=>!x.done).length+' OPEN';}
function ideaCard(x,i){return `<div class="card idea"><div class="topic">${html(x.kind)} · ${html(x.topic)}</div><h3>${html(x.title)}</h3><div class="sub"><b>Hook:</b> ${html(x.hook)}</div><div class="shot"><b>📷 Natural thumbnail brief</b><div style="margin-top:4px">${html(x.shot)}</div></div><div class="btn-row"><button class="btn primary" data-use-idea="${i}">Use this idea</button><button class="btn secondary" data-copy-idea="${i}">Copy brief</button></div></div>`;}
let currentIdeas=[];
function renderIdeas(){const start=(todaysIdeaIndex()+s.ideaOffset*3)%ideas.length;currentIdeas=[0,1,2].map(i=>ideas[(start+i)%ideas.length]);$('ideas-list').innerHTML=currentIdeas.map((x,i)=>ideaCard(x,i)).join('');}
function renderMemory(){$('channel-name').value=s.prefs.channel;$('thumbnail-style').value=s.prefs.thumbnail;$('assistant-tone').value=s.prefs.tone;$('voice-language').value=s.prefs.voiceLang||'en-IN';$('auto-speak').checked=!!s.prefs.autoSpeak;$('memory-list').innerHTML=s.notes.map(n=>`<div class="task"><div style="flex:1;overflow-wrap:anywhere">${html(n.text)}</div><button class="delete" aria-label="Delete memory" data-delete-memory="${html(n.id)}">×</button></div>`).join('')||'<p class="sub">No saved notes yet.</p>';}
function addNote(text){text=String(text||'').trim().slice(0,300);if(!text)return false;s.notes.unshift({id:id(),text});persist();renderMemory();renderHome();toast('Saved in local memory');return true;}
function speakText(phrase){
 if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){toast('Voice playback iPhone browser mein available nahi.');return false;}
 const synth=window.speechSynthesis;const utter=new SpeechSynthesisUtterance(String(phrase||'').slice(0,650));
 const lang=['en-IN','ur-PK','hi-IN'].includes(s.prefs.voiceLang)?s.prefs.voiceLang:'en-IN';
 utter.lang=lang;utter.rate=.94;
 const voices=synth.getVoices();
 const voice=voices.find(v=>v.lang.toLowerCase()===lang.toLowerCase())||voices.find(v=>v.lang.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));
 if(voice)utter.voice=voice;
 try{synth.cancel();synth.speak(utter);return true;}catch{toast('Voice playback failed');return false;}
}
function pushChat(role,body,save=true){
 s.chat.push({role,body:String(body).slice(0,600)});
 if(s.chat.length>30)s.chat=s.chat.slice(-30);
 if(role==='assistant')lastReply=body;
 if(save)persist();renderChat();
 if(role==='assistant'&&s.prefs.autoSpeak)speakText(body);
}
function renderChat(){let chat=s.chat;if(!chat.length){chat=[{role:'assistant',body:brainReady()?'Haan Boss, AI brain configured hai. Apni baat bolo — AI server se jawab aayega.':'Haan Boss! Abhi offline hoon; tasks, next upload aur thumbnail ideas mein help kar sakta hoon. Natural AI conversation ke liye Setup mein AI Brain connect karna hoga.'}];}
$('chat').innerHTML=chat.map(m=>`<div class="bubble ${m.role==='user'?'user':'assistant'}">${html(m.body)}</div>`).join('');$('chat').scrollTop=$('chat').scrollHeight;}
function respond(raw){const q=raw.toLowerCase().trim();let match;
if((match=raw.match(/^(?:add task|task add|task:)\s*(.*)$/i))){return addTask(match[1])?'Boss, task save ho gaya! Tasks tab mein dekh lo.':'Task ka naam batao, jaise add task: edit vlog.';}
if((match=raw.match(/^(?:yaad rakho|remember|note:)\s*(.*)$/i))){return addNote(match[1])?'Ye baat is iPhone ke browser mein note kar li, Boss.':'Kya note save karna hai Boss?';}
if(/upload|wednesday|sunday|video kab|schedule|kab hai/.test(q)){const n=nextUpload();return `Boss, next upload ${n.day}, ${display(n.date)} ko hai. Hum Wednesday aur Sunday ko videos upload karte hain.`;}
if(/thumbnail|thumb|title|idea|topic|trend|vlog/.test(q)){const item=currentIdeas[0]||ideas[0];return `Boss, ye curated idea try karo: ${item.title}. Natural thumbnail: ${item.shot}. Live trends confirm karne ke liye online research feature chahiye.`;}
if(/\b(tasks|pending|kaam|to.do)\b/.test(q)){let n=s.tasks.filter(x=>!x.done);return n.length?`Boss, ${n.length} pending tasks hain. Agla kaam: ${n[0].title}`:'Boss, abhi koi pending task nahi. Tasks tab mein add kar sakte ho.';}
if(/stress|tired|thak|down|sad|pareshan|views kam/.test(q)){return 'Boss, samajh gaya. Aaj sab kuch ek saath karna zaroori nahi. Pehle ek manageable kaam chun lete hain. Tum kis cheez par focus karna chahte ho?';}
if(/zyada bolta|zyada bol|zyaada|bolta ni|bolta nahi|kam bol|same reply|repeat|boring|basic|gussa|bakwas|bekar/.test(q)){return 'Sahi keh rahe ho Boss. Pehle wala jawab baar-baar repeat hota tha kyunki main offline rule-based mode mein hoon. Maine is bug ka response improve kiya hai, lekin real natural conversation ke liye AI Brain setup zaroori hai.';}
if(/^(?:hi|hello|salam|assalam|hey|jarvis|aoa|kya haal|how are you)[!?. ]*$/i.test(q)){return 'Haan Boss! Main yahan hoon. Aaj YouTube planning karni hai ya kisi aur baat par help chahiye?';}
if(/\b(thanks|shukriya|thank you)\b/.test(q)){return 'Khushi hui Boss! Agla kaam batao.';}
const variants=[
 'Boss, tumhari baat suni. Iska genuinely intelligent jawab dene ke liye AI Brain connect karna hoga. Filhaal main offline mode mein hoon — koi specific task ya upload question hai?',
 'Samajh raha hoon Boss, lekin bina AI backend ke main khuli conversation ka sahi jawab nahi de sakta. Main jhoota smart banne ke bajaye ye clear rakhunga. Setup mein AI Brain connection available hai.',
 'Boss, tumhe har baar same scripted jawab nahi milna chahiye. Ye version offline commands chala sakta hai, lekin natural conversation ke liye AI service connect karni hogi. Koi task add karna hai?'
 ];
 return variants[(s.chat.filter(m=>m.role==='user').length-1)%variants.length];
}
async function sendChat(){
 if(aiBusy)return;const v=$('chat-input').value.trim();if(!v)return;
 $('chat-input').value='';pushChat('user',v);
 if(!brainReady()||localCommand(v)){pushChat('assistant',respond(v));return;}
 aiBusy=true;$('send-chat').disabled=true;$('send-chat').textContent='Thinking…';
 try{pushChat('assistant',await askBrain());}
 finally{aiBusy=false;$('send-chat').disabled=false;$('send-chat').textContent='Send';}
}
function renderMood(){document.querySelectorAll('[data-mood]').forEach(b=>b.classList.toggle('selected',b.dataset.mood===s.mood));const val={focused:'Great. Ek important task choose karke start karte hain.',tired:'Thakan ho to chhota task aur break dono theek hain.',excited:'Nice energy! Isko ek video idea ya script hook mein lagate hain.',stressed:'Aaj ka workload simple karte hain: sab se zaroori ek kaam.'};$('mood-response').textContent=val[s.mood]||'Select a mood for a response style. JARVIS does not experience feelings.';}
async function copy(txt){try{await navigator.clipboard.writeText(txt);toast('Copied');}catch{toast('Copy unavailable. Select text manually.');}}
function download(name,data,type){const b=new Blob([data],{type});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);}
function wire(){document.addEventListener('click',e=>{const tab=e.target.closest('[data-tab]');if(tab){switchTab(tab.dataset.tab);return;}const button=e.target.closest('[data-action]');if(button?.dataset.action==='mission-task'){addTask(mission,iso(nextUpload().date));switchTab('tasks');return;}const del=e.target.closest('[data-delete-task]');if(del){s.tasks=s.tasks.filter(x=>x.id!==del.dataset.deleteTask);persist();renderTasks();renderHome();return;}const delnote=e.target.closest('[data-delete-memory]');if(delnote){s.notes=s.notes.filter(n=>n.id!==delnote.dataset.deleteMemory);persist();renderMemory();renderHome();return;}
const b=e.target.closest('[data-use-idea]');if(b){const x=currentIdeas[Number(b.dataset.useIdea)];if(x){addTask('Vlog: '+x.title,iso(nextUpload().date));switchTab('tasks');}return;}
const c=e.target.closest('[data-copy-idea]');if(c){const x=currentIdeas[Number(c.dataset.copyIdea)];if(x)copy(`Topic: ${x.topic}\nTitle: ${x.title}\nHook: ${x.hook}\nThumbnail brief: ${x.shot}`);return;}
const mood=e.target.closest('[data-mood]');if(mood){s.mood=mood.dataset.mood;persist();renderMood();return;}
});document.addEventListener('change',e=>{const c=e.target.closest('[data-complete]');if(c){const t=s.tasks.find(x=>x.id===c.dataset.complete);if(t){t.done=c.checked;persist();renderTasks();renderHome();}}});
$('add-task').onclick=()=>{if(addTask($('new-task').value,$('task-date').value)){$('new-task').value='';$('task-date').value='';}};
$('new-task').onkeydown=e=>{if(e.key==='Enter')$('add-task').click();};
$('clear-done').onclick=()=>{s.tasks=s.tasks.filter(x=>!x.done);persist();renderTasks();renderHome();toast('Completed tasks cleared');};
$('shuffle-ideas').onclick=()=>{s.ideaOffset=(s.ideaOffset+1)%6;persist();renderIdeas();};
$('custom-generate').onclick=()=>{let topic=$('custom-topic').value.trim().slice(0,100);if(!topic){toast('Type a topic first');return;}const title=`${topic} — Kya Ye Lahore Mein Worth It Hai?`;const shot=`Use a real photo of ${topic}, natural lighting and a clear subject. Keep original face unchanged. No crowded text or unrealistic AI details.`;$('custom-result').classList.remove('hidden');$('custom-result').innerHTML=`<h3>${html(title)}</h3><p class="sub">Hook: Aaj dekhte hain ${html(topic)} ka real experience kaisa hai.</p><div class="note">Thumbnail: ${html(shot)}</div><div class="spacer"></div><button class="btn primary" id="save-custom-idea">Save as task</button>`;$('save-custom-idea').onclick=()=>{addTask('Vlog: '+title,iso(nextUpload().date));switchTab('tasks');};};
$('save-preferences').onclick=()=>{s.prefs.channel=$('channel-name').value.trim().slice(0,75);s.prefs.thumbnail=$('thumbnail-style').value.trim().slice(0,600);s.prefs.tone=$('assistant-tone').value.trim().slice(0,600);persist();toast('Preferences saved locally');};
$('voice-language').onchange=e=>{s.prefs.voiceLang=['en-IN','ur-PK','hi-IN'].includes(e.target.value)?e.target.value:'en-IN';persist();};
$('auto-speak').onchange=e=>{s.prefs.autoSpeak=!!e.target.checked;persist();toast(s.prefs.autoSpeak?'Auto voice on':'Auto voice off');};
$('voice-preview').onclick=()=>speakText('Haan boss! Main JARVIS hoon. Aaj hum tumhari video planning aur tasks manage karenge.');
$('add-memory').onclick=()=>{if(addNote($('memory-input').value))$('memory-input').value='';};
$('memory-input').onkeydown=e=>{if(e.key==='Enter')$('add-memory').click();};
$('send-chat').onclick=sendChat;$('chat-input').onkeydown=e=>{if(e.key==='Enter')sendChat();};
$('speak-latest').onclick=()=>speakText(lastReply||'Boss, JARVIS web prototype ready.');
$('export-data').onclick=()=>download('jarvis-backup-'+iso(pDate())+'.json',JSON.stringify({version:1,exported:new Date().toISOString(),data:s},null,2),'application/json');
$('import-trigger').onclick=()=>$('import-file').click();
$('import-file').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>2_000_000)throw Error('File too large');const raw=JSON.parse(await f.text());let data=raw.data;if(!data||!Array.isArray(data.tasks)||!Array.isArray(data.notes)||!data.prefs||typeof data.prefs!=='object')throw Error('Unrecognized backup');if(!confirm('Replace current JARVIS tasks and memory with this backup?'))return;s={...defaultStore(),...data,chat:Array.isArray(data.chat)?data.chat.slice(-30):[],prefs:{...defaultStore().prefs,...data.prefs}};persist();refresh();toast('Backup imported');}catch(err){toast('Import failed: '+err.message);}finally{e.target.value='';}};
$('save-brain').onclick=()=>{
 const url=normalizeBrainUrl($('brain-url').value);
 if($('brain-url').value.trim()&&!url){toast('Valid HTTPS Worker URL likho');return;}
 brainUrl=url;brainToken=String($('brain-token').value||'').trim().slice(0,500);shareContext=$('brain-share').checked;
 try{localStorage.setItem(BRAIN_URL_KEY,brainUrl);localStorage.setItem(SHARE_CONTEXT_KEY,shareContext?'yes':'no');if(brainToken)sessionStorage.setItem('jarvis-temporary-brain-token',brainToken);else sessionStorage.removeItem('jarvis-temporary-brain-token');}catch{toast('Settings session mein hi rahengi');}
 renderBrain();renderChat();toast(brainReady()?'AI configuration saved; try a message':'Offline mode saved');
};
$('disconnect-brain').onclick=()=>{brainUrl='';brainToken='';shareContext=false;try{localStorage.removeItem(BRAIN_URL_KEY);localStorage.removeItem(SHARE_CONTEXT_KEY);sessionStorage.removeItem('jarvis-temporary-brain-token');}catch{}renderBrain();renderChat();toast('AI disconnected');};
$('reset-data').onclick=()=>{if(!confirm('Permanently clear all JARVIS data saved on this device?'))return;s=defaultStore();persist();refresh();toast('Local data cleared');};
}
function refresh(){renderHome();renderTasks();renderIdeas();renderMemory();renderChat();renderMood();renderBrain();}
refresh();wire();
if('serviceWorker' in navigator && ['https:','http:'].includes(location.protocol))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));