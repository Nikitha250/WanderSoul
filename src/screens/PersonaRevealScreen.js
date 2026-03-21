import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, ScrollView,
} from 'react-native';
import { COLORS, FONTS, RADIUS } from '../theme';
import { PERSONAS } from '../data/quizData';
import { getPersonaResult } from '../utils/store';

function PersonaCharacter({ personaKey, size = 80, delay = 0 }) {
  const bobAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const persona = PERSONAS[personaKey];
  const color = persona?.color || COLORS.teal;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: -8,
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
    }, delay + 400);
  }, []);

  const eyeSize = size * 0.13;
  const pupilSize = size * 0.07;

  const renderAccessory = () => {
    switch (personaKey) {
      case 'lazy_gourmet':
        return (
          <View style={{ position: 'absolute', top: -8, left: size * 0.15 }}>
            <Text style={{ fontSize: 14 }}>✨</Text>
          </View>
        );
      case 'efficient_explorer':
        return (
          <View style={{ position: 'absolute', top: -10, alignSelf: 'center' }}>
            <Text style={{ fontSize: 16 }}>🧭</Text>
          </View>
        );
      case 'vibe_chaser':
        return (
          <View style={{ position: 'absolute', top: -10, right: size * 0.1 }}>
            <Text style={{ fontSize: 14 }}>⭐</Text>
          </View>
        );
      case 'culture_vulture':
        return (
          <View style={{ position: 'absolute', top: -10, alignSelf: 'center' }}>
            <Text style={{ fontSize: 14 }}>📖</Text>
          </View>
        );
      case 'slow_traveller':
        return (
          <View style={{ position: 'absolute', top: -10, left: size * 0.2 }}>
            <Text style={{ fontSize: 14 }}>☁️</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Animated.View style={{
      transform: [
        { scale: scaleAnim },
        { translateY: bobAnim },
      ],
      alignItems: 'center',
    }}>
      <View style={{ position: 'relative', alignItems: 'center' }}>
        {renderAccessory()}
        <View style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.35,
          shadowRadius: 16,
          elevation: 8,
        }}>
          <View style={{
            flexDirection: 'row',
            gap: size * 0.15,
            marginBottom: size * 0.06,
          }}>
            {[0, 1].map(i => (
              <View key={i} style={{
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
                  backgroundColor: '#1A1A1A',
                }} />
              </View>
            ))}
          </View>
          <View style={{
            width: size * 0.38,
            height: size * 0.16,
            borderBottomLeftRadius: size * 0.2,
            borderBottomRightRadius: size * 0.2,
            borderWidth: 2.5,
            borderColor: '#fff',
            borderTopWidth: 0,
          }} />
        </View>
        <View style={{ alignItems: 'center', marginTop: 2 }}>
          <View style={{
            width: 4,
            height: 14,
            backgroundColor: color,
            borderRadius: 2,
          }} />
          <View style={{
            width: 12,
            height: 4,
            borderRadius: 10,
            backgroundColor: color,
            opacity: 0.2,
            marginTop: 1,
          }} />
        </View>
      </View>
    </Animated.View>
  );
}

export default function PersonaRevealScreen({ navigation }) {
  const headerAnim = useRef(new Animated.Value(0)).current;
  const primaryCardAnim = useRef(new Animated.Value(0)).current;
  const secondaryCardAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;
  const primarySlide = useRef(new Animated.Value(40)).current;
  const secondarySlide = useRef(new Animated.Value(40)).current;

  const quizResult = getPersonaResult();
  const primaryPersona = PERSONAS[quizResult?.primary] || PERSONAS['lazy_gourmet'];
  const secondaryPersona = PERSONAS[quizResult?.secondary] || PERSONAS['slow_traveller'];

  useEffect(() => {
    if (!quizResult) return;
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(primaryCardAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(primarySlide, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(secondaryCardAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(secondarySlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [quizResult]);

  if (!quizResult) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
      >
        <Animated.Text style={[styles.headerLabel, { opacity: headerAnim }]}>
          YOUR TRAVEL SOUL
        </Animated.Text>

        <Animated.View style={[styles.primaryCard, {
          opacity: primaryCardAnim,
          transform: [{ translateY: primarySlide }],
          backgroundColor: primaryPersona.color,
        }]}>
          <PersonaCharacter
            personaKey={quizResult.primary}
            size={80}
            delay={300}
          />
          <Text style={styles.primaryName}>{primaryPersona.name}</Text>
          <Text style={styles.primaryTagline}>{primaryPersona.tagline}</Text>
          <View style={styles.divider} />
          <Text style={styles.primaryDescription}>"{primaryPersona.description}"</Text>
        </Animated.View>

        {quizResult.primary !== quizResult.secondary && (
          <Animated.View style={[styles.secondaryCard, {
            opacity: secondaryCardAnim,
            transform: [{ translateY: secondarySlide }],
          }]}>
            <PersonaCharacter
              personaKey={quizResult.secondary}
              size={40}
              delay={700}
            />
            <View style={styles.secondaryText}>
              <Text style={styles.secondaryLabel}>With a streak of</Text>
              <Text style={styles.secondaryName}>{secondaryPersona.name}</Text>
              <Text style={styles.secondaryTagline}>{secondaryPersona.tagline}</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View style={[styles.buttonWrap, { opacity: buttonAnim }]}>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.85}
          >
            <Text style={styles.btnPrimaryText}>Plan my first trip →</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.reset({
              index: 1,
              routes: [
                { name: 'Splash' },
                { name: 'Quiz' },
              ],
            })}
            activeOpacity={0.7}
          >
            <Text style={styles.retakeText}>Retake quiz</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  inner: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  headerLabel: {
    fontSize: 11,
    color: COLORS.hint,
    letterSpacing: 2,
    fontWeight: FONTS.semibold,
    marginBottom: 4,
  },
  primaryCard: {
    width: '100%',
    borderRadius: RADIUS.xl,
    padding: 28,
    alignItems: 'center',
    gap: 8,
  },
  primaryName: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
  primaryTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  divider: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginVertical: 8,
  },
  primaryDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  secondaryCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  secondaryText: {
    flex: 1,
  },
  secondaryLabel: {
    fontSize: 10,
    color: COLORS.hint,
    marginBottom: 2,
    fontWeight: FONTS.medium,
  },
  secondaryName: {
    fontSize: 15,
    fontWeight: FONTS.bold,
    color: COLORS.tealDark,
    marginBottom: 2,
  },
  secondaryTagline: {
    fontSize: 11,
    color: COLORS.muted,
  },
  buttonWrap: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
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
  retakeText: {
    fontSize: 13,
    color: COLORS.hint,
    textDecorationLine: 'underline',
  },
});