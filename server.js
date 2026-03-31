// server.js — WanderSoul backend proxy
// Run this in a second terminal: node server.js
// Keeps the Anthropic API key off the device

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app         = express();
const PORT        = 8082;
const PLACES_KEY  = process.env.EXPO_PUBLIC_GOOGLE_PLACES_KEY;

app.use(cors());
app.use(express.json());

// ─── health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WanderSoul API' });
});

// ─── prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(tripData) {
  const {
    destination, personaKey, moodOverride,
    effectiveArrival, effectiveDeparture,
    arrivalMode, usableDays, totalDays,
    partySize, budget, isLastMinute,
    destinationTimezone,
  } = tripData;

  const activePersona = moodOverride || personaKey;

  // Format times in destination timezone so Claude reasons in local time
  const fmtOpts = { timeZone: destinationTimezone || 'UTC', dateStyle: 'full', timeStyle: 'short' };
  const arrivalLocal   = new Date(effectiveArrival).toLocaleString('en-GB', fmtOpts);
  const departureLocal = new Date(effectiveDeparture).toLocaleString('en-GB', fmtOpts);

  const PERSONA_DESCRIPTIONS = {
    lazy_gourmet:
      'a foodie who prioritises incredible meals and comfortable, relaxed experiences. Avoid packed schedules — quality over quantity. Every day must have at least one outstanding food experience and plenty of breathing room.',
    efficient_explorer:
      'someone who wants to see as much as possible. They appreciate geographically logical routes — cluster stops by neighbourhood so they never zigzag across the city. Dense days are fine but stops must flow logically on a map.',
    vibe_chaser:
      'someone chasing atmosphere, energy and nightlife. Mornings are slow and late. Evenings are everything — bars, rooftops, live music, street food. Plan backward from the night.',
    culture_vulture:
      'deeply interested in history, art and local stories. They want museums, galleries and historical neighbourhoods. Each day should focus on ONE district or cultural theme — depth over breadth.',
    slow_traveller:
      'someone who wants to slow down and actually inhabit a place. One neighbourhood per day maximum. Long pauses. No rushing between stops.',
  };

  const PERSONA_STOP_RULES = {
    lazy_gourmet:       'EXACTLY 3 stops per full day. No more, no less. Start no earlier than 10:00. Must include at least one meal stop per day. Long durations, relaxed pace.',
    efficient_explorer: 'EXACTLY 4 stops per full day. Cluster stops geographically — all stops must be in the same area or on a logical walking/transit route. Never zigzag across the city.',
    vibe_chaser:        'EXACTLY 4 stops per full day. Start no earlier than 12:00. First 1-2 stops are afternoon/food. Last 2 stops are evening bars, rooftops or nightlife. At least one nightlife stop per full day.',
    culture_vulture:    'EXACTLY 4 stops per full day. All stops in a day must be in the same district or share one cultural theme. No mixing random sights — every day has a clear through-line.',
    slow_traveller:     'EXACTLY 3 stops per full day. One neighbourhood only. Long durations (1.5-2hrs each). Unhurried pace. Include at least one cafe or park stop per day.',
  };

  const arrivalNote =
    arrivalMode === 'rest'
      ? `ARRIVAL MODE: REST. The traveller arrives late (local destination time: ${arrivalLocal}). Day 1 MUST have an empty stops array []. Title it "Arrival", theme "Rest". Activities begin Day 2. This is non-negotiable.`
      : arrivalMode === 'vibe_night'
      ? `ARRIVAL MODE: VIBE NIGHT. The traveller arrives at ${arrivalLocal} local time and wants to go straight out. Day 1 gets exactly 1-2 evening stops starting from arrival time. No morning stops.`
      : `ARRIVAL MODE: NORMAL. The traveller arrives at ${arrivalLocal} local time. Day 1 gets 1-2 light stops starting from that time only — do not plan stops before the arrival time.`;

  const departureNote = `The traveller must leave for the airport by ${departureLocal} local time on the last day. Do not plan stops that run past this time on the final day.`;

  const urgencyNote = isLastMinute
    ? `SPONTANEOUS MODE — This trip is within 48 hours:
- Use decisive, energetic, confident language in all descriptions
- No caveats, no "you might want to consider", no hedging
- Short punchy descriptions — the traveller is already excited, match that energy
- Avoid any stops requiring advance booking or reservations
- Day 1 starts from adjusted landing time immediately`
    : '';

  // longer trips need shorter descriptions to stay within token limits
  const concisenessNote = usableDays >= 6
    ? 'IMPORTANT: This is a long trip. Keep descriptions to 1-2 sentences max and tips to 1 short sentence. Be punchy, not verbose.'
    : '';

  const budgetNote =
    budget === 'backpacker' ? 'hostels, street food, free sights — stretch every dollar'
    : budget === 'luxury'   ? 'five-star experiences, fine dining, private transfers'
    :                         'boutique hotels, sit-down restaurants, occasional splurge';

  return `You are a world-class travel planner API. Respond ONLY with valid JSON.

TRAVELLER PERSONA: ${activePersona.replace(/_/g, ' ').toUpperCase()}
${PERSONA_DESCRIPTIONS[activePersona]}

STOP RULES FOR THIS PERSONA: ${PERSONA_STOP_RULES[activePersona]}

TRIP DETAILS:
- Destination: ${destination}
- Arrival (destination local time): ${arrivalLocal}
- Departure (destination local time): ${departureLocal}
- Usable days: ${usableDays} (total trip: ${totalDays} days)
- Party size: ${partySize} ${partySize === 1 ? 'person' : 'people'}
- Budget: ${budget} — ${budgetNote}

${arrivalNote}
${departureNote}
${urgencyNote}
${concisenessNote}

RULES:
1. Valid JSON only — no markdown, no explanation
2. Exactly ${usableDays} days
3. NEVER include hotels, check-in, check-out
4. All stop names must be real places that exist in ${destination}
5. id_required: true ONLY for age-restricted or passport-required venues
6. GEOGRAPHIC LOGIC: Each day's stops must be in the same part of the city or on a logical route. Think like a local giving directions — would someone actually do these stops in this order without wasting time?

JSON structure:
{
  "destination": "${destination}",
  "persona": "${activePersona}",
  "tagline": "trip summary in persona voice, max 12 words",
  "days": [
    {
      "day": 1,
      "title": "short evocative day title",
      "theme": "one word: Arrival | Food | Culture | Explore | Unwind | Nightlife | Rest",
      "stops": [
        {
          "time": "HH:MM",
          "name": "Place Name",
          "category": "food | sight | cafe | bar | activity | neighbourhood | rest",
          "duration": "e.g. 1.5 hrs",
          "description": "2-3 warm, vivid sentences in the persona's voice — make it feel exciting and personal",
          "tip": "one genuine insider tip a local would actually give",
          "cost": "e.g. Free, $10-15, $30+",
          "id_required": false
        }
      ]
    }
  ],
  "closing_note": "a warm 1-2 sentence sign-off in the persona's voice"
}`;
}

