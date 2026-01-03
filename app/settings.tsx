import React from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { lightHaptic, heavyHaptic } from '../lib/haptics';

interface SettingsScreenProps {
  onClose: () => void;
}

export default function SettingsScreen({ onClose }: SettingsScreenProps) {
  const { settings, updateSettings } = useAppStore();
  const { signOut, user } = useAuthStore();

  const toggleNotifications = () => {
    lightHaptic();
    updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  };

  const toggleDemoMode = () => {
    lightHaptic();
    updateSettings({ demoMode: !settings.demoMode });
  };

  const handleSignOut = () => {
    heavyHaptic();
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => lightHaptic() },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
            onClose();
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity 
          onPress={() => {
            lightHaptic();
            onClose();
          }}
        >
          <Ionicons name="close" size={24} color="#000000" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
      {/* General Settings */}
      <View style={[styles.section, styles.firstSection]}>
        <Text style={[styles.sectionTitle, styles.firstSectionTitle]}>General</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Currency</Text>
            <Text style={styles.settingDescription}>{settings.currency}</Text>
          </View>
          <Text style={styles.settingValue}>›</Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Notifications</Text>
            <Text style={styles.settingDescription}>
              Get alerts for budget overages and upcoming bills
            </Text>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ false: '#E0E0E0', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Demo Mode</Text>
            <Text style={styles.settingDescription}>
              Use sample data instead of real transactions
            </Text>
          </View>
          <Switch
            value={settings.demoMode}
            onValueChange={toggleDemoMode}
            trackColor={{ false: '#E0E0E0', true: '#34C759' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} disabled>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, styles.disabled]}>Connect Bank</Text>
            <Text style={styles.settingDescription}>
              Link your bank account with Plaid (Coming Soon)
            </Text>
          </View>
          <Text style={styles.settingValue}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} disabled>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingLabel, styles.disabled]}>AI Coaching</Text>
            <Text style={styles.settingDescription}>
              Configure OpenAI integration (Coming Soon)
            </Text>
          </View>
          <Text style={styles.settingValue}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={lightHaptic}
        >
          <Text style={styles.settingLabel}>Privacy Policy</Text>
          <Text style={styles.settingValue}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={lightHaptic}
        >
          <Text style={styles.settingLabel}>Terms of Service</Text>
          <Text style={styles.settingValue}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Account */}
      {user && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Email</Text>
              <Text style={styles.settingDescription}>{user.email}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleSignOut}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, styles.signOutLabel]}>Sign Out</Text>
            </View>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}

      {/* Danger Zone */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.dangerButton}
          onPress={() => {
            heavyHaptic();
            Alert.alert(
              'Clear All Data',
              'Are you sure you want to clear all app data? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel', onPress: () => lightHaptic() },
                { text: 'Clear', style: 'destructive', onPress: () => {
                  console.log('All data cleared!');
                  lightHaptic();
                }},
              ]
            );
          }}
        >
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  section: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  firstSection: {
    marginTop: 0,
  },
  firstSectionTitle: {
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
    marginHorizontal: -20,
    paddingVertical: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  settingValue: {
    fontSize: 16,
    color: '#999999',
  },
  disabled: {
    color: '#CCCCCC',
  },
  dangerButton: {
    marginVertical: 24,
    padding: 16,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutLabel: {
    color: '#FF3B30',
  },
});

