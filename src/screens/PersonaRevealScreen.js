import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, ScrollView,
} from 'react-native';
import Svg, {
  Circle, Ellipse, Rect, Path, Line, Polygon, G,
} from 'react-native-svg';
import { COLORS, FONTS, RADIUS } from '../theme';
import { PERSONAS } from '../data/quizData';
import { getPersonaResult } from '../utils/store';

// ─── colour map ───────────────────────────────────────────────────────────────
const PERSONA_COLORS = {
  lazy_gourmet:       { character: '#D85A7A', face: '#FDEEF3', card: '#FADDE6' },
  efficient_explorer: { character: '#0D3D2E', face: '#D6EFE8', card: '#C8DDD8' },
  vibe_chaser:        { character: '#7C3AED', face: '#EDE9FE', card: '#DDD6FD' },
  culture_vulture:    { character: '#C8830A', face: '#FEF3C7', card: '#FDECC8' },
  slow_traveller:     { character: '#4A5568', face: '#EEF0F8', card: '#D8DCE8' },
};

const getCardColor = (personaKey) =>
  PERSONA_COLORS[personaKey]?.card || '#E0F7F4';

// ─── accessories ──────────────────────────────────────────────────────────────
function Broccoli() {
  return (
    <G rotation="-22" origin="50, 20">
      <Rect x="47" y="16" width="6" height="18" rx="3" fill="#3B6D11" />
      <Circle cx="50" cy="19" r="9" fill="#5A9E1A" />
      <Circle cx="41" cy="21" r="7.5" fill="#5A9E1A" />
      <Circle cx="59" cy="21" r="7.5" fill="#5A9E1A" />
      <Circle cx="44" cy="13" r="7.5" fill="#6BBF1F" />
      <Circle cx="56" cy="13" r="7.5" fill="#6BBF1F" />
      <Circle cx="50" cy="10" r="7.5" fill="#6BBF1F" />
      <Circle cx="44" cy="14" r="2.2" fill="#3B6D11" opacity="0.4" />
      <Circle cx="50" cy="10" r="2.2" fill="#3B6D11" opacity="0.4" />
      <Circle cx="56" cy="14" r="2.2" fill="#3B6D11" opacity="0.4" />
    </G>
  );
}

function Compass() {
  return (
    <>
      <Circle cx="50" cy="14" r="12" fill="#FFD166" />
      <Circle cx="50" cy="14" r="9" fill="#fff" opacity="0.92" />
      <Polygon points="50,7 52,15 50,14 48,15" fill="#FF6B6B" />
      <Polygon points="50,21 52,14 50,14 48,14" fill="#0D3D2E" />
      <Line x1="50" y1="4"  x2="50" y2="7"  stroke="#0D3D2E" strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="50" y1="21" x2="50" y2="24" stroke="#0D3D2E" strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="40" y1="14" x2="43" y2="14" stroke="#0D3D2E" strokeWidth="1.2" strokeLinecap="round" />
      <Line x1="57" y1="14" x2="60" y2="14" stroke="#0D3D2E" strokeWidth="1.2" strokeLinecap="round" />
    </>
  );
}

function Sunglasses() {
  return (
    <>
      <Rect x="26" y="24" width="15" height="9" rx="4.5" fill="#0D3D2E" />
      <Rect x="59" y="24" width="15" height="9" rx="4.5" fill="#0D3D2E" />
      <Rect x="41" y="27" width="18" height="3" fill="#0D3D2E" />
      <Line x1="26" y1="28" x2="22" y2="28" stroke="#0D3D2E" strokeWidth="2" strokeLinecap="round" />
      <Line x1="74" y1="28" x2="78" y2="28" stroke="#0D3D2E" strokeWidth="2" strokeLinecap="round" />
      <Rect x="27" y="25" width="13" height="7" rx="3.5" fill="#7C3AED" opacity="0.3" />
      <Rect x="60" y="25" width="13" height="7" rx="3.5" fill="#7C3AED" opacity="0.3" />
    </>
  );
}

function OpenBook() {
  return (
    <>
      <Rect x="22" y="6" width="56" height="26" rx="4" fill="#fff" stroke="#C8830A" strokeWidth="1.5" />
      <Line x1="50" y1="6"  x2="50" y2="32" stroke="#C8830A" strokeWidth="1.5" />
      <Path d="M50 6 Q46 19 50 32" stroke="#C8830A" strokeWidth="1" fill="none" />
      <Line x1="26" y1="13" x2="48" y2="13" stroke="#C8830A" strokeWidth="1" opacity="0.5" />
      <Line x1="26" y1="18" x2="48" y2="18" stroke="#C8830A" strokeWidth="1" opacity="0.5" />
      <Line x1="26" y1="23" x2="48" y2="23" stroke="#C8830A" strokeWidth="1" opacity="0.5" />
      <Line x1="52" y1="13" x2="74" y2="13" stroke="#C8830A" strokeWidth="1" opacity="0.5" />
      <Line x1="52" y1="18" x2="74" y2="18" stroke="#C8830A" strokeWidth="1" opacity="0.5" />
      <Line x1="52" y1="23" x2="74" y2="23" stroke="#C8830A" strokeWidth="1" opacity="0.5" />
    </>
  );
}

