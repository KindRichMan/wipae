const CACHE = "wipae-cache-v3";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./firebase-config.js","./icon-192.png","./icon-512.png"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));})
      .then(function(){return self.clients.claim();})
  );
});
self.addEventListener("fetch", function(e){
  var req=e.request;
  var isHTML = req.mode==="navigate" || (req.method==="GET" && (req.headers.get("accept")||"").indexOf("text/html")>-1);
  if(isHTML){
    e.respondWith(
      fetch(req, {cache:"no-store"}).then(function(res){
        var cp=res.clone(); caches.open(CACHE).then(function(c){c.put("./index.html",cp);}); return res;
      }).catch(function(){ return caches.match("./index.html"); })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(r){
      return r || fetch(req).then(function(res){ var cp=res.clone(); caches.open(CACHE).then(function(c){c.put(req,cp);}); return res; }).catch(function(){return r;});
    })
  );
});
