export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // Register immediately, don't wait for load event
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('Service Worker registered:', registration);
        // Force update check
        registration.update();
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  }
};

