export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          console.log('Service Worker registered:', registration);
          // Force update check
          registration.update();
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          // Log the error so we can debug
        });
    });
  }
};

