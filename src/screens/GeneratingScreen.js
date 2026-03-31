import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Animated, Easing, StatusBar, Alert,
} from 'react-native';
import Svg, {
  Circle, Ellipse, Path, Rect, Line, G,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../theme';

// ─── persona colours (same as PersonaReveal + Home) ──────────────────────────
const PERSONA_COLORS = {
  lazy_gourmet:       { character: '#D85A7A', face: '#FDEEF3', card: '#F7C5D5', text: '#8B1A3A' },
  efficient_explorer: { character: '#0D3D2E', face: '#D6EFE8', card: '#A8CBBF', text: '#0D3D2E' },
  vibe_chaser:        { character: '#7C3AED', face: '#EDE9FE', card: '#C4B5F7', text: '#3B0F8C' },
  culture_vulture:    { character: '#C8830A', face: '#FEF3C7', card: '#F5D48A', text: '#7A4500' },
  slow_traveller:     { character: '#4A5568', face: '#EEF0F8', card: '#B8C0D4', text: '#2D3748' },
};

// ─── persona-specific loading messages ───────────────────────────────────────
const LOADING_MESSAGES = {
  lazy_gourmet: [
    'Sniffing out the best hidden restaurants...',
    'Finding spots worth getting off the couch for...',
    'Locating the most comfortable terraces...',
    'Prioritising food markets and nap-friendly cafés...',
    'Balancing indulgence with strategic laziness...',
  ],
  efficient_explorer: [
    'Optimising your route for maximum coverage...',
    'Calculating the most efficient sightseeing order...',
    'Cross-referencing opening hours and travel times...',
    'Building a schedule with zero wasted minutes...',
    'Ensuring every hour of your trip counts...',
  ],
  vibe_chaser: [
    'Finding where the locals actually go at 2am...',
    'Tracking down the rooftop bars with the best views...',
    'Sourcing the most electric neighbourhoods...',
    'Discovering who`s playing live this weekend...',
    'Curating the perfect night-to-morning flow...',
  ],
  culture_vulture: [
    'Unearthing museums the tourists miss...',
    'Cross-referencing galleries, ruins and hidden archives...',
    'Finding the stories behind the landmarks...',
    'Scheduling time for the lesser-known masterpieces...',
    'Balancing history, art and local culture...',
  ],
  slow_traveller: [
    'Finding the quietest corners of the city...',
    'Locating the best spots to do absolutely nothing...',
    'Building in enough time to get genuinely lost...',
    'Removing every unnecessary rush from your days...',
    'Crafting a pace that actually feels like a holiday...',
  ],
};

// ─── persona character (same component as HomeScreen / PersonaReveal) ─────────
function PersonaCharacter({ personaKey, size = 140, colors }) {
  const c   = colors.character;
  const f   = colors.face;
  const r   = size / 2;
  const cx  = size / 2;

  // pin body
  const bodyH  = size * 0.72;
  const bodyW  = size * 0.75;
  const faceR  = size * 0.27;
  const faceCY = size * 0.33;

  const renderFace = () => {
    switch (personaKey) {
      case 'lazy_gourmet':
        return (
          <G>
            <Ellipse cx={cx - size*0.09} cy={faceCY - size*0.01} rx={size*0.04} ry={size*0.045} fill={c} />
            <Ellipse cx={cx + size*0.09} cy={faceCY - size*0.01} rx={size*0.04} ry={size*0.045} fill={c} />
            <Path d={`M ${cx - size*0.1} ${faceCY + size*0.09} Q ${cx} ${faceCY + size*0.17} ${cx + size*0.1} ${faceCY + size*0.09}`}
              stroke={c} strokeWidth={size*0.035} fill="none" strokeLinecap="round" />
            {/* broccoli */}
            <G transform={`translate(${cx + size*0.18}, ${faceCY - size*0.35}) rotate(-22)`}>
              <Rect x={-size*0.025} y={0} width={size*0.05} height={size*0.18} fill="#5D8A3C" rx={size*0.01} />
              <Circle cx={0} cy={-size*0.04} r={size*0.07} fill="#4CAF50" />
              <Circle cx={-size*0.045} cy={-size*0.02} r={size*0.05} fill="#66BB6A" />
              <Circle cx={size*0.045} cy={-size*0.02} r={size*0.05} fill="#57A05A" />
            </G>
          </G>
        );
      case 'efficient_explorer':
        return (
          <G>
            <Ellipse cx={cx - size*0.09} cy={faceCY - size*0.01} rx={size*0.05} ry={size*0.055} fill={c} />
            <Ellipse cx={cx + size*0.09} cy={faceCY - size*0.01} rx={size*0.05} ry={size*0.055} fill={c} />
            <Path d={`M ${cx - size*0.09} ${faceCY + size*0.1} Q ${cx} ${faceCY + size*0.16} ${cx + size*0.09} ${faceCY + size*0.1}`}
              stroke={c} strokeWidth={size*0.03} fill="none" strokeLinecap="round" />
            {/* compass */}
            <G transform={`translate(${cx + size*0.22}, ${faceCY - size*0.3})`}>
              <Circle cx={0} cy={0} r={size*0.1} fill="#F5D76E" stroke="#C8A332" strokeWidth={size*0.015} />
              <Path d={`M 0 ${-size*0.07} L ${size*0.025} ${size*0.03} L 0 ${size*0.015} L ${-size*0.025} ${size*0.03} Z`} fill="#E74C3C" />
              <Path d={`M 0 ${size*0.07} L ${size*0.025} ${-size*0.03} L 0 ${-size*0.015} L ${-size*0.025} ${-size*0.03} Z`} fill="#BDC3C7" />
            </G>
          </G>
        );
      case 'vibe_chaser':
        return (
          <G>
            {/* star eyes */}
            {[-1,1].map(side => (
              <G key={side} transform={`translate(${cx + side*size*0.09}, ${faceCY - size*0.01})`}>
                <Path d={`M 0 ${-size*0.06} L ${size*0.015} ${-size*0.015} L ${size*0.06} 0 L ${size*0.015} ${size*0.015} L 0 ${size*0.06} L ${-size*0.015} ${size*0.015} L ${-size*0.06} 0 L ${-size*0.015} ${-size*0.015} Z`}
                  fill="#F5D76E" />
              </G>
            ))}
            <Path d={`M ${cx - size*0.12} ${faceCY + size*0.1} Q ${cx} ${faceCY + size*0.19} ${cx + size*0.12} ${faceCY + size*0.1}`}
              stroke={c} strokeWidth={size*0.04} fill="none" strokeLinecap="round" />
            {/* sunglasses on forehead */}
            <G transform={`translate(${cx}, ${faceCY - size*0.18})`}>
              <Rect x={-size*0.13} y={-size*0.04} width={size*0.1} height={size*0.07} rx={size*0.02} fill={c} opacity={0.8} />
              <Rect x={size*0.03} y={-size*0.04} width={size*0.1} height={size*0.07} rx={size*0.02} fill={c} opacity={0.8} />
              <Line x1={-size*0.03} y1={-size*0.015} x2={size*0.03} y2={-size*0.015} stroke={c} strokeWidth={size*0.02} />
            </G>
          </G>
        );
      case 'culture_vulture':
        return (
          <G>
            {/* round glasses */}
            <Circle cx={cx - size*0.09} cy={faceCY} r={size*0.065} fill="none" stroke={c} strokeWidth={size*0.025} />
            <Circle cx={cx + size*0.09} cy={faceCY} r={size*0.065} fill="none" stroke={c} strokeWidth={size*0.025} />
            <Line x1={cx - size*0.025} y1={faceCY} x2={cx + size*0.025} y2={faceCY} stroke={c} strokeWidth={size*0.02} />
            <Path d={`M ${cx - size*0.08} ${faceCY + size*0.1} Q ${cx} ${faceCY + size*0.16} ${cx + size*0.08} ${faceCY + size*0.1}`}
              stroke={c} strokeWidth={size*0.03} fill="none" strokeLinecap="round" />
            {/* book on head */}
            <G transform={`translate(${cx}, ${faceCY - size*0.35})`}>
              <Rect x={-size*0.14} y={-size*0.07} width={size*0.28} height={size*0.13} rx={size*0.015} fill="#E8C97A" />
              <Line x1={0} y1={-size*0.07} x2={0} y2={size*0.06} stroke={c} strokeWidth={size*0.015} opacity={0.4} />
            </G>
          </G>
        );
      case 'slow_traveller':
        return (
          <G>
            {/* sleeping arcs */}
            <Path d={`M ${cx - size*0.14} ${faceCY} Q ${cx - size*0.09} ${faceCY - size*0.04} ${cx - size*0.04} ${faceCY}`}
              stroke={c} strokeWidth={size*0.035} fill="none" strokeLinecap="round" />
            <Path d={`M ${cx + size*0.04} ${faceCY} Q ${cx + size*0.09} ${faceCY - size*0.04} ${cx + size*0.14} ${faceCY}`}
              stroke={c} strokeWidth={size*0.035} fill="none" strokeLinecap="round" />
            {/* lashes */}
            {[-0.12, -0.08, -0.04, 0.04, 0.08, 0.12].map((x, i) => (
              <Line key={i} x1={cx + x*size} y1={faceCY + size*0.02}
                x2={cx + x*size} y2={faceCY + size*0.06}
                stroke={c} strokeWidth={size*0.02} strokeLinecap="round" />
            ))}
            <Path d={`M ${cx - size*0.08} ${faceCY + size*0.12} Q ${cx} ${faceCY + size*0.17} ${cx + size*0.08} ${faceCY + size*0.12}`}
              stroke={c} strokeWidth={size*0.03} fill="none" strokeLinecap="round" />
          </G>
        );
      default: return null;
    }
  };

  return (
    <Svg width={size * 1.7} height={size * 1.5} viewBox={`${-size * 0.35} ${-size * 0.3} ${size * 1.7} ${size * 1.5}`}>
      {/* pin body */}
      <Path
        d={`M ${cx} ${size * 1.05} 
            C ${cx - size*0.08} ${size*0.85} ${cx - bodyW/2} ${size*0.75} ${cx - bodyW/2} ${faceCY}
            A ${bodyW/2} ${bodyH*0.5} 0 1 1 ${cx + bodyW/2} ${faceCY}
            C ${cx + bodyW/2} ${size*0.75} ${cx + size*0.08} ${size*0.85} ${cx} ${size * 1.05} Z`}
        fill={c}
      />
      {/* face circle */}
      <Circle cx={cx} cy={faceCY} r={faceR} fill={f} />
      {renderFace()}
    </Svg>
  );
}

// ─── floating zzz for slow traveller ─────────────────────────────────────────
function FloatingZzz({ color }) {
  const floats = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];
  useEffect(() => {
    floats.forEach((anim, i) => {
      const loop = () => {
        anim.setValue(0);
        Animated.timing(anim, { toValue: 1, duration: 2000 + i * 400, delay: i * 600, useNativeDriver: true }).start(loop);
      };
      loop();
    });
  }, []);
  return (
    <View style={{ position: 'absolute', top: -20, right: -10 }}>
      {['Z', 'z', 'z'].map((z, i) => (
        <Animated.Text key={i} style={{
          position: 'absolute', top: -i * 18, right: i * 10,
          fontSize: 18 - i * 4, fontWeight: FONTS.bold, color,
          opacity: floats[i].interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
          transform: [{ translateY: floats[i].interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) }],
        }}>{z}</Animated.Text>
      ))}
    </View>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────
export default function GeneratingScreen({ navigation, route }) {
  const insets    = useSafeAreaInsets();
  const { tripData } = route.params;
  const personaKey   = tripData.moodOverride || tripData.personaKey;
  const colors       = PERSONA_COLORS[personaKey] || PERSONA_COLORS.lazy_gourmet;
  const messages     = LOADING_MESSAGES[personaKey] || LOADING_MESSAGES.lazy_gourmet;

  const [msgIndex,  setMsgIndex]  = useState(0);
  const [dots,      setDots]      = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;

  // bob animation
  const bobAnim  = useRef(new Animated.Value(0)).current;
  // message fade
  const msgFade  = useRef(new Animated.Value(1)).current;
  // dots animation ref
  const dotsRef  = useRef(null);
  const msgRef   = useRef(null);
  const apiCalled = useRef(false);

  // fake progress bar — fills to 85% in 8s, jumps to 100% when done
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0.85,
      duration: 8000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, []);

  // bob loop
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -18, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 0,   duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // rotating messages every 2.5s
  useEffect(() => {
    msgRef.current = setInterval(() => {
      Animated.timing(msgFade, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setMsgIndex(i => (i + 1) % messages.length);
        Animated.timing(msgFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    }, 2500);
    return () => clearInterval(msgRef.current);
  }, []);

  // animated dots
  useEffect(() => {
    dotsRef.current = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.');
    }, 500);
    return () => clearInterval(dotsRef.current);
  }, []);

  // call the API once on mount
  useEffect(() => {
    if (apiCalled.current) return;
    apiCalled.current = true;
    callGenerateAPI();
  }, []);

  const callGenerateAPI = async () => {
    try {
      const response = await fetch('http://192.168.1.188:8082/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripData }),
      });

      if (!response.ok) {
        const err = await response.json();
        // for user-facing errors (400), go back to trip setup
        if (response.status === 400) {
          clearInterval(msgRef.current);
          clearInterval(dotsRef.current);
          Alert.alert(
            'Cannot generate trip',
            err.error || 'Please check your trip details and try again.',
            [{ text: 'Go back', onPress: () => navigation.goBack() }]
          );
          return;
        }
        throw new Error(err.error || 'Generation failed');
      }

      const result = await response.json();

      // clear intervals before navigating
      clearInterval(msgRef.current);
      clearInterval(dotsRef.current);

      navigation.replace('Itinerary', { itinerary: result.itinerary, tripData });
    } catch (error) {
      console.error('Generate error:', error);
      clearInterval(msgRef.current);
      clearInterval(dotsRef.current);
      Alert.alert(
        'Something went wrong',
        error.message || 'Could not generate your trip. Please try again.',
        [{ text: 'Go back', onPress: () => navigation.goBack() }]
      );
    }
  };

  const destCity = tripData.destination.split(',')[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <StatusBar barStyle="dark-content" />

      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}>

        {/* destination label */}
        <Text style={[styles.destLabel, { color: colors.text }]}>
          ✈ {destCity}
        </Text>

        {/* character */}
        <View style={styles.characterWrap}>
          <Animated.View style={{ transform: [{ translateY: bobAnim }] }}>
            <PersonaCharacter personaKey={personaKey} size={160} colors={colors} />
          </Animated.View>
          {personaKey === 'slow_traveller' && <FloatingZzz color={colors.character} />}
        </View>

        {/* headline */}
        <Text style={[styles.headline, { color: colors.text }]}>
          Building your trip{dots}
        </Text>

        {/* rotating message */}
        <Animated.Text style={[styles.message, { color: colors.text, opacity: msgFade }]}>
          {messages[msgIndex]}
        </Animated.Text>

        {/* progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.character + '25' }]}>
          <Animated.View style={[
            styles.progressFill,
            {
              backgroundColor: colors.character,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]} />
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32,
  },
  destLabel: {
    fontSize: 14, fontWeight: FONTS.semibold, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 48, opacity: 0.7,
  },
  characterWrap: { marginBottom: 48, position: 'relative' },
  headline: {
    fontSize: 26, fontWeight: FONTS.bold, textAlign: 'center',
    marginBottom: 16, letterSpacing: -0.3,
  },
  message: {
    fontSize: 15, textAlign: 'center', lineHeight: 22,
    opacity: 0.75, paddingHorizontal: 16,
  },
  progressTrack: {
    width: '80%', height: 4, borderRadius: 2,
    marginTop: 40, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 2,
  },
});