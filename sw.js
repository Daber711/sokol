// Мастер плитки: открывается из памяти телефона (без интернета и без входа),
// обновления скачиваются тихо в фоне и применяются при следующем запуске.
// Страницы входа/ошибок с сервера никогда не попадают в приложение.
const C="master-plitki-v10";
const F=["./","index.html","uchet.html","smeta.html","planerka.html","raskladka.html","manifest.json","icon-180.png","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(F.map(u=>fetch(u,{cache:"no-store"}).then(r=>{if(r.ok&&!r.redirected)return c.put(u,r)}).catch(()=>{})))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x.startsWith("master-plitki")).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
const good=r=>r&&r.ok&&!r.redirected&&r.type==="basic";
self.addEventListener("fetch",e=>{const req=e.request;if(req.method!=="GET")return;const url=new URL(req.url);if(url.origin!==location.origin)return;
  e.respondWith((async()=>{const c=await caches.open(C);
    const key=req.mode==="navigate"&&(url.pathname.endsWith("/"))?"index.html":req;
    const cached=await c.match(key,{ignoreSearch:true})||await caches.match(key,{ignoreSearch:true});
    const net=fetch(req).then(r=>{if(good(r))c.put(key,r.clone());return r}).catch(()=>null);
    if(cached){e.waitUntil(net);return cached}
    const r=await net;if(good(r))return r;
    return(await c.match("index.html"))||r||new Response("Нет связи",{status:503})})())});
