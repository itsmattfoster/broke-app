import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';
import { registerServiceWorker } from '../lib/serviceWorker';
import { ErrorBoundary } from '../components/ErrorBoundary';

export default function RootLayout() {
  const { initialize: initializeAuth, user } = useAuthStore();
  const { initializeStore } = useAppStore();

  useEffect(() => {
    console.log('[RootLayout] Component mounted');
    console.log('[RootLayout] Platform:', Platform.OS);
    
    try {
      // Add manifest link and meta tags for PWA
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        console.log('[RootLayout] Setting up PWA meta tags');
        // Add manifest link if it doesn't exist
        if (!document.querySelector('link[rel="manifest"]')) {
          const manifestLink = document.createElement('link');
          manifestLink.rel = 'manifest';
          manifestLink.href = '/manifest.json';
          document.head.appendChild(manifestLink);
          console.log('[RootLayout] Added manifest link');
        }

        // Add Apple meta tags if they don't exist
        if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
          const appleCapable = document.createElement('meta');
          appleCapable.name = 'apple-mobile-web-app-capable';
          appleCapable.content = 'yes';
          document.head.appendChild(appleCapable);
          console.log('[RootLayout] Added Apple meta tags');
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
      console.log('[RootLayout] Registering service worker');
      registerServiceWorker();
      
      // Initialize auth first
      console.log('[RootLayout] Initializing auth');
      initializeAuth();
    } catch (error) {
      console.error('[RootLayout] Error in useEffect:', error);
    }
  }, [initializeAuth]);

  useEffect(() => {
    console.log('[RootLayout] User state changed:', { user: !!user, loading: false });
    // Initialize store after auth is ready and user is available
    if (user) {
      console.log('[RootLayout] Initializing store for user');
      try {
        initializeStore();
      } catch (error) {
        console.error('[RootLayout] Error initializing store:', error);
      }
    }
  }, [user, initializeStore]);

  console.log('[RootLayout] Rendering, user:', !!user);

  return (
    <ErrorBoundary>
      <Slot />
      <PWAInstallPrompt />
    </ErrorBoundary>
  );
}

