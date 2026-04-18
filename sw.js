
var CACHE_NAME = 'Star-cache';

// 安装
self.addEventListener('install', function() {
  self.skipWaiting();
});

// 激活
self.addEventListener('activate', function(e) {
  e.waitUntil(self.clients.claim());
});

// 请求：网络优先，失败用缓存
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request).then(function(res) {
      if (res && res.status === 200) {
        var clone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
      }
      return res;
    }).catch(function() {
      return caches.match(e.request);
    })
  );
});
