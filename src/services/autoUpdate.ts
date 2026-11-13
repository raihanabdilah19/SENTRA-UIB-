const RELOAD_GUARD_KEY = 'sentra_uib_last_reloaded_version';

export async function checkForAppUpdate(): Promise<void> {
  if (typeof window === 'undefined' || typeof __APP_BUILD_VERSION__ === 'undefined') {
    return;
  }

  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });

    if (!res.ok) return;

    const data = (await res.json()) as { version?: string };
    const latestVersion = data?.version;

    if (!latestVersion || latestVersion === __APP_BUILD_VERSION__) {
      return;
    }

    const alreadyReloadedFor = sessionStorage.getItem(RELOAD_GUARD_KEY);
    if (alreadyReloadedFor === latestVersion) {
      return;
    }

    sessionStorage.setItem(RELOAD_GUARD_KEY, latestVersion);

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    }

    window.location.reload();
  } catch {
    // Ignore transient network errors when offline
  }
}

export function startAutoUpdateWatcher(intervalMs = 60_000): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleVisibilityOrFocus = () => {
    if (document.visibilityState === 'visible') {
      void checkForAppUpdate();
    }
  };

  void checkForAppUpdate();

  const timer = window.setInterval(() => {
    void checkForAppUpdate();
  }, intervalMs);

  window.addEventListener('focus', handleVisibilityOrFocus);
  document.addEventListener('visibilitychange', handleVisibilityOrFocus);

  return () => {
    window.clearInterval(timer);
    window.removeEventListener('focus', handleVisibilityOrFocus);
    document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
  };
}