function NormalEyes() {
  return (
    <>
      <Circle cx="38" cy="53" r="8.5" fill="#fff" />
      <Circle cx="38" cy="53" r="5.5" fill="#0D3D2E" />
      <Circle cx="40" cy="51" r="2"   fill="#fff" />
      <Circle cx="62" cy="53" r="8.5" fill="#fff" />
      <Circle cx="62" cy="53" r="5.5" fill="#0D3D2E" />
      <Circle cx="64" cy="51" r="2"   fill="#fff" />
    </>
  );
}

function NaturalBrows() {
  return (
    <>
      <Path d="M29 42 Q38 39 46 41" fill="none" stroke="#0D3D2E" strokeWidth="2.6" strokeLinecap="round" />
      <Path d="M54 41 Q62 39 71 42" fill="none" stroke="#0D3D2E" strokeWidth="2.6" strokeLinecap="round" />
    </>
  );
}

function LazyGourmetFace() {
  return (
    <>
      <Broccoli />
      <NaturalBrows />
      <NormalEyes />
      <Path d="M37 66 Q50 76 63 66" stroke="#0D3D2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  );
}

function EfficientExplorerFace() {
  return (
    <>
      <Compass />
      <Path d="M26 40 Q35 36 42 38" fill="none" stroke="#0D3D2E" strokeWidth="2.8" strokeLinecap="round" />
      <Path d="M74 40 Q65 36 58 38" fill="none" stroke="#0D3D2E" strokeWidth="2.8" strokeLinecap="round" />
      <NormalEyes />
      <Path d="M33 66 Q46 72 63 62" stroke="#0D3D2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  );
}

function VibeChaserFace() {
  return (
    <>
      <Sunglasses />
      <Path d="M15 32 L17 27 L19 32 L15 32Z" fill="#FFD166" />
      <Path d="M81 26 L83 21 L85 26 L81 26Z" fill="#FFD166" />
      <Circle cx="13" cy="46" r="3" fill="#FFD166" opacity="0.7" />
      <Circle cx="87" cy="42" r="2" fill="#FFD166" opacity="0.6" />
      <Circle cx="38" cy="52" r="8.5" fill="#7C3AED" />
      <Path d="M38 45 L39.5 50 L45 50 L40.8 53 L42.5 58 L38 55 L33.5 58 L35.2 53 L31 50 L36.5 50Z" fill="#FFD166" />
      <Circle cx="62" cy="52" r="8.5" fill="#7C3AED" />
      <Path d="M62 45 L63.5 50 L69 50 L64.8 53 L66.5 58 L62 55 L57.5 58 L59.2 53 L55 50 L60.5 50Z" fill="#FFD166" />
      <Path d="M32 65 Q50 80 68 65" stroke="#7C3AED" strokeWidth="2.4" fill="#7C3AED" fillOpacity="0.12" strokeLinecap="round" />
    </>
  );
}

function CultureVultureFace() {
  return (
    <>
      <OpenBook />
      <NaturalBrows />
      <Circle cx="38" cy="53" r="10"  fill="#fff"    stroke="#0D3D2E" strokeWidth="2" />
      <Circle cx="62" cy="53" r="10"  fill="#fff"    stroke="#0D3D2E" strokeWidth="2" />
      <Line x1="48" y1="53" x2="52" y2="53" stroke="#0D3D2E" strokeWidth="2" />
      <Line x1="28" y1="51" x2="24" y2="49" stroke="#0D3D2E" strokeWidth="2" strokeLinecap="round" />
      <Line x1="72" y1="51" x2="76" y2="49" stroke="#0D3D2E" strokeWidth="2" strokeLinecap="round" />
      <Circle cx="38" cy="54" r="5.5" fill="#0D3D2E" />
      <Circle cx="62" cy="54" r="5.5" fill="#0D3D2E" />
      <Circle cx="39.5" cy="52.5" r="1.8" fill="#fff" />
      <Circle cx="63.5" cy="52.5" r="1.8" fill="#fff" />
      <Path d="M36 67 Q50 76 64 67" stroke="#0D3D2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    </>
  );
}

function SlowTravellerFace() {
  return (
    <>
      <Path d="M28 52 Q38 45 48 52" fill="none" stroke="#0D3D2E" strokeWidth="3"   strokeLinecap="round" />
      <Path d="M52 52 Q62 45 72 52" fill="none" stroke="#0D3D2E" strokeWidth="3"   strokeLinecap="round" />
      <Line x1="31" y1="50" x2="29" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="45" y1="50" x2="47" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="55" y1="50" x2="53" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="69" y1="50" x2="71" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M38 68 Q50 77 62 68" stroke="#0D3D2E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </>
  );
}

// ─── Zzz overlay ──────────────────────────────────────────────────────────────
function ZzzOverlay({ size }) {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;
  const anim3 = useRef(new Animated.Value(0)).current;

  const makeLoop = (anim, delay) =>
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.delay(600),
      ])
    );

  useEffect(() => {
    makeLoop(anim1, 0).start();
    makeLoop(anim2, 800).start();
    makeLoop(anim3, 1600).start();
  }, []);

  const scale = size / 100;
  return (
    <>
      {[
        { anim: anim1, left: 60 * scale, top: 22 * scale, fontSize: 12 * scale },
        { anim: anim2, left: 70 * scale, top: 13 * scale, fontSize: 15 * scale },
        { anim: anim3, left: 81 * scale, top:  4 * scale, fontSize: 18 * scale },
      ].map(({ anim, left, top, fontSize }, i) => (
        <Animated.Text key={i} style={{
          position: 'absolute', left, top, fontSize,
          fontWeight: '900', color: '#4A5568',
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [4, -10] }) }],
        }}>Z</Animated.Text>
      ))}
    </>
  );
}

