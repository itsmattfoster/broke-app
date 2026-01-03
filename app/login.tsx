import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../components/ui/Button';
import { lightHaptic, mediumHaptic } from '../lib/haptics';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailConfirmationCard, setShowEmailConfirmationCard] = useState(false);
  
  const { signUp, signIn } = useAuthStore();

  const handleSubmit = async () => {
    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password length validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setIsLoading(true);
    mediumHaptic();

    try {
      if (isSignUp) {
        const { error: signUpError, needsEmailConfirmation } = await signUp(email.trim(), password, name.trim());
        
        if (signUpError) {
          setError(signUpError.message || 'Failed to create account. Please try again.');
          return;
        }
        
        if (needsEmailConfirmation) {
          // Show email confirmation card instead of alert
          setShowEmailConfirmationCard(true);
          setIsLoading(false);
          return;
        }
        
        // User is automatically signed in - will redirect via auth state change
      } else {
        const { error: signInError } = await signIn(email.trim(), password);
        
        if (signInError) {
          setError(signInError.message || 'Invalid email or password. Please try again.');
          return;
        }
        
        // Success - user will be redirected automatically via auth state change
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    lightHaptic();
    setIsSignUp(!isSignUp);
    setError(null); // Clear error when switching modes
  };

  const toggleShowPassword = () => {
    lightHaptic();
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Text style={styles.logo}>broke</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create your account' : 'Sign in to continue'}
            </Text>
          </View>

          {/* Error Message */}
          {!showEmailConfirmationCard && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          {!showEmailConfirmationCard && (
          <View style={styles.form}>
            {isSignUp && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor="#999999"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor="#999999"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#999999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="password"
              />
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={toggleShowPassword}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, showPassword && styles.checkboxChecked]}>
                  {showPassword && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>Show Password</Text>
              </TouchableOpacity>
            </View>

            <Button
              title={isSignUp ? 'Sign Up' : 'Sign In'}
              onPress={handleSubmit}
              variant="primary"
              style={styles.submitButton}
              disabled={isLoading}
            />
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#000000" />
              </View>
            )}
          </View>
          )}

          {/* Email Confirmation Card */}
          {showEmailConfirmationCard && (
            <View style={styles.emailConfirmationCard}>
              <Ionicons name="mail-outline" size={32} color="#007AFF" />
              <Text style={styles.emailConfirmationTitle}>Check Your Email</Text>
              <Text style={styles.emailConfirmationText}>
                We've sent a confirmation email to {email}. Please check your inbox and click the confirmation link to activate your account.
              </Text>
              <TouchableOpacity
                style={styles.backToSignInButton}
                onPress={() => {
                  lightHaptic();
                  setShowEmailConfirmationCard(false);
                  setIsSignUp(false);
                  setEmail('');
                  setPassword('');
                  setName('');
                }}
              >
                <Text style={styles.backToSignInText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Toggle Sign Up/Sign In */}
          {!showEmailConfirmationCard && (
            <View style={styles.footer}>
            <Text style={styles.footerText}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.footerLink}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 48,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#666666',
  },
  submitButton: {
    marginTop: 8,
  },
  loadingContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#666666',
  },
  footerLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  emailConfirmationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 32,
  },
  emailConfirmationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    marginBottom: 12,
  },
  emailConfirmationText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backToSignInButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  backToSignInText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

