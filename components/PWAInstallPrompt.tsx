import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';

// Type declaration for beforeinstallprompt event
declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Check if app is already installed
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
      
      if (standalone) return; // Don't show if already installed

      // Detect iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(iOS);

      // For iOS, show prompt after a delay
      if (iOS) {
        // Check if user has dismissed before (localStorage)
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (!dismissed) {
          // Show after 3 seconds
          const timer = setTimeout(() => {
            setShowPrompt(true);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }

    // Listen for the beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // iOS: Just close, user needs to use browser menu
      setShowPrompt(false);
      localStorage.setItem('pwa-install-dismissed', 'true');
      return;
    }

    // Android: Use the prompt
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error installing PWA:', error);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (Platform.OS !== 'web' || !showPrompt || isStandalone) return null;

  return (
    <Modal
      visible={showPrompt}
      transparent
      animationType="fade"
      onRequestClose={handleDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Install Broke App</Text>
          {isIOS ? (
            <>
              <Text style={styles.message}>
                Add Broke to your home screen for a better experience!
              </Text>
              <View style={styles.iosInstructions}>
                <Text style={styles.instructionStep}>1. Tap the Share button</Text>
                <Text style={styles.instructionStep}>2. Scroll and tap "Add to Home Screen"</Text>
                <Text style={styles.instructionStep}>3. Tap "Add" to confirm</Text>
              </View>
            </>
          ) : (
            <Text style={styles.message}>
              Add Broke to your home screen for a better experience!
            </Text>
          )}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleDismiss}
            >
              <Text style={styles.cancelButtonText}>Not Now</Text>
            </TouchableOpacity>
            {!isIOS && (
              <TouchableOpacity
                style={[styles.button, styles.installButton]}
                onPress={handleInstall}
              >
                <Text style={styles.installButtonText}>Install</Text>
              </TouchableOpacity>
            )}
            {isIOS && (
              <TouchableOpacity
                style={[styles.button, styles.installButton]}
                onPress={handleDismiss}
              >
                <Text style={styles.installButtonText}>Got It</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
    lineHeight: 22,
  },
  iosInstructions: {
    marginBottom: 24,
    paddingLeft: 8,
  },
  instructionStep: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  installButton: {
    backgroundColor: '#000000',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  installButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

