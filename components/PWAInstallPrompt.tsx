import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';

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

    if (typeof window !== 'undefined') {
      // Check if app is already installed (standalone mode)
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
      
      if (standalone) {
        setShowPrompt(false);
        return; // Don't show if already installed
      }

      // Detect iOS
      const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      setIsIOS(iOS);

      // Show immediately when in browser mode
      setShowPrompt(true);
    }

    // Listen for the beforeinstallprompt event (Android Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
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
      // iOS: Instructions are already shown, no action needed
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
    }
  };

  // Don't show if not web, already installed, or prompt shouldn't show
  if (Platform.OS !== 'web' || !showPrompt || isStandalone) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>Install Broke</Text>
        <Text style={styles.subtitle}>
          Add Broke to your home screen for a better experience
        </Text>
        
        {isIOS ? (
          <View style={styles.instructionsContainer}>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>1</Text>
              <Text style={styles.instructionText}>Tap the Share button</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>2</Text>
              <Text style={styles.instructionText}>Scroll and tap "Add to Home Screen"</Text>
            </View>
            <View style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>3</Text>
              <Text style={styles.instructionText}>Tap "Add" to confirm</Text>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.installButton}
            onPress={handleInstall}
          >
            <Text style={styles.installButtonText}>Add to Home Screen</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  instructionsContainer: {
    width: '100%',
    gap: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  installButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  installButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