// ─── PersonaCharacter ─────────────────────────────────────────────────────────
function PersonaCharacter({ personaKey, size = 80, delay = 0 }) {
  const bobAnim   = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, { toValue: -10, duration: 1200, useNativeDriver: true }),
          Animated.timing(bobAnim, { toValue: 0,   duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }, delay + 400);
  }, []);

  const colors = PERSONA_COLORS[personaKey] || PERSONA_COLORS.lazy_gourmet;
  const faceContent = {
    lazy_gourmet:       <LazyGourmetFace />,
    efficient_explorer: <EfficientExplorerFace />,
    vibe_chaser:        <VibeChaserFace />,
    culture_vulture:    <CultureVultureFace />,
    slow_traveller:     <SlowTravellerFace />,
  }[personaKey] || <LazyGourmetFace />;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { translateY: bobAnim }], alignItems: 'center' }}>
      <View style={{ position: 'relative', alignItems: 'center' }}>
        <Svg width={size} height={size * 1.28} viewBox="0 0 100 128">
          <Ellipse cx="50" cy="124" rx="20" ry="5" fill={colors.character} opacity="0.2" />
          <Rect x="47" y="96" width="6" height="24" rx="3" fill={colors.character} />
          <Ellipse cx="50" cy="82" rx="27" ry="17" fill={colors.character} />
          <Circle cx="50" cy="54" r="34" fill={colors.character} />
          <Circle cx="50" cy="54" r="27" fill={colors.face} />
          <Ellipse cx="25" cy="63" rx="9" ry="6" fill="#FFB3B3" opacity="0.5" />
          <Ellipse cx="75" cy="63" rx="9" ry="6" fill="#FFB3B3" opacity="0.5" />
          {faceContent}
        </Svg>
        {personaKey === 'slow_traveller' && <ZzzOverlay size={size} />}
      </View>
    </Animated.View>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────
