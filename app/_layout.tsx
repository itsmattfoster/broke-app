import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { PWAInstallPrompt } from '../components/PWAInstallPrompt';

export default function RootLayout() {
  const { initialize: initializeAuth, user } = useAuthStore();
  const { initializeStore } = useAppStore();

  useEffect(() => {
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

