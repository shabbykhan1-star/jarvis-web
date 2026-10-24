const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const scope = 'https://shabbykhan1-star.github.io/jarvis-web/';
const listeners = {}, buckets = new Map();
let online = true, calls = 0;
const caches = {
  async open(name) {
    if (!buckets.has(name)) buckets.set(name, new Map());
    const entries = buckets.get(name);
    return {
      async addAll(files) { for (const file of files) entries.set(new URL(file, scope).href, new Response('precache:' + file)); },
      async put(key, value) { entries.set(String(key), value); }
    };
  },
  async match(key) { for (const entries of buckets.values()) if (entries.has(String(key))) return entries.get(String(key)).clone(); },
  async keys() { return [...buckets.keys()]; },
  async delete(key) { return buckets.delete(key); }
};
const self = {
  location: { origin: new URL(scope).origin }, registration: { scope },
  addEventListener: (type, callback) => { listeners[type] = callback; },
  skipWaiting: async () => {}, clients: { claim: async () => {} }
};
vm.runInNewContext(fs.readFileSync(__dirname + '/../sw.js', 'utf8'), {
  self, caches, URL, Response,
  fetch: async request => { calls++; if (!online) throw Error('offline'); return new Response('fresh:' + new URL(request.url).pathname); }
});
async function lifecycle(type) {
  let pending; listeners[type]({waitUntil: p => {pending = p;} }); await pending;
}
async function request(url, method = 'GET') {
  let pending; listeners.fetch({request:{url,method,mode:'navigate'},respondWith:p=>{pending=p;}});
  return pending || null;
}
(async () => {
  await lifecycle('install');
  assert.equal(buckets.size,1);
  let r = await request(scope+'app.js?v=1');
  assert.equal(await r.text(),'fresh:/jarvis-web/app.js');
  online=false;
  r=await request(scope+'app.js?v=2');
  assert.equal(await r.text(),'fresh:/jarvis-web/app.js');
  r=await request(scope);
  assert.equal(await r.text(),'precache:./');
  const before=calls;
  assert.equal(await request('https://example.com/chat'),null);
  assert.equal(await request(scope+'app.js','POST'),null);
  assert.equal(await request(scope+'private-notes'),null);
  assert.equal(calls,before);
  buckets.set('old-cache',new Map());
  await lifecycle('activate');
  assert.equal(buckets.size,1);
  assert.ok([...buckets.keys()][0].includes('network-first'));
  console.log('Service worker tests passed: online freshness, offline shell, query normalization, bypass and cleanup.');
})().catch(e=>{console.error(e);process.exitCode=1;});
