/**
 * Login Screen - Duolingo Style
 *
 * Fun, colorful, welcoming login experience
 * Uses official LifeQuest Design System
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  TextInput as RNTextInput,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { APP_VERSION } from '../../config/version';
import { designSystem } from '../../theme/designSystem';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, register, loginAsDemo } = useAuthStore();

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginAsDemo();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={designSystem.gradients.finance as any}
          style={styles.heroSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* App Logo/Emoji */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🎯</Text>
          </View>

          {/* Title */}
          <Text style={styles.heroTitle}>Welcome to LifeQuest!</Text>
          <Text style={styles.heroSubtitle}>4 Pillars. One Journey. Better You.</Text>

          {/* Pillar Icons */}
          <View style={styles.pillarsRow}>
            <View style={styles.pillarBadge}>
              <Text style={styles.pillarEmoji}>💰</Text>
            </View>
            <View style={styles.pillarBadge}>
              <Text style={styles.pillarEmoji}>🧠</Text>
            </View>
            <View style={styles.pillarBadge}>
              <Text style={styles.pillarEmoji}>💪</Text>
            </View>
            <View style={styles.pillarBadge}>
              <Text style={styles.pillarEmoji}>🥗</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Login Form Card */}
        <View style={styles.formCard}>
          {/* Tab Switcher */}
          <View style={styles.tabSwitcher}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>
                Login
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={designSystem.colors.textLight} style={styles.inputIcon} />
              <RNTextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                placeholderTextColor={designSystem.colors.textLight}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={designSystem.colors.textLight} style={styles.inputIcon} />
              <RNTextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                placeholderTextColor={designSystem.colors.textLight}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={designSystem.colors.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color={designSystem.colors.error[0]} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={loading ? designSystem.gradients.gray as const : designSystem.gradients.finance as const}
              style={styles.submitButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>
                    {isLogin ? 'Login' : 'Create Account'}
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Demo Button */}
          <TouchableOpacity
            onPress={handleDemoLogin}
            disabled={loading}
            style={styles.demoButton}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA000'] as const}
              style={styles.demoButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="play-circle" size={24} color="#FFF" />
              <Text style={styles.demoButtonText}>Try Demo Account</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={designSystem.colors.finance} />
              <Text style={styles.loadingText}>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </Text>
            </View>
          )}
        </View>

        {/* Version */}
        <Text style={styles.version}>v{APP_VERSION}</Text>

        {/* Bottom Spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...designSystem.shadows.large,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 56,
  },
  heroTitle: {
    ...designSystem.typography.h1,
    color: '#FFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...designSystem.typography.body,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
    textAlign: 'center',
  },
  pillarsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pillarBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarEmoji: {
    fontSize: 28,
  },
  formCard: {
    marginTop: -20,
    marginHorizontal: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    ...designSystem.shadows.large,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: designSystem.colors.background,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#FFF',
    ...designSystem.shadows.small,
  },
  tabText: {
    ...designSystem.typography.body,
    color: designSystem.colors.textLight,
    fontWeight: '600',
  },
  tabTextActive: {
    color: designSystem.colors.finance,
    fontWeight: '700',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: designSystem.colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...designSystem.typography.body,
    color: designSystem.colors.text,
  },
  eyeIcon: {
    padding: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    ...designSystem.typography.small,
    color: designSystem.colors.error[0],
    flex: 1,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...designSystem.shadows.medium,
  },
  submitButtonText: {
    ...designSystem.typography.h4,
    color: '#FFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: designSystem.colors.border,
  },
  dividerText: {
    ...designSystem.typography.small,
    color: designSystem.colors.textLight,
    marginHorizontal: 12,
  },
  demoButton: {
    borderRadius: 12,
    overflow: 'hidden',
    ...designSystem.shadows.medium,
  },
  demoButtonGradient: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  demoButtonText: {
    ...designSystem.typography.h4,
    color: '#FFF',
  },
  loadingOverlay: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    ...designSystem.typography.small,
    color: designSystem.colors.finance,
  },
  version: {
    ...designSystem.typography.tiny,
    color: designSystem.colors.textLight,
    textAlign: 'center',
    marginTop: 24,
  },
});
