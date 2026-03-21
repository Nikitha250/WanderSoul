import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, SafeAreaView,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';

const { width } = Dimensions.get('window');

function WanderSoulCharacter({ size = 80 }) {
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: -10,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const eyeSize = size * 0.13;
  const pupilSize = size * 0.07;

  return (
    <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: COLORS.teal,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.teal,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 8,
      }}>
        {/* Eyes */}
        <View style={{ flexDirection: 'row', gap: size * 0.15, marginBottom: size * 0.06 }}>
          <View style={{
            width: eyeSize * 1.6,
            height: eyeSize * 1.8,
            borderRadius: eyeSize,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <View style={{
              width: pupilSize,
              height: pupilSize * 1.2,
              borderRadius: pupilSize,
              backgroundColor: COLORS.tealDark,
            }} />
          </View>
          <View style={{
            width: eyeSize * 1.6,
            height: eyeSize * 1.8,
            borderRadius: eyeSize,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <View style={{
              width: pupilSize,
              height: pupilSize * 1.2,
              borderRadius: pupilSize,
              backgroundColor: COLORS.tealDark,
            }} />
          </View>
        </View>
        {/* Smile */}
        <View style={{
          width: size * 0.38,
          height: size * 0.16,
          borderBottomLeftRadius: size * 0.2,
          borderBottomRightRadius: size * 0.2,
          borderWidth: 2.5,
          borderColor: '#fff',
          borderTopWidth: 0,
          marginTop: size * 0.02,
        }} />
      </View>
      {/* Pin drop */}
      <View style={{ alignItems: 'center', marginTop: 2 }}>
        <View style={{
          width: 4,
          height: 16,
          backgroundColor: COLORS.teal,
          borderRadius: 2,
        }} />
        <View style={{
          width: 14,
          height: 5,
          borderRadius: 10,
          backgroundColor: COLORS.teal,
          opacity: 0.2,
          marginTop: 1,
        }} />
      </View>
    </Animated.View>
  );
}

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const btn1Anim = useRef(new Animated.Value(0)).current;
  const btn2Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(btn1Anim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(btn2Anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Character */}
        <Animated.View style={{ opacity: fadeAnim, marginBottom: 28 }}>
          <WanderSoulCharacter size={90} />
        </Animated.View>

        {/* Wordmark */}
        <Animated.View style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <Text style={styles.wordmark}>
            <Text style={{ color: COLORS.tealDark }}>Wander</Text>
            <Text style={{ color: COLORS.teal }}>Soul</Text>
          </Text>
          <Text style={styles.tagline}>Your AI tour guide knows you first</Text>
        </Animated.View>

        {/* Buttons */}
        <View style={styles.buttonArea}>
          <Animated.View style={{ opacity: btn1Anim, width: '100%' }}>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.navigate('Quiz')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnPrimaryText}>Start planning — it's free</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: btn2Anim, width: '100%' }}>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnSecondaryText}>Log in to your account</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ opacity: btn2Anim }}>
            <Text style={styles.noAccount}>No account needed to start</Text>
          </Animated.View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: FONTS.bold,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: FONTS.medium,
    textAlign: 'center',
  },
  buttonArea: {
    width: '100%',
    marginTop: 48,
    alignItems: 'center',
    gap: 10,
  },
  btnPrimary: {
    backgroundColor: COLORS.teal,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: FONTS.bold,
  },
  btnSecondary: {
    backgroundColor: COLORS.tealLight,
    borderRadius: RADIUS.md,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
  },
  btnSecondaryText: {
    color: COLORS.tealDark,
    fontSize: 16,
    fontWeight: FONTS.semibold,
  },
  noAccount: {
    fontSize: 12,
    color: COLORS.hint,
    marginTop: 4,
  },
});