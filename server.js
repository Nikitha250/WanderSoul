// server.js — WanderSoul backend proxy
// Run this in a second terminal: node server.js
// Keeps the Anthropic API key off the device

const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = 8082;

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
  } = tripData;

  const activePersona = moodOverride || personaKey;

  const PERSONA_DESCRIPTIONS = {
    lazy_gourmet:
      'a foodie who prioritises incredible meals and comfortable, relaxed experiences. They avoid packed schedules — quality over quantity. Every day should have at least one outstanding food experience and plenty of breathing room.',
    efficient_explorer:
      'someone who wants to see as much as possible in the time available. They appreciate well-optimised routes, back-to-back sights, and minimal time wasted on transport. Dense, packed days are a feature, not a bug.',
    vibe_chaser:
      'someone chasing atmosphere, energy and nightlife. They want to find where locals actually go, discover rooftop bars, live music, street food scenes, and the electric parts of the city. Mornings can be slow — evenings are everything.',
    culture_vulture:
      'deeply interested in history, art, architecture and local stories. They want museums, galleries, historical neighbourhoods, guided contexts and meaningful experiences over tourist traps.',
    slow_traveller:
      'someone who wants to slow down and actually inhabit a place. Long mornings, one or two things per day, sitting in a square with a coffee, wandering without a plan. Less is genuinely more.',
  };

  const arrivalNote =
    arrivalMode === 'rest'
      ? 'The traveller arrives late. Day 1 must contain ZERO stops — not even hotel check-in. Return an empty stops array [] for Day 1 with title "Arrival" and theme "Rest". The itinerary activities begin on Day 2.'
      : arrivalMode === 'vibe_night'
      ? 'The traveller arrives and wants to go straight out — suggest one evening bar or restaurant for Day 1 arrival night only.'
      : 'The traveller arrives with some usable time on Day 1. Suggest 1-2 light stops only.';

  const urgencyNote = isLastMinute
    ? 'This is a last-minute trip (within 48 hours). Avoid suggestions that require advance booking.'
    : '';

  const budgetNote =
    budget === 'backpacker'
      ? 'hostels, street food, free sights'
      : budget === 'luxury'
      ? 'five-star hotels, fine dining, private experiences'
      : 'boutique hotels, sit-down restaurants, paid attractions';

  return `You are a world-class travel planner. Create a detailed, personality-driven itinerary for the following trip.

TRAVELLER PERSONA: ${activePersona.replace(/_/g, ' ').toUpperCase()}
The traveller is ${PERSONA_DESCRIPTIONS[activePersona]}

TRIP DETAILS:
- Destination: ${destination}
- Effective arrival (after airport buffer): ${new Date(effectiveArrival).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
- Effective departure (before airport buffer): ${new Date(effectiveDeparture).toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' })}
- Usable days: ${usableDays} (total trip: ${totalDays} days)
- Party size: ${partySize} ${partySize === 1 ? 'person' : 'people'}
- Budget level: ${budget}

ARRIVAL NOTE: ${arrivalNote}
${urgencyNote}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON — no preamble, no explanation, no markdown backticks
2. Generate exactly ${usableDays} days of activities
3. NEVER include hotels, accommodation, check-in or check-out in any stop — hotels are handled separately
4. Each day should have 2–5 stops depending on the persona (efficient_explorer gets more, slow_traveller gets fewer)
5. Every stop must have a real place name that exists in ${destination}
6. Tailor descriptions to the persona's voice and priorities
7. Budget context: ${budgetNote}

Respond with this exact JSON structure:
{
  "destination": "${destination}",
  "persona": "${activePersona}",
  "tagline": "a one-line trip summary in the persona's voice (max 12 words)",
  "days": [
    {
      "day": 1,
      "title": "short evocative day title",
      "theme": "one-word theme e.g. Arrival / Food / Culture / Explore / Unwind",
      "stops": [
        {
          "time": "HH:MM",
          "name": "Place Name",
          "category": "one of: food | sight | cafe | bar | activity | neighbourhood | rest",
          "duration": "e.g. 1.5 hrs",
          "description": "2-3 sentences in the persona's voice explaining why this stop and what to do/eat/see",
          "tip": "one insider tip or practical note",
          "cost": "estimated cost per person e.g. Free, $10-15, $30+"
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

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'ANTHROPIC_API_KEY not set in .env' });
    }

    console.log(`\n🌍 Generating trip to ${tripData.destination} (${tripData.moodOverride || tripData.personaKey})`);

    const prompt = buildPrompt(tripData);

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 4000,
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
      console.error('JSON parse failed. Raw output:\n', cleaned.slice(0, 500));
      return res.status(500).json({ error: 'Failed to parse itinerary JSON' });
    }

    if (!itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
      return res.status(500).json({ error: 'Itinerary missing days array' });
    }

    console.log(`✅ Generated ${itinerary.days.length} days for ${tripData.destination}`);
    res.json({ itinerary });

  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Unknown error' });
  }
});

// ─── start ────────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 WanderSoul server running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Generate:     http://localhost:${PORT}/generate\n`);
});