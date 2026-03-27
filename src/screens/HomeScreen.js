import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Circle, Ellipse, Rect, Path, Line, Polygon, G,
} from 'react-native-svg';
import { COLORS, FONTS, RADIUS } from '../theme';
import { PERSONAS } from '../data/quizData';
import { getPersonaResult } from '../utils/store';

// ─── colour map ───────────────────────────────────────────────────────────────
const PERSONA_COLORS = {
  lazy_gourmet:       { character: '#D85A7A', face: '#FDEEF3', card: '#F7C5D5', text: '#8B1A3A' },
  efficient_explorer: { character: '#0D3D2E', face: '#D6EFE8', card: '#A8CBBF', text: '#0D3D2E' },
  vibe_chaser:        { character: '#7C3AED', face: '#EDE9FE', card: '#C4B5F7', text: '#3B0F8C' },
  culture_vulture:    { character: '#C8830A', face: '#FEF3C7', card: '#F5D48A', text: '#7A4500' },
  slow_traveller:     { character: '#4A5568', face: '#EEF0F8', card: '#B8C0D4', text: '#2D3748' },
};

// ─── accessories ──────────────────────────────────────────────────────────────
function Broccoli() {
  return (
    <G rotation="-22" origin="50, 20">
      <Rect x="47" y="16" width="6" height="18" rx="3" fill="#3B6D11" />
      <Circle cx="50" cy="19" r="9"   fill="#5A9E1A" />
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
      <Circle cx="50" cy="14" r="9"  fill="#fff" opacity="0.92" />
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
      <Rect x="41" y="27" width="18" height="3"  fill="#0D3D2E" />
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

function getFaceContent(personaKey) {
  switch (personaKey) {
    case 'lazy_gourmet':
      return (
        <>
          <Broccoli />
          <NaturalBrows />
          <NormalEyes />
          <Path d="M37 66 Q50 76 63 66" stroke="#0D3D2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    case 'efficient_explorer':
      return (
        <>
          <Compass />
          <Path d="M26 40 Q35 36 42 38" fill="none" stroke="#0D3D2E" strokeWidth="2.8" strokeLinecap="round" />
          <Path d="M74 40 Q65 36 58 38" fill="none" stroke="#0D3D2E" strokeWidth="2.8" strokeLinecap="round" />
          <NormalEyes />
          <Path d="M33 66 Q46 72 63 62" stroke="#0D3D2E" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      );
    case 'vibe_chaser':
      return (
        <>
          <Sunglasses />
          <Path d="M15 32 L17 27 L19 32 L15 32Z" fill="#FFD166" />
          <Path d="M81 26 L83 21 L85 26 L81 26Z" fill="#FFD166" />
          <Circle cx="38" cy="52" r="8.5" fill="#7C3AED" />
          <Path d="M38 45 L39.5 50 L45 50 L40.8 53 L42.5 58 L38 55 L33.5 58 L35.2 53 L31 50 L36.5 50Z" fill="#FFD166" />
          <Circle cx="62" cy="52" r="8.5" fill="#7C3AED" />
          <Path d="M62 45 L63.5 50 L69 50 L64.8 53 L66.5 58 L62 55 L57.5 58 L59.2 53 L55 50 L60.5 50Z" fill="#FFD166" />
          <Path d="M32 65 Q50 80 68 65" stroke="#7C3AED" strokeWidth="2.4" fill="#7C3AED" fillOpacity="0.12" strokeLinecap="round" />
        </>
      );
    case 'culture_vulture':
      return (
        <>
          <OpenBook />
          <NaturalBrows />
          <Circle cx="38" cy="53" r="10" fill="#fff" stroke="#0D3D2E" strokeWidth="2" />
          <Circle cx="62" cy="53" r="10" fill="#fff" stroke="#0D3D2E" strokeWidth="2" />
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
    case 'slow_traveller':
    default:
      return (
        <>
          <Path d="M28 52 Q38 45 48 52" fill="none" stroke="#0D3D2E" strokeWidth="3" strokeLinecap="round" />
          <Path d="M52 52 Q62 45 72 52" fill="none" stroke="#0D3D2E" strokeWidth="3" strokeLinecap="round" />
          <Line x1="31" y1="50" x2="29" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="45" y1="50" x2="47" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="55" y1="50" x2="53" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
          <Line x1="69" y1="50" x2="71" y2="47" stroke="#0D3D2E" strokeWidth="1.5" strokeLinecap="round" />
          <Path d="M38 68 Q50 77 62 68" stroke="#0D3D2E" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </>
      );
  }
}

// ─── full persona character ───────────────────────────────────────────────────
function PersonaCharacter({ personaKey, size = 80 }) {
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0,  duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const colors = PERSONA_COLORS[personaKey] || PERSONA_COLORS.lazy_gourmet;

  return (
    <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
      <Svg width={size} height={size * 1.28} viewBox="0 0 100 128">
        <Ellipse cx="50" cy="124" rx="20" ry="5"  fill={colors.character} opacity="0.2" />
        <Rect    x="47" y="96"  width="6" height="24" rx="3" fill={colors.character} />
        <Ellipse cx="50" cy="82" rx="27" ry="17" fill={colors.character} />
        <Circle  cx="50" cy="54" r="34"  fill={colors.character} />
        <Circle  cx="50" cy="54" r="27"  fill={colors.face} />
        <Ellipse cx="25" cy="63" rx="9"  ry="6"  fill="#FFB3B3" opacity="0.5" />
        <Ellipse cx="75" cy="63" rx="9"  ry="6"  fill="#FFB3B3" opacity="0.5" />
        {getFaceContent(personaKey)}
      </Svg>
    </Animated.View>
  );
}

// ─── bottom tab bar icons ─────────────────────────────────────────────────────
function TripsTabIcon({ active }) {
  const color = active ? COLORS.teal : COLORS.hint;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.8" />
      <Line x1="3"  y1="10" x2="21" y2="10" stroke={color} strokeWidth="1.8" />
      <Line x1="12" y1="5"  x2="12" y2="19" stroke={color} strokeWidth="1.2" />
    </Svg>
  );
}

function SettingsTabIcon({ active }) {
  const color = active ? COLORS.teal : COLORS.hint;
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="3.5" fill="none" stroke={color} strokeWidth="1.8" />
      <Path d="M4 20 C4 16 7.6 13 12 13 C16.4 13 20 16 20 20" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ─── suitcase illustration ────────────────────────────────────────────────────
function SuitcaseIllustration() {
  return (
    <Svg width="120" height="96" viewBox="0 0 120 96">
      <Rect x="20" y="30" width="80" height="54" rx="8" fill={COLORS.tealLight} stroke={COLORS.tealMid} strokeWidth="1.5" />
      <Path d="M42 30 Q42 18 60 18 Q78 18 78 30" fill="none" stroke={COLORS.tealMid} strokeWidth="2.5" strokeLinecap="round" />
      <Rect x="20" y="52" width="80" height="10" fill={COLORS.tealMid} opacity="0.35" />
      <Rect x="52" y="47" width="16" height="10" rx="3" fill={COLORS.teal} opacity="0.45" />
      <Circle cx="36" cy="86" r="5" fill={COLORS.tealMid} />
      <Circle cx="84" cy="86" r="5" fill={COLORS.tealMid} />
      <Path d="M8 22 L10 16 L12 22 L8 22Z"      fill={COLORS.amber} opacity="0.7" />
      <Path d="M108 32 L110 26 L112 32 L108 32Z" fill={COLORS.amber} opacity="0.7" />
      <Circle cx="6"   cy="36" r="2.5" fill={COLORS.amber} opacity="0.5" />
      <Circle cx="114" cy="20" r="2"   fill={COLORS.teal}  opacity="0.6" />
    </Svg>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const insets    = useSafeAreaInsets();

  const quizResult    = getPersonaResult();
  const personaKey    = quizResult?.primary || 'lazy_gourmet';
  const persona       = PERSONAS[personaKey];
  const personaColors = PERSONA_COLORS[personaKey] || PERSONA_COLORS.lazy_gourmet;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* header — flush to top */}
      <View style={[styles.header, { backgroundColor: personaColors.card, paddingTop: insets.top + 16 }]}>
        <Animated.View style={[styles.headerLeft, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={[styles.greeting, { color: personaColors.text }]}>{getGreeting()}</Text>
          <Text style={[styles.personaName, { color: personaColors.text }]}>Hey, {persona?.name} 👋</Text>
          <Text style={[styles.headerSub, { color: personaColors.text }]}>Where to next?</Text>
        </Animated.View>
        <View style={styles.headerRight}>
          <PersonaCharacter personaKey={personaKey} size={88} />
        </View>
      </View>

      {/* plan new trip CTA */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate('TripSetup')} activeOpacity={0.85}>
          <View style={styles.ctaIcon}>
            <Svg width="18" height="18" viewBox="0 0 18 18">
              <Line x1="9" y1="2" x2="9" y2="16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
              <Line x1="2" y1="9" x2="16" y2="9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={styles.ctaText}>Plan a new trip</Text>
          <Text style={styles.ctaArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* trips */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your trips</Text>
          <Text style={styles.seeAll}>See all ›</Text>
        </View>
        <View style={styles.emptyState}>
          <SuitcaseIllustration />
          <Text style={styles.emptyTitle}>No trips yet</Text>
          <Text style={styles.emptySubtitle}>Your adventures will appear here.{'\n'}Tap above to plan your first one.</Text>
          <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('TripSetup')} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>Plan my first trip →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* bottom tab bar — flush to bottom */}
      <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.7}>
          <TripsTabIcon active={true} />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Trips</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Settings')} activeOpacity={0.7}>
          <SettingsTabIcon active={false} />
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    minHeight: 170,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  greeting: {
    fontSize: 11,
    fontWeight: FONTS.semibold,
    letterSpacing: 1.2,
    marginBottom: 6,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  personaName: {
    fontSize: 24,
    fontWeight: FONTS.bold,
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 15,
    fontWeight: FONTS.regular,
    opacity: 0.75,
  },
  ctaWrapper: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 8,
  },
  ctaButton: {
    backgroundColor: COLORS.teal,
    borderRadius: RADIUS.lg,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  ctaIcon: {
    width: 36,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    flex: 1,
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: '#fff',
  },
  ctaArrow: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.tealDark,
  },
  seeAll: {
    fontSize: 13,
    color: COLORS.muted,
    fontWeight: FONTS.medium,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    minHeight: 280,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: FONTS.bold,
    color: COLORS.tealDark,
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 8,
    backgroundColor: COLORS.teal,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: RADIUS.md,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: FONTS.bold,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.hint,
    fontWeight: FONTS.medium,
  },
  tabLabelActive: {
    color: COLORS.teal,
    fontWeight: FONTS.bold,
  },
});