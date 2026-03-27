import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, StatusBar, Share, FlatList,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS, RADIUS } from '../theme';

// ─── persona colours ──────────────────────────────────────────────────────────
const PERSONA_COLORS = {
  lazy_gourmet:       { character: '#D85A7A', card: '#F7C5D5', text: '#8B1A3A', light: '#FDF0F4' },
  efficient_explorer: { character: '#0D3D2E', card: '#A8CBBF', text: '#0D3D2E', light: '#EAF4F0' },
  vibe_chaser:        { character: '#7C3AED', card: '#C4B5F7', text: '#3B0F8C', light: '#F0ECFE' },
  culture_vulture:    { character: '#C8830A', card: '#F5D48A', text: '#7A4500', light: '#FEF8EC' },
  slow_traveller:     { character: '#4A5568', card: '#B8C0D4', text: '#2D3748', light: '#F0F2F7' },
};

// ─── category icons ───────────────────────────────────────────────────────────
function CategoryIcon({ category, color, size = 18 }) {
  const s = size;
  switch (category) {
    case 'food':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M18 8h1a4 4 0 010 8h-1" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <Path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" stroke={color} strokeWidth="2" fill="none"/>
          <Line x1="6" y1="1" x2="6" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="10" y1="1" x2="10" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
          <Line x1="14" y1="1" x2="14" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'sight':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill="none"/>
          <Path d="M12 8v4l3 3" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </Svg>
      );
    case 'cafe':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M17 8h1a4 4 0 010 8h-1" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
          <Path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z" stroke={color} strokeWidth="2" fill="none"/>
          <Path d="M6 2c0 2-2 2-2 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <Path d="M10 2c0 2-2 2-2 4" stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </Svg>
      );
    case 'bar':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M8 22V12L3 3h18l-5 9v10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          <Line x1="8" y1="22" x2="16" y2="22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        </Svg>
      );
    case 'activity':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      );
    case 'neighbourhood':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke={color} strokeWidth="2" fill="none"/>
          <Path d="M9 22V12h6v10" stroke={color} strokeWidth="2" fill="none"/>
        </Svg>
      );
    default: // rest
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24">
          <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="2" fill="none"/>
          <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2" fill="none"/>
          <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
        </Svg>
      );
  }
}

