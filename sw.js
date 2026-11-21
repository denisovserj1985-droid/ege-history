const C='ege-v21';
const MC='ege-maps-2'; // карты: отдельный кэш, не стирается при обновлении сайта
const FILES=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./mistakes.json'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C&&k!==MC).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  const key=u.pathname.endsWith('.json')?new Request(u.origin+u.pathname):e.request;
  if(u.pathname.includes('/maps/')){
    e.respondWith(caches.open(MC).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)c.put(e.request,r.clone());return r}));
    return;
  }
  if(u.pathname.endsWith('.json')||e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cl=r.clone();caches.open(C).then(c=>c.put(key,cl))}return r}).catch(()=>caches.match(key,{ignoreSearch:true})));
    return;
  }
  e.respondWith(caches.open(C).then(async c=>{
    const hit=await c.match(e.request,{ignoreSearch:true});
    const net=fetch(e.request).then(r=>{if(r.ok)c.put(e.request,r.clone());return r}).catch(()=>hit);
    return hit||net;
  }));
});