// ─── generate route ───────────────────────────────────────────────────────────
app.post('/generate', async (req, res) => {
  console.log('📥 Received request body:', JSON.stringify(req.body).slice(0, 200));
  try {
    const { tripData } = req.body;

    if (!tripData) {
      return res.status(400).json({ error: 'Missing tripData' });
    }

    // server-side 10-day hard cap — never trust client
    if (tripData.usableDays > 10) {
      return res.status(400).json({ error: 'Trips are capped at 10 days maximum.' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' });
    }

    console.log(`\n🌍 Generating trip to ${tripData.destination} (${tripData.moodOverride || tripData.personaKey})`);

    const prompt = buildPrompt(tripData);
    const t1 = Date.now();

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 5000,
        system:     'You are a world-class travel planner API. Respond only with valid JSON. Never explain yourself. Never add commentary outside the JSON.',
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json();
      console.error('Anthropic error:', err);
      return res.status(502).json({ error: 'Claude API error', detail: err });
    }

    const anthropicData = await anthropicRes.json();
    const raw     = anthropicData.content?.[0]?.text || '';
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let itinerary;
    try {
      itinerary = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed — retrying once...\n', cleaned.slice(0, 200));

      // silent retry with stricter JSON instruction
      const retryRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 5000,
          system: 'You are a travel planner API. Respond ONLY with valid JSON. Start with { and end with }. No other text whatsoever.',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const retryData   = await retryRes.json();
      const retryRaw    = retryData.content?.[0]?.text || '';
      const retryCleaned = retryRaw.replace(/\`\`\`json|\`\`\`/g, '').trim();

      try {
        itinerary = JSON.parse(retryCleaned);
        console.log('✅ Retry succeeded');
      } catch {
        console.error('Retry also failed');
        return res.status(500).json({ error: 'Failed to parse itinerary JSON after retry' });
      }
    }

    if (!itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
      return res.status(500).json({ error: 'Itinerary missing days array' });
    }

    console.log(`⏱  Claude took ${Date.now() - t1}ms | input: ${anthropicData.usage?.input_tokens} tokens | output: ${anthropicData.usage?.output_tokens} tokens`);

    // validate stops against Google Places API
    const t2 = Date.now();
    console.log(`🔍 Validating stops for ${tripData.destination}...`);
    itinerary = await validateItineraryStops(itinerary, tripData.destination);
    console.log(`⏱  Places validation took ${Date.now() - t2}ms`);

    console.log(`✅ Generated ${itinerary.days.length} days for ${tripData.destination}`);
    res.json({ itinerary });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// ─── timezone lookup ──────────────────────────────────────────────────────────
app.post('/timezone', async (req, res) => {
  try {
    const { placeId } = req.body;
    if (!placeId || !PLACES_KEY) return res.json({ timezone: 'UTC' });

    const detailsUrl  = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${PLACES_KEY}`;
    const detailsData = await (await fetch(detailsUrl)).json();
    if (detailsData.status !== 'OK') return res.json({ timezone: 'UTC' });

    const { lat, lng } = detailsData.result.geometry.location;
    const tzUrl  = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now()/1000)}&key=${PLACES_KEY}`;
    const tzData = await (await fetch(tzUrl)).json();

    const timezone = tzData.status === 'OK' ? tzData.timeZoneId : 'UTC';
    console.log(`🕐 Timezone: ${timezone}`);
    res.json({ timezone });
  } catch (err) {
    res.json({ timezone: 'UTC' });
  }
});

// ─── google places validation ────────────────────────────────────────────────
async function validateStopWithPlaces(stopName, destination) {
  if (!PLACES_KEY) return true; // skip validation if no key
  try {
    const query = encodeURIComponent(`${stopName} ${destination}`);
    const url   = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
      `?input=${query}&inputtype=textquery&fields=name,place_id&key=${PLACES_KEY}`;
    const res  = await fetch(url);
    const data = await res.json();
    return data.status === 'OK' && data.candidates && data.candidates.length > 0;
  } catch {
    return true; // on error, don't block — assume valid
  }
}

async function findVerifiedAlternative(category, destination) {
  // search for a real verified place matching the category in the destination
  const categoryQueries = {
    food:          'best restaurant',
    cafe:          'popular cafe coffee shop',
    bar:           'popular bar',
    sight:         'top attraction tourist sight',
    activity:      'popular activity',
    neighbourhood: 'popular neighbourhood area',
    rest:          null, // never replace rest stops
  };
  const query = categoryQueries[category];
  if (!query || !PLACES_KEY) return null;

  try {
    const input = encodeURIComponent(`${query} in ${destination}`);
    const url   = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
      `?input=${input}&inputtype=textquery&fields=name,place_id&key=${PLACES_KEY}`;
    const data  = await (await fetch(url)).json();
    if (data.status === 'OK' && data.candidates?.length > 0) {
      return data.candidates[0].name;
    }
  } catch {}
  return null;
}

async function validateItineraryStops(itinerary, destination) {
  // collect all stops with their day + index for targeted replacement
  const toValidate = [];
  for (const day of itinerary.days) {
    if (!day.stops || day.stops.length === 0) continue;
    for (let i = 0; i < day.stops.length; i++) {
      const stop = day.stops[i];
      if (stop.category !== 'rest') {
        toValidate.push({ stop, day, index: i });
      }
    }
  }

  // validate all in parallel
  const results = await Promise.all(
    toValidate.map(({ stop }) => validateStopWithPlaces(stop.name, destination))
  );

  // for failed stops, find verified alternatives in parallel
  const replacements = await Promise.all(
    toValidate.map(({ stop }, i) =>
      results[i] ? Promise.resolve(null) : findVerifiedAlternative(stop.category, destination)
    )
  );

  let swapCount = 0;
  toValidate.forEach(({ stop, day, index }, i) => {
    if (!results[i]) {
      const alt = replacements[i];
      if (alt) {
        console.log(`  🔄 Swapped "${stop.name}" → "${alt}"`);
        day.stops[index].name = alt;
        swapCount++;
      } else {
        // no alternative found — remove the stop entirely
        console.log(`  ❌ Removed unverifiable stop: ${stop.name}`);
        day.stops.splice(index, 1);
      }
    }
  });

  if (swapCount > 0) console.log(`  ✅ Swapped ${swapCount} unverified stops`);
  return itinerary;
}

// ─── persona description route ────────────────────────────────────────────────
app.post('/persona-description', async (req, res) => {
  try {
    const { primary, secondary } = req.body;
    if (!primary) return res.status(400).json({ error: 'Missing primary persona' });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set' });

    const PERSONA_NAMES = {
      lazy_gourmet:       'The Lazy Gourmet',
      efficient_explorer: 'The Efficient Explorer',
      vibe_chaser:        'The Vibe Chaser',
      culture_vulture:    'The Culture Vulture',
      slow_traveller:     'The Slow Traveller',
    };

    const PERSONA_TRAITS = {
      lazy_gourmet:       'loves incredible food, comfortable pacing, and never rushing',
      efficient_explorer: 'wants to see everything, optimises routes, and loves a packed schedule',
      vibe_chaser:        'chases nightlife, atmosphere, and the electric energy of a city',
      culture_vulture:    'craves history, art, museums and meaningful cultural depth',
      slow_traveller:     'inhabits places slowly, wanders without plans, and values stillness',
    };

    const primaryName   = PERSONA_NAMES[primary]   || primary;
    const secondaryName = secondary ? PERSONA_NAMES[secondary] : null;
    const primaryTraits = PERSONA_TRAITS[primary]   || '';

    const prompt = `You are writing a short, warm, first-person persona description for a travel app.

The user's primary travel persona is: ${primaryName}
${secondaryName ? `Their secondary persona is: ${secondaryName}` : ''}
Primary traits: ${primaryTraits}

Write EXACTLY 2 sentences (no more, no less):
- Sentence 1: Describe who they are as a traveller in a warm, specific, second-person voice ("You're the kind of traveller who...")
- Sentence 2: ${secondaryName ? `Acknowledge their secondary ${secondaryName} streak in a natural way` : 'Describe what their ideal trip feels like'}

Rules:
- Max 35 words total
- Warm and personal, not generic
- Never mention the persona name directly
- No quotes, no preamble, just the 2 sentences`;

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 120,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json();
      return res.status(502).json({ error: 'Claude API error', detail: err });
    }

    const data        = await anthropicRes.json();
    const description = data.content?.[0]?.text?.trim() || '';

    console.log(`✅ Persona description generated for ${primaryName}`);
    res.json({ description });

  } catch (err) {
    console.error('Persona description error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 WanderSoul server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Generate:     http://localhost:${PORT}/generate\n`);
});