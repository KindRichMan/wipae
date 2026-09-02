const CACHE = "wipae-cache-v10";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./firebase-config.js",
  "./icon-192.png",
  "./icon-512.png",
  "./hanja-helper.css",
  "./hanja-helper.js",
  "./easy-tools-v2.js"
];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener("fetch", function(e){
  var req=e.request;
  if(req.method!=="GET") return;
  var url;
  try{ url=new URL(req.url); }catch(_){ return; }

  var isHTML=req.mode==="navigate" || (req.headers.get("accept")||"").indexOf("text/html")>-1;
  if(isHTML){
    // HTML 은 항상 최신을 먼저 시도(온라인이면 최신), 실패 시 캐시
    e.respondWith(fetch(req,{cache:"no-store"}).then(function(res){
      var cp=res.clone(); caches.open(CACHE).then(function(c){c.put("./index.html",cp);}); return res;
    }).catch(function(){return caches.match("./index.html").then(function(r){return r || caches.match("./");});}));
    return;
  }

  if(url.origin===location.origin){
    // 우리 파일(js/css/아이콘): 캐시로 즉시 표시 + 뒤에서 새 파일 받아 캐시 갱신(stale-while-revalidate)
    // → sw.js 캐시번호를 안 올려도 다음 실행 때 자동으로 최신 코드가 적용된다.
    e.respondWith(caches.match(req).then(function(cached){
      var network=fetch(req).then(function(res){
        if(res && res.ok){ var cp=res.clone(); caches.open(CACHE).then(function(c){c.put(req,cp);}); }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    }));
    return;
  }

  // 외부(파이어베이스 SDK, 폰트 등): 네트워크 우선, 실패 시 캐시
  e.respondWith(fetch(req).then(function(res){
    if(res && res.ok && (req.url.indexOf("gstatic")>-1 || req.url.indexOf("googleapis")>-1)){
      var cp=res.clone(); caches.open(CACHE).then(function(c){c.put(req,cp);});
    }
    return res;
  }).catch(function(){ return caches.match(req); }));
});