export default function PersonaRevealScreen({ navigation }) {
  const headerAnim        = useRef(new Animated.Value(0)).current;
  const primaryCardAnim   = useRef(new Animated.Value(0)).current;
  const secondaryCardAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim        = useRef(new Animated.Value(0)).current;
  const primarySlide      = useRef(new Animated.Value(40)).current;
  const secondarySlide    = useRef(new Animated.Value(40)).current;

  // ── AI description state ──────────────────────────────────────────────────
  const [aiDescription, setAiDescription] = useState('');
  const [descLoading,   setDescLoading]   = useState(true);
  const descFade = useRef(new Animated.Value(0)).current;

  const quizResult       = getPersonaResult();
  const primaryPersona   = PERSONAS[quizResult?.primary]   || PERSONAS['lazy_gourmet'];
  const secondaryPersona = PERSONAS[quizResult?.secondary] || PERSONAS['slow_traveller'];
  const personaKey       = quizResult?.primary;
  const secondaryKey     = quizResult?.secondary;
  const primaryColor     = getCardColor(personaKey);
  const secondaryColor   = PERSONA_COLORS[secondaryKey]?.character || COLORS.teal;
  const charColor        = PERSONA_COLORS[personaKey]?.character || COLORS.teal;

  // ── entry animations ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!quizResult) return;
    Animated.sequence([
      Animated.timing(headerAnim,      { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(primaryCardAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(primarySlide,    { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(secondaryCardAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(secondarySlide,    { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(buttonAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [quizResult]);

  // ── fetch AI description ──────────────────────────────────────────────────
  useEffect(() => {
    if (!personaKey) return;
    fetch('http://192.168.1.188:8082/persona-description', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ primary: personaKey, secondary: secondaryKey }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.description) {
          setAiDescription(data.description);
          setDescLoading(false);
          Animated.timing(descFade, { toValue: 1, duration: 700, useNativeDriver: true }).start();
        } else {
          setDescLoading(false);
        }
      })
      .catch(() => setDescLoading(false)); // silently fail — not critical
  }, [personaKey]);

  if (!quizResult) return null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        <Animated.Text style={[styles.headerLabel, { opacity: headerAnim }]}>
          YOUR TRAVEL SOUL
        </Animated.Text>

        <Animated.View style={[styles.primaryCard, {
          opacity: primaryCardAnim,
          transform: [{ translateY: primarySlide }],
          backgroundColor: primaryColor,
        }]}>
          <PersonaCharacter personaKey={personaKey} size={120} delay={300} />
          <Text style={styles.primaryName}>{primaryPersona.name}</Text>
          <Text style={styles.primaryTagline}>{primaryPersona.tagline}</Text>

          {/* ── AI-generated personalised description ── */}
          <View style={styles.divider} />
          {descLoading ? (
            <Text style={[styles.aiDescLoading, { color: charColor }]}>· · ·</Text>
          ) : aiDescription ? (
            <Animated.Text style={[styles.aiDescription, { opacity: descFade }]}>
              {aiDescription}
            </Animated.Text>
          ) : (
            <Text style={styles.primaryDescription}>"{primaryPersona.description}"</Text>
          )}
        </Animated.View>

        {quizResult.primary !== quizResult.secondary && (
          <Animated.View style={[styles.secondaryCard, {
            opacity: secondaryCardAnim,
            transform: [{ translateY: secondarySlide }],
          }]}>
            <PersonaCharacter personaKey={secondaryKey} size={64} delay={700} />
            <View style={styles.secondaryText}>
              <Text style={styles.secondaryLabel}>With a streak of</Text>
              <Text style={[styles.secondaryName, { color: secondaryColor }]}>
                {secondaryPersona.name}
              </Text>
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
              routes: [{ name: 'Splash' }, { name: 'Quiz' }],
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
  container:       { flex: 1, backgroundColor: COLORS.cream },
  inner: {
    alignItems: 'center', paddingHorizontal: 24,
    paddingTop: 24, paddingBottom: 40, gap: 16,
  },
  headerLabel: {
    fontSize: 11, color: COLORS.hint,
    letterSpacing: 2, fontWeight: FONTS.semibold, marginBottom: 4,
  },
  primaryCard: {
    width: '100%', borderRadius: RADIUS.xl,
    padding: 28, alignItems: 'center', gap: 8,
  },
  primaryName:    { fontSize: 24, fontWeight: FONTS.bold, color: '#0D3D2E', textAlign: 'center', marginTop: 8 },
  primaryTagline: { fontSize: 13, color: '#4A8A78', textAlign: 'center' },
  divider:        { width: '60%', height: 1, backgroundColor: 'rgba(0,0,0,0.1)', marginVertical: 8 },

  // AI description — fades in after load
  aiDescription: {
    fontSize: 13, lineHeight: 20, textAlign: 'center',
    fontStyle: 'italic', color: '#2D5A4A', paddingHorizontal: 4,
  },
  aiDescLoading: {
    fontSize: 18, textAlign: 'center', letterSpacing: 6, opacity: 0.35,
  },
  // fallback (shown if AI call fails)
  primaryDescription: {
    fontSize: 13, color: '#2D5A4A', textAlign: 'center',
    fontStyle: 'italic', lineHeight: 20,
  },

  secondaryCard: {
    width: '100%', backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg, borderWidth: 1.5,
    borderColor: COLORS.border, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  secondaryText:    { flex: 1 },
  secondaryLabel:   { fontSize: 10, color: COLORS.hint, marginBottom: 2, fontWeight: FONTS.medium },
  secondaryName:    { fontSize: 15, fontWeight: FONTS.bold, marginBottom: 2 },
  secondaryTagline: { fontSize: 11, color: COLORS.muted },

  buttonWrap:     { width: '100%', alignItems: 'center', gap: 12, marginTop: 8 },
  btnPrimary:     { backgroundColor: COLORS.teal, borderRadius: RADIUS.md, paddingVertical: 16, alignItems: 'center', width: '100%' },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: FONTS.bold },
  retakeText:     { fontSize: 13, color: COLORS.hint, textDecorationLine: 'underline' },
});