// ─── back icon ────────────────────────────────────────────────────────────────
function BackIcon({ color }) {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path d="M15 18L9 12L15 6" stroke={color} strokeWidth="2"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

// ─── share icon ───────────────────────────────────────────────────────────────
function ShareIcon({ color }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 24 24">
      <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <Path d="M16 6l-4-4-4 4" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <Line x1="12" y1="2" x2="12" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

// ─── stop card ────────────────────────────────────────────────────────────────
function StopCard({ stop, colors, index, isLast }) {
  const [expanded, setExpanded] = useState(index === 0);
  const anim = useRef(new Animated.Value(index === 0 ? 1 : 0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.timing(anim, { toValue, duration: 250, useNativeDriver: false }).start();
    setExpanded(!expanded);
  };

  const maxHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 300] });

  return (
    <View style={styles.stopRow}>
      {/* timeline */}
      <View style={styles.timeline}>
        <View style={[styles.timelineDot, { backgroundColor: colors.character }]} />
        {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.character + '30' }]} />}
      </View>

      {/* card */}
      <TouchableOpacity
        style={[styles.stopCard, { backgroundColor: colors.light }]}
        onPress={toggle}
        activeOpacity={0.85}
      >
        {/* card header */}
        <View style={styles.stopHeader}>
          <View style={styles.stopMeta}>
            <Text style={[styles.stopTime, { color: colors.character }]}>{stop.time}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
              <CategoryIcon category={stop.category} color={colors.text} size={12} />
              <Text style={[styles.categoryText, { color: colors.text }]}>
                {stop.category}
              </Text>
            </View>
          </View>
          <View style={styles.stopRight}>
            {stop.cost && (
              <Text style={[styles.stopCost, { color: colors.character }]}>
                {stop.cost}
              </Text>
            )}
            {stop.duration && (
              <Text style={[styles.stopDuration, { color: colors.character + '99' }]}>
                {stop.duration}
              </Text>
            )}
          </View>
        </View>

        <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>

        {/* expandable content */}
        <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
          <Text style={[styles.stopDescription, { color: colors.text + 'CC' }]}>
            {stop.description}
          </Text>
          {stop.tip && (
            <View style={[styles.tipBox, { borderLeftColor: colors.character }]}>
              <Text style={[styles.tipLabel, { color: colors.character }]}>💡 Tip</Text>
              <Text style={[styles.tipText, { color: colors.text + 'BB' }]}>{stop.tip}</Text>
            </View>
          )}
        </Animated.View>

        {/* expand hint */}
        <Text style={[styles.expandHint, { color: colors.character + '80' }]}>
          {expanded ? '▲ less' : '▼ more'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── day view ─────────────────────────────────────────────────────────────────
function DayView({ day, colors }) {
  return (
    <ScrollView
      style={styles.dayScroll}
      contentContainerStyle={styles.dayScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* day title */}
      <View style={styles.dayTitleRow}>
        <View style={[styles.dayThemeBadge, { backgroundColor: colors.card }]}>
          <Text style={[styles.dayThemeText, { color: colors.text }]}>{day.theme}</Text>
        </View>
        <Text style={[styles.dayTitle, { color: colors.text }]}>{day.title}</Text>
      </View>

      {/* stops */}
      {day.stops.map((stop, i) => (
        <StopCard
          key={i}
          stop={stop}
          colors={colors}
          index={i}
          isLast={i === day.stops.length - 1}
        />
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────
export default function ItineraryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { itinerary, tripData } = route.params;
  const personaKey = tripData.moodOverride || tripData.personaKey;
  const colors     = PERSONA_COLORS[personaKey] || PERSONA_COLORS.lazy_gourmet;

  const [activeDay, setActiveDay] = useState(0);
  const tabScrollRef = useRef(null);

  const days       = itinerary.days || [];
  const destCity   = tripData.destination.split(',')[0];
  const tagline    = itinerary.tagline || '';
  const closingNote = itinerary.closing_note || '';

  const handleShare = async () => {
    try {
      const text = [
        `✈ ${tripData.destination}`,
        `${tagline}`,
        '',
        ...days.map(d =>
          [`Day ${d.day}: ${d.title}`, ...d.stops.map(s => `  ${s.time} — ${s.name}`)].join('\n')
        ),
        '',
        closingNote,
        '',
        'Made with WanderSoul 🌍',
      ].join('\n');

      await Share.share({ message: text, title: `My ${destCity} itinerary` });
    } catch (e) {
      console.error(e);
    }
  };

  const selectDay = (index) => {
    setActiveDay(index);
    tabScrollRef.current?.scrollTo({
      x: index * 72 - 20,
      animated: true,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.light }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: colors.card }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn} activeOpacity={0.7}>
            <BackIcon color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerCity, { color: colors.text }]}>{destCity}</Text>
            <Text style={[styles.headerDays, { color: colors.text + '99' }]}>
              {days.length} day{days.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity onPress={handleShare} style={styles.iconBtn} activeOpacity={0.7}>
            <ShareIcon color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* tagline */}
        {tagline ? (
          <Text style={[styles.tagline, { color: colors.text + 'AA' }]}>"{tagline}"</Text>
        ) : null}

        {/* day tabs */}
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
          style={styles.tabs}
        >
          {days.map((day, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.tab,
                activeDay === i && { backgroundColor: colors.character },
              ]}
              onPress={() => selectDay(i)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.tabDay,
                { color: activeDay === i ? '#fff' : colors.text + '88' },
              ]}>
                Day {day.day}
              </Text>
              <Text style={[
                styles.tabTheme,
                { color: activeDay === i ? '#fff' : colors.text + '66' },
              ]} numberOfLines={1}>
                {day.theme}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── active day content ── */}
      {days[activeDay] && (
        <DayView
          key={activeDay}
          day={days[activeDay]}
          colors={colors}
        />
      )}

      {/* ── closing note (only on last day) ── */}
      {activeDay === days.length - 1 && closingNote ? (
        <View style={[styles.closingNote, { backgroundColor: colors.card, marginBottom: insets.bottom + 8 }]}>
          <Text style={[styles.closingNoteText, { color: colors.text + 'CC' }]}>
            {closingNote}
          </Text>
        </View>
      ) : null}

    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // header
  header:      { paddingBottom: 0 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 8 },
  iconBtn:     { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter:{ flex: 1, alignItems: 'center' },
  headerCity:  { fontSize: 18, fontWeight: FONTS.bold, letterSpacing: -0.3 },
  headerDays:  { fontSize: 12, fontWeight: FONTS.medium, marginTop: 1 },
  tagline: {
    fontSize: 12, textAlign: 'center', fontStyle: 'italic',
    paddingHorizontal: 24, paddingBottom: 12, lineHeight: 17,
  },

  // tabs
  tabs:        { borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.08)' },
  tabsContent: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: RADIUS.md, minWidth: 64, alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  tabDay:   { fontSize: 11, fontWeight: FONTS.bold, letterSpacing: 0.3 },
  tabTheme: { fontSize: 10, marginTop: 1, maxWidth: 64 },

  // day scroll
  dayScroll:        { flex: 1 },
  dayScrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  dayTitleRow:      { marginBottom: 20, gap: 6 },
  dayThemeBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 20,
  },
  dayThemeText: { fontSize: 11, fontWeight: FONTS.bold, letterSpacing: 0.5, textTransform: 'uppercase' },
  dayTitle:     { fontSize: 22, fontWeight: FONTS.bold, letterSpacing: -0.3 },

  // stop row (timeline + card)
  stopRow:      { flexDirection: 'row', gap: 14, marginBottom: 12 },
  timeline:     { alignItems: 'center', paddingTop: 16, width: 16 },
  timelineDot:  { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { flex: 1, width: 2, marginTop: 4, borderRadius: 1 },

  // stop card
  stopCard: {
    flex: 1, borderRadius: RADIUS.lg, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  stopHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  stopMeta:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stopTime:      { fontSize: 13, fontWeight: FONTS.bold, letterSpacing: 0.3 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  categoryText:  { fontSize: 10, fontWeight: FONTS.semibold, textTransform: 'capitalize' },
  stopRight:     { alignItems: 'flex-end', gap: 2 },
  stopCost:      { fontSize: 12, fontWeight: FONTS.bold },
  stopDuration:  { fontSize: 11, fontWeight: FONTS.medium },
  stopName:      { fontSize: 16, fontWeight: FONTS.bold, marginBottom: 8, letterSpacing: -0.2 },
  stopDescription:{ fontSize: 13, lineHeight: 20, marginBottom: 10 },
  tipBox:        { borderLeftWidth: 3, paddingLeft: 10, marginBottom: 8 },
  tipLabel:      { fontSize: 11, fontWeight: FONTS.bold, marginBottom: 3 },
  tipText:       { fontSize: 12, lineHeight: 17 },
  expandHint:    { fontSize: 11, textAlign: 'right', marginTop: 4 },

  // closing note
  closingNote: {
    margin: 16, borderRadius: RADIUS.lg,
    padding: 16,
  },
  closingNoteText: { fontSize: 13, lineHeight: 20, fontStyle: 'italic', textAlign: 'center' },
});