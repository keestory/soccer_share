// 서비스워커 — 설치 가능성 + 정적 자산 오프라인 캐시만.
// 인증/개인화된 HTML(navigation) 응답은 절대 캐시하지 않는다(공유 기기에서 타인 세션 노출 방지).
const CACHE = "soccershare-static-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // 정적 자산만 cache-first (해시된 빌드 산출물·아이콘·매니페스트). HTML 문서는 항상 네트워크.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest";

  if (!isStatic) return; // navigation/문서/데이터 요청은 SW가 관여하지 않음(항상 네트워크)

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const res = await fetch(request);
      if (res.ok) cache.put(request, res.clone());
      return res;
    }),
  );
});
