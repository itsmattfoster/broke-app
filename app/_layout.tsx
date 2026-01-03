import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { registerServiceWorker } from '../lib/serviceWorker';

export default function RootLayout() {
  const { initialize: initializeAuth, user } = useAuthStore();
  const { initializeStore } = useAppStore();

  useEffect(() => {
    // Add manifest link and meta tags for PWA
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      // Add manifest link if it doesn't exist
      if (!document.querySelector('link[rel="manifest"]')) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        document.head.appendChild(manifestLink);
      }

      // Add Apple meta tags if they don't exist
      if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
        const appleCapable = document.createElement('meta');
        appleCapable.name = 'apple-mobile-web-app-capable';
        appleCapable.content = 'yes';
        document.head.appendChild(appleCapable);
      }

      if (!document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')) {
        const appleStatusBar = document.createElement('meta');
        appleStatusBar.name = 'apple-mobile-web-app-status-bar-style';
        appleStatusBar.content = 'black';
        document.head.appendChild(appleStatusBar);
      }

      if (!document.querySelector('meta[name="apple-mobile-web-app-title"]')) {
        const appleTitle = document.createElement('meta');
        appleTitle.name = 'apple-mobile-web-app-title';
        appleTitle.content = 'Broke';
        document.head.appendChild(appleTitle);
      }
    }

    // Register service worker for PWA
    registerServiceWorker();
    
    // Initialize auth first
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    // Initialize store after auth is ready and user is available
    if (user) {
      initializeStore();
    }
  }, [user, initializeStore]);

  return (
    <>
      <Slot />
      <PWAInstallPrompt />
    </>
  );
}

