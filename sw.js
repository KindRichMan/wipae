const CACHE = "wipae-cache-v4";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./firebase-config.js","./icon-192.png","./icon-512.png","./hanja-helper.css","./hanja-helper.js"];
self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(ASSETS);}).then(function(){return self.skipWaiting();}));
});
self.addEventListener("activate", function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
function enhanceHTML(res){
  return res.text().then(function(html){
    if(html.indexOf("hanja-helper.js")<0){
      html=html.replace("</head>",'<link rel="stylesheet" href="hanja-helper.css"></head>');
      html=html.replace("</body>",'<script src="hanja-helper.js"></script></body>');
    }
    return new Response(html,{status:res.status,statusText:res.statusText,headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-cache"}});
  });
}
self.addEventListener("fetch", function(e){
  var req=e.request;
  var isHTML=req.mode==="navigate" || (req.method==="GET" && (req.headers.get("accept")||"").indexOf("text/html")>-1);
  if(isHTML){
    e.respondWith(fetch(req,{cache:"no-store"}).then(function(res){
      var cp=res.clone(); caches.open(CACHE).then(function(c){c.put("./index.html",cp);}); return enhanceHTML(res);
    }).catch(function(){return caches.match("./index.html").then(function(r){return enhanceHTML(r);});}));
    return;
  }
  e.respondWith(caches.match(req).then(function(r){return r || fetch(req).then(function(res){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(req,cp);});return res;}).catch(function(){return r;});}));
});