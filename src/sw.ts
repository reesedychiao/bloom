/// <reference lib="webworker" />
// Custom service worker (injectManifest): same precache/offline behavior the
// old generateSW config produced, plus web-push handlers.
import { clientsClaim } from "workbox-core";
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

self.skipWaiting();
clientsClaim();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

// Last-known garden offline: cache Supabase REST GETs stale-while-revalidate,
// so a reload with no network still shows the most recent data.
registerRoute(
  ({ url, request }) =>
    request.method === "GET" &&
    url.hostname.endsWith(".supabase.co") &&
    url.pathname.startsWith("/rest/"),
  new StaleWhileRevalidate({
    cacheName: "bloom-supabase-rest",
    plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 })],
  }),
);

self.addEventListener("push", (event) => {
  const data: { title?: string; body?: string; url?: string } = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Bloom", {
      body: data.body ?? "Your garden could use some tending.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url: string = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const open = clients.find((c) => "focus" in c);
      if (open) {
        open.navigate(url);
        return open.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
