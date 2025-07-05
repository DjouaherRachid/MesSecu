export async function clearAllBrowserData(): Promise<void> {
  try {
    // 1. Cookies (nécessite un path/domain précis pour certains)
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
    });

    // 2. localStorage et sessionStorage
    localStorage.clear();
    sessionStorage.clear();

    // 3. IndexedDB
    await clearAllIndexedDBDatabases();

    // 4. Cache API (Service Workers)
    if ('caches' in window) {
      await caches.keys().then(cacheNames => {
        return Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
      });
    }

    // 5. Service Workers (désenregistrement)
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(reg => reg.unregister()));
    }

    console.log('[Cleanup] Toutes les données de navigation ont été supprimées');
  } catch (error) {
    console.error('[Cleanup] Erreur lors du nettoyage:', error);
    throw error;
  }
}

// Helper pour IndexedDB
async function clearAllIndexedDBDatabases(): Promise<void> {
  try {
    const dbs = await window.indexedDB.databases();
    await Promise.all(dbs.map(db => {
      return new Promise<void>((resolve, reject) => {
        if (!db.name) {
          console.warn('[Cleanup] Pas de nom de base de données pour IndexedDB');
          return resolve();
        }
        const request = indexedDB.deleteDatabase(db.name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error(`Failed to delete DB: ${db.name}`));
      });
    }));
  } catch (error) {
    console.warn('[Cleanup] Impossible de lister les bases IndexedDB:', error);
  }
}