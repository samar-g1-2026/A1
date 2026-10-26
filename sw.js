const CACHE='grammar-adventure-v5';
const CORE=['./','./index.html','./platform.css','./manifest.json','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(CORE);await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(key=>key.startsWith('grammar-adventure-')&&key!==CACHE).map(key=>caches.delete(key)));await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 // Always fetch game pages and game assets fresh so old game builds cannot linger in cache.
 const isGameAsset=url.pathname.includes('/games/');
 if(isGameAsset){event.respondWith(fetch(request).catch(()=>caches.match(request)));return;}
 // Network-first for page navigation: updated platform and game links appear without a manual refresh.
 if(request.mode==='navigate'||request.destination==='document'){
  event.respondWith(fetch(request).then(response=>{
   if(response.ok) caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
   return response;
  }).catch(()=>caches.match(request).then(cached=>cached||caches.match('./index.html'))));
  return;
 }
 // Cache-first only for the small, versioned platform shell; update cache in the background on misses.
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok&&CORE.some(path=>new URL(path,self.location.href).pathname===url.pathname))caches.open(CACHE).then(cache=>cache.put(request,response.clone()));
  return response;
 })));
});
