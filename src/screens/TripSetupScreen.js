import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Modal, FlatList,
  Platform, Animated, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Path, Line, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import countries from 'world-countries';
import { COLORS, FONTS, RADIUS } from '../theme';
import { PERSONAS } from '../data/quizData';
import { getPersonaResult } from '../utils/store';

// ─── constants ────────────────────────────────────────────────────────────────
const PLACES_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

// Build sorted country list from world-countries package
const COUNTRY_LIST = countries
  .map(c => c.name.common)
  .sort((a, b) => a.localeCompare(b));

const BUDGET_DESCRIPTIONS = {
  backpacker:  'Hostels, street food, local transport — stretch every dollar.',
  'mid-range': 'Boutique hotels, sit-down dinners, occasional splurge.',
  luxury:      'Five-star stays, fine dining, private transfers.',
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const formatDate = (date) => {
  if (!date) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatTime = (date) => {
  if (!date) return '';
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
};

// ─── icons ────────────────────────────────────────────────────────────────────
function BackIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24">
      <Path d="M15 18L9 12L15 6" stroke={COLORS.tealDark} strokeWidth="2"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Path d="M6 4L10 8L6 12" stroke={COLORS.hint} strokeWidth="1.5"
        fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function SearchIcon() {
  return (
    <Svg width="16" height="16" viewBox="0 0 16 16">
      <Circle cx="6.5" cy="6.5" r="5" fill="none" stroke={COLORS.hint} strokeWidth="1.5" />
      <Line x1="10.5" y1="10.5" x2="14" y2="14" stroke={COLORS.hint} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

// ─── field label ──────────────────────────────────────────────────────────────
function FieldLabel({ label, required }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}{required && <Text style={styles.required}> ✱</Text>}
    </Text>
  );
}

// ─── tappable display field ───────────────────────────────────────────────────
function DisplayField({ value, placeholder, onPress, error }) {
  return (
    <TouchableOpacity
      style={[styles.field, error && styles.fieldError]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.fieldText, !value && styles.fieldPlaceholder]}>
        {value || placeholder}
      </Text>
      <ChevronRight />
    </TouchableOpacity>
  );
}

// ─── destination autocomplete modal ──────────────────────────────────────────
function DestinationModal({ visible, onClose, onSelect }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(false);
  const [noResults, setNoResults]   = useState(false);
  const debounceRef                 = useRef(null);

  const fetchPlaces = useCallback(async (text) => {
    if (text.length < 2) { setResults([]); setNoResults(false); return; }
    setLoading(true);
    setNoResults(false);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json` +
        `?input=${encodeURIComponent(text)}` +
        `&types=(cities)` +
        `&key=${PLACES_KEY}`;
      const res  = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK') {
        setResults(data.predictions);
        setNoResults(data.predictions.length === 0);
      } else {
        setResults([]);
        setNoResults(true);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    // debounce — wait 350ms after user stops typing before hitting API
    debounceRef.current = setTimeout(() => fetchPlaces(text), 350);
  };

  const handleSelect = (prediction) => {
    onSelect(prediction.description);
    setQuery('');
    setResults([]);
    onClose();
  };

  const handleClose = () => {
    setQuery('');
    setResults([]);
    setNoResults(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Where to?</Text>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
            <Text style={styles.modalClose}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search any city in the world..."
            placeholderTextColor={COLORS.hint}
            value={query}
            onChangeText={handleChange}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {loading && <ActivityIndicator size="small" color={COLORS.teal} />}
        </View>

        {query.length < 2 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Start typing a city name</Text>
            <Text style={styles.emptyStateHint}>e.g. "Tokyo", "Barcelona", "Cape Town"</Text>
          </View>
        )}

        {noResults && query.length >= 2 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No cities found</Text>
            <Text style={styles.emptyStateHint}>Try a different spelling</Text>
          </View>
        )}

        <FlatList
          data={results}
          keyExtractor={item => item.place_id}
          renderItem={({ item }) => {
            // split into main text (city) and secondary (country/region)
            const main      = item.structured_formatting?.main_text || item.description;
            const secondary = item.structured_formatting?.secondary_text || '';
            return (
              <TouchableOpacity
                style={styles.listItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.listItemMain}>{main}</Text>
                {secondary ? <Text style={styles.listItemSub}>{secondary}</Text> : null}
              </TouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </Modal>
  );
}

// ─── country picker modal ─────────────────────────────────────────────────────
function CountryModal({ visible, onClose, onSelect }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const filtered = COUNTRY_LIST.filter(c =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const handleClose  = () => { setSearch(''); onClose(); };
  const handleSelect = (c) => { setSearch(''); onSelect(c); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Home country</Text>
          <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
            <Text style={styles.modalClose}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrapper}>
          <SearchIcon />
          <TextInput
            style={styles.searchInput}
            placeholder="Search all 195 countries..."
            placeholderTextColor={COLORS.hint}
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.listItemMain}>{item}</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={20}
          maxToRenderPerBatch={20}
        />
      </View>
    </Modal>
  );
}

// ─── date/time picker modal (iOS) ─────────────────────────────────────────────
function DateTimePickerModal({ visible, onClose, value, mode, minimumDate, onChange }) {
  const insets    = useSafeAreaInsets();
  const [temp, setTemp] = useState(value || new Date());

  // reset temp when modal opens with new value
  React.useEffect(() => { if (visible) setTemp(value || new Date()); }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.pickerOverlay}>
        <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 8 }]}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.pickerCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.pickerTitle}>
              {mode === 'date' ? 'Select date' : 'Select time'}
            </Text>
            <TouchableOpacity
              onPress={() => { onChange(null, temp); onClose(); }}
              activeOpacity={0.7}
            >
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={temp}
            mode={mode}
            display="spinner"
            minimumDate={minimumDate}
            onChange={(_, d) => { if (d) setTemp(d); }}
            style={{ backgroundColor: COLORS.white }}
            textColor={COLORS.tealDark}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────
export default function TripSetupScreen({ navigation }) {
  const insets     = useSafeAreaInsets();
  const quizResult = getPersonaResult();
  const personaKey = quizResult?.primary || 'lazy_gourmet';
  const persona    = PERSONAS[personaKey];

  // form
  const [destination,  setDestination]  = useState('');
  const [homeCountry,  setHomeCountry]  = useState('');
  const [landingDate,  setLandingDate]  = useState(null);
  const [landingTime,  setLandingTime]  = useState(null);
  const [takeoffDate,  setTakeoffDate]  = useState(null);
  const [takeoffTime,  setTakeoffTime]  = useState(null);
  const [partySize,    setPartySize]    = useState(1);
  const [budget,       setBudget]       = useState('mid-range');
  const [moodOverride, setMoodOverride] = useState('');
  const [showVibe,     setShowVibe]     = useState(false);
  const [errors,       setErrors]       = useState({});

  // modal visibility
  const [showDest,        setShowDest]        = useState(false);
  const [showCountry,     setShowCountry]     = useState(false);
  const [showLandingDate, setShowLandingDate] = useState(false);
  const [showLandingTime, setShowLandingTime] = useState(false);
  const [showTakeoffDate, setShowTakeoffDate] = useState(false);
  const [showTakeoffTime, setShowTakeoffTime] = useState(false);

  // vibe animation
  const vibeAnim = useRef(new Animated.Value(0)).current;
  const toggleVibe = () => {
    if (!showVibe) {
      setShowVibe(true);
      Animated.timing(vibeAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
    } else {
      Animated.timing(vibeAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() => {
        setShowVibe(false);
        setMoodOverride('');
      });
    }
  };

  const clearError = (key) => setErrors(e => ({ ...e, [key]: null }));

  const validate = () => {
    const e = {};
    if (!destination.trim()) e.destination = 'Where are you going?';
    if (!homeCountry)         e.homeCountry = 'Needed to calculate your airport buffer';
    if (!landingDate)         e.landingDate = 'Landing date required';
    if (!landingTime)         e.landingTime = 'Landing time required';
    if (!takeoffDate)         e.takeoffDate = 'Takeoff date required';
    if (!takeoffTime)         e.takeoffTime = 'Takeoff time required';
    if (landingDate && landingDate < new Date(new Date().setHours(0,0,0,0)))
      e.landingDate = 'Did you mean next year?';
    if (landingDate && takeoffDate && takeoffDate < landingDate)
      e.takeoffDate = 'Takeoff must be after landing';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleGenerate = () => {
    if (!validate()) return;

    const arrival = new Date(landingDate);
    arrival.setHours(landingTime.getHours(), landingTime.getMinutes(), 0, 0);

    const departure = new Date(takeoffDate);
    departure.setHours(takeoffTime.getHours(), takeoffTime.getMinutes(), 0, 0);

    const effectiveArrival   = new Date(arrival.getTime() + 60 * 60 * 1000);
    const isInternational    = !destination.toLowerCase().includes(homeCountry.toLowerCase());
    const bufferMins         = isInternational ? 180 : 90;
    const effectiveDeparture = new Date(departure.getTime() - bufferMins * 60 * 1000);

    let arrivalMode = 'normal';
    if (personaKey === 'vibe_chaser') arrivalMode = 'vibe_night';
    else if (effectiveArrival.getHours() >= 19) arrivalMode = 'rest';

    const hoursUntil   = (arrival - new Date()) / (1000 * 60 * 60);
    const isLastMinute = hoursUntil <= 48 && hoursUntil > 0;
    const totalDays    = Math.ceil((departure - arrival) / (1000 * 60 * 60 * 24));
    const usableDays   = totalDays - (arrivalMode === 'rest' ? 1 : 0);

    navigation.navigate('Generating', {
      tripData: {
        destination: destination.trim(), homeCountry,
        arrival: arrival.toISOString(), departure: departure.toISOString(),
        effectiveArrival: effectiveArrival.toISOString(),
        effectiveDeparture: effectiveDeparture.toISOString(),
        arrivalMode, isLastMinute, isInternational,
        partySize, budget, personaKey,
        moodOverride: moodOverride || null,
        usableDays, totalDays,
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* nav */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Plan a trip</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* destination */}
          <FieldLabel label="Destination" required />
          <DisplayField
            value={destination}
            placeholder="Search any city..."
            onPress={() => setShowDest(true)}
            error={errors.destination}
          />
          {errors.destination && <Text style={styles.errorText}>{errors.destination}</Text>}

          {/* home country */}
          <FieldLabel label="Where are you flying from?" required />
          <DisplayField
            value={homeCountry}
            placeholder="Select your home country"
            onPress={() => setShowCountry(true)}
            error={errors.homeCountry}
          />
          {errors.homeCountry && <Text style={styles.errorText}>{errors.homeCountry}</Text>}

          {/* landing */}
          <FieldLabel label="Landing date & time" required />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <DisplayField
                value={formatDate(landingDate)}
                placeholder="Date"
                onPress={() => setShowLandingDate(true)}
                error={errors.landingDate}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DisplayField
                value={formatTime(landingTime)}
                placeholder="Time"
                onPress={() => setShowLandingTime(true)}
                error={errors.landingTime}
              />
            </View>
          </View>
          {(errors.landingDate || errors.landingTime) && (
            <Text style={styles.errorText}>{errors.landingDate || errors.landingTime}</Text>
          )}

          {/* takeoff */}
          <FieldLabel label="Takeoff date & time" required />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <DisplayField
                value={formatDate(takeoffDate)}
                placeholder="Date"
                onPress={() => setShowTakeoffDate(true)}
                error={errors.takeoffDate}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DisplayField
                value={formatTime(takeoffTime)}
                placeholder="Time"
                onPress={() => setShowTakeoffTime(true)}
                error={errors.takeoffTime}
              />
            </View>
          </View>
          {(errors.takeoffDate || errors.takeoffTime) && (
            <Text style={styles.errorText}>{errors.takeoffDate || errors.takeoffTime}</Text>
          )}

          {/* party size */}
          <FieldLabel label="Party size" />
          <View style={styles.stepper}>
            <TouchableOpacity
              style={[styles.stepperBtn, partySize <= 1 && styles.stepperBtnDisabled]}
              onPress={() => setPartySize(s => Math.max(1, s - 1))}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.stepperDisplay}>
              <Text style={styles.stepperValue}>{partySize}</Text>
              <Text style={styles.stepperUnit}>{partySize === 1 ? 'traveller' : 'travellers'}</Text>
            </View>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => setPartySize(s => s + 1)}
              activeOpacity={0.7}
            >
              <Text style={styles.stepperBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* budget */}
          <FieldLabel label={`Budget — relative to ${destination || 'destination'}`} />
          <View style={styles.budgetChips}>
            {['backpacker', 'mid-range', 'luxury'].map(tier => (
              <TouchableOpacity
                key={tier}
                style={[styles.chip, budget === tier && styles.chipActive]}
                onPress={() => setBudget(tier)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, budget === tier && styles.chipTextActive]}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.budgetDesc}>
            <Text style={styles.budgetDescText}>{BUDGET_DESCRIPTIONS[budget]}</Text>
          </View>

          {/* vibe */}
          <View style={styles.vibeSection}>
            <TouchableOpacity onPress={toggleVibe} activeOpacity={0.7}>
              <Text style={styles.vibeLink}>
                Planning a different kind of trip?{' '}
                <Text style={styles.vibeLinkBold}>Change vibe ›</Text>
              </Text>
            </TouchableOpacity>
            {showVibe && (
              <Animated.View style={[styles.vibeOptions, { opacity: vibeAnim }]}>
                <Text style={styles.vibeHint}>
                  Overrides your {persona?.name} persona for this trip only.
                </Text>
                <View style={styles.vibeChips}>
                  {Object.entries(PERSONAS).map(([key, p]) => (
                    <TouchableOpacity
                      key={key}
                      style={[styles.chip, moodOverride === key && styles.chipActive]}
                      onPress={() => setMoodOverride(prev => prev === key ? '' : key)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.chipText, moodOverride === key && styles.chipTextActive]}>
                        {p.name.replace('The ', '')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            )}
          </View>

          {/* generate */}
          <TouchableOpacity style={styles.generateBtn} onPress={handleGenerate} activeOpacity={0.85}>
            <Text style={styles.generateBtnText}>Generate my trip →</Text>
          </TouchableOpacity>

          <View style={{ height: insets.bottom + 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── all modals ── */}
      <DestinationModal
        visible={showDest}
        onClose={() => setShowDest(false)}
        onSelect={(v) => { setDestination(v); clearError('destination'); }}
      />
      <CountryModal
        visible={showCountry}
        onClose={() => setShowCountry(false)}
        onSelect={(v) => { setHomeCountry(v); clearError('homeCountry'); }}
      />

      {Platform.OS === 'ios' ? (
        <>
          <DateTimePickerModal visible={showLandingDate} onClose={() => setShowLandingDate(false)}
            value={landingDate} mode="date" minimumDate={new Date()}
            onChange={(_, d) => { if (d) { setLandingDate(d); clearError('landingDate'); } }} />
          <DateTimePickerModal visible={showLandingTime} onClose={() => setShowLandingTime(false)}
            value={landingTime} mode="time"
            onChange={(_, d) => { if (d) { setLandingTime(d); clearError('landingTime'); } }} />
          <DateTimePickerModal visible={showTakeoffDate} onClose={() => setShowTakeoffDate(false)}
            value={takeoffDate} mode="date" minimumDate={landingDate || new Date()}
            onChange={(_, d) => { if (d) { setTakeoffDate(d); clearError('takeoffDate'); } }} />
          <DateTimePickerModal visible={showTakeoffTime} onClose={() => setShowTakeoffTime(false)}
            value={takeoffTime} mode="time"
            onChange={(_, d) => { if (d) { setTakeoffTime(d); clearError('takeoffTime'); } }} />
        </>
      ) : (
        <>
          {showLandingDate  && <DateTimePicker value={landingDate  || new Date()} mode="date" minimumDate={new Date()} onChange={(_, d) => { setShowLandingDate(false); if (d) { setLandingDate(d);  clearError('landingDate');  } }} />}
          {showLandingTime  && <DateTimePicker value={landingTime  || new Date()} mode="time" is24Hour onChange={(_, d) => { setShowLandingTime(false); if (d) { setLandingTime(d);  clearError('landingTime');  } }} />}
          {showTakeoffDate  && <DateTimePicker value={takeoffDate  || new Date()} mode="date" minimumDate={landingDate || new Date()} onChange={(_, d) => { setShowTakeoffDate(false); if (d) { setTakeoffDate(d); clearError('takeoffDate'); } }} />}
          {showTakeoffTime  && <DateTimePicker value={takeoffTime  || new Date()} mode="time" is24Hour onChange={(_, d) => { setShowTakeoffTime(false); if (d) { setTakeoffTime(d);  clearError('takeoffTime');  } }} />}
        </>
      )}
    </View>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: COLORS.cream },
  navBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cream,
  },
  backBtn:       { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle:      { fontSize: 17, fontWeight: FONTS.bold, color: COLORS.tealDark },
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 24 },

  fieldLabel: {
    fontSize: 11, fontWeight: FONTS.semibold, color: COLORS.muted,
    letterSpacing: 0.6, marginBottom: 8, marginTop: 22, textTransform: 'uppercase',
  },
  required:        { color: COLORS.red },
  field: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border,
    paddingHorizontal: 14, paddingVertical: 15,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  fieldError:      { borderColor: COLORS.red, borderWidth: 1 },
  fieldText:       { fontSize: 15, color: COLORS.tealDark, fontWeight: FONTS.medium },
  fieldPlaceholder:{ color: COLORS.hint, fontWeight: FONTS.regular },
  errorText:       { fontSize: 12, color: COLORS.red, marginTop: 5, marginLeft: 2 },
  row:             { flexDirection: 'row', gap: 10 },

  stepper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.white, borderRadius: RADIUS.md,
    borderWidth: 0.5, borderColor: COLORS.border, paddingHorizontal: 14, paddingVertical: 10,
  },
  stepperBtn:         { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center' },
  stepperBtnDisabled: { backgroundColor: COLORS.tealLight },
  stepperBtnText:     { fontSize: 22, color: '#fff', fontWeight: FONTS.bold, lineHeight: 24 },
  stepperDisplay:     { alignItems: 'center' },
  stepperValue:       { fontSize: 22, fontWeight: FONTS.bold, color: COLORS.tealDark },
  stepperUnit:        { fontSize: 11, color: COLORS.hint, marginTop: 1 },

  budgetChips: { flexDirection: 'row', gap: 10 },
  chip: {
    flex: 1, paddingVertical: 12, borderRadius: RADIUS.md,
    backgroundColor: COLORS.white, borderWidth: 0.5,
    borderColor: COLORS.border, alignItems: 'center',
  },
  chipActive:      { backgroundColor: COLORS.teal, borderColor: COLORS.teal },
  chipText:        { fontSize: 13, fontWeight: FONTS.medium, color: COLORS.muted },
  chipTextActive:  { color: '#fff', fontWeight: FONTS.bold },
  budgetDesc:      { marginTop: 10, backgroundColor: COLORS.tealLight, borderRadius: RADIUS.md, padding: 12 },
  budgetDescText:  { fontSize: 12, color: COLORS.teal, lineHeight: 18, fontWeight: FONTS.medium },

  vibeSection: { marginTop: 28 },
  vibeLink:    { fontSize: 13, color: COLORS.hint, textAlign: 'center' },
  vibeLinkBold:{ color: COLORS.teal, fontWeight: FONTS.semibold },
  vibeOptions: { marginTop: 14, gap: 10 },
  vibeHint:    { fontSize: 12, color: COLORS.muted, textAlign: 'center', marginBottom: 4 },
  vibeChips:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },

  generateBtn: {
    backgroundColor: COLORS.teal, borderRadius: RADIUS.lg,
    paddingVertical: 18, alignItems: 'center', marginTop: 32,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: FONTS.bold },

  // modals
  modalContainer: { flex: 1, backgroundColor: COLORS.cream },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  modalTitle:  { fontSize: 16, fontWeight: FONTS.bold, color: COLORS.tealDark },
  modalClose:  { fontSize: 15, color: COLORS.red, fontWeight: FONTS.semibold },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    margin: 16, backgroundColor: COLORS.white,
    borderRadius: RADIUS.md, borderWidth: 0.5,
    borderColor: COLORS.border, paddingHorizontal: 12, gap: 8,
  },
  searchInput:    { flex: 1, fontSize: 15, color: COLORS.tealDark, paddingVertical: 12 },
  listItem:       { paddingHorizontal: 20, paddingVertical: 14 },
  listItemMain:   { fontSize: 15, color: COLORS.tealDark, fontWeight: FONTS.medium },
  listItemSub:    { fontSize: 12, color: COLORS.hint, marginTop: 2 },
  separator:      { height: 0.5, backgroundColor: COLORS.border, marginLeft: 20 },
  emptyState:     { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyStateText: { fontSize: 15, color: COLORS.muted, fontWeight: FONTS.semibold },
  emptyStateHint: { fontSize: 13, color: COLORS.hint },

  // date/time picker sheet
  pickerOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  pickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  pickerHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.border,
  },
  pickerTitle:  { fontSize: 15, fontWeight: FONTS.bold, color: COLORS.tealDark },
  pickerCancel: { fontSize: 15, color: COLORS.muted },
  pickerDone:   { fontSize: 15, color: COLORS.teal, fontWeight: FONTS.bold },
});