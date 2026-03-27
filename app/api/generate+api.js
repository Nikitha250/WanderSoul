// app/api/generate+api.js
// Expo API Route — server-side only, never exposed to the client
// Sits between the app and the Anthropic API so the API key stays safe

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

// ─── prompt builder ───────────────────────────────────────────────────────────
function buildPrompt(tripData) {
  const {
    destination, personaKey, moodOverride,
    effectiveArrival, effectiveDeparture,
    arrivalMode, usableDays, totalDays,
    partySize, budget, isLastMinute, isInternational,
  } = tripData;

  const activePersona = moodOverride || personaKey;

  const PERSONA_DESCRIPTIONS = {
    lazy_gourmet:       'a foodie who prioritises incredible meals and comfortable, relaxed experiences. They avoid packed schedules — quality over quantity. Every day should have at least one outstanding food experience and plenty of breathing room.',
    efficient_explorer: 'someone who wants to see as much as possible in the time available. They appreciate well-optimised routes, back-to-back sights, and minimal time wasted on transport. Dense, packed days are a feature, not a bug.',
    vibe_chaser:        'someone chasing atmosphere, energy and nightlife. They want to find where locals actually go, discover rooftop bars, live music, street food scenes, and the electric parts of the city. Mornings can be slow — evenings are everything.',
    culture_vulture:    'deeply interested in history, art, architecture and local stories. They want museums, galleries, historical neighbourhoods, guided contexts and meaningful experiences over tourist traps.',
    slow_traveller:     'someone who wants to slow down and actually inhabit a place. Long mornings, one or two things per day, sitting in a square with a coffee, wandering without a plan. Less is genuinely more.',
  };

  const arrivalNote = arrivalMode === 'rest'
    ? 'The traveller arrives late — Day 1 should have NO activities, just hotel check-in and rest. Itinerary starts properly from Day 2.'
    : arrivalMode === 'vibe_night'
    ? 'The traveller arrives and wants to go straight out — suggest an evening spot for Day 1 arrival night.'
    : 'The traveller arrives with some usable time on Day 1.';

  const urgencyNote = isLastMinute
    ? 'This is a last-minute trip (within 48 hours). Avoid suggestions that require advance booking.'
    : '';

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
- International trip: ${isInternational ? 'Yes' : 'No'}

ARRIVAL NOTE: ${arrivalNote}
${urgencyNote}

CRITICAL INSTRUCTIONS:
1. Respond ONLY with valid JSON — no preamble, no explanation, no markdown
2. Generate exactly ${usableDays} days of activities
3. Each day should have 2–5 stops depending on the persona (efficient_explorer gets more, slow_traveller gets fewer)
4. Every stop must have a real place name that exists in ${destination}
5. Tailor descriptions to the persona's voice and priorities
6. Budget context: ${budget === 'backpacker' ? 'hostels, street food, free sights' : budget === 'luxury' ? 'five-star hotels, fine dining, private experiences' : 'boutique hotels, sit-down restaurants, paid attractions'}

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
          "tip": "one insider tip or practical note"
        }
      ]
    }
  ],
  "closing_note": "a warm 1-2 sentence sign-off in the persona's voice"
}`;
}

// ─── route handler ────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const { tripData } = await request.json();

    if (!tripData) {
      return Response.json({ error: 'Missing tripData' }, { status: 400 });
    }

    if (!ANTHROPIC_KEY) {
      return Response.json({ error: 'Anthropic API key not configured' }, { status: 500 });
    }

    const prompt = buildPrompt(tripData);

    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':         'application/json',
        'x-api-key':            ANTHROPIC_KEY,
        'anthropic-version':    '2023-06-01',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!anthropicRes.ok) {
      const err = await anthropicRes.json();
      console.error('Anthropic error:', err);
      return Response.json({ error: 'Claude API error', detail: err }, { status: 502 });
    }

    const anthropicData = await anthropicRes.json();
    const raw = anthropicData.content?.[0]?.text || '';

    // strip any accidental markdown fences
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let itinerary;
    try {
      itinerary = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed:', cleaned.slice(0, 300));
      return Response.json({ error: 'Failed to parse itinerary JSON' }, { status: 500 });
    }

    // basic validation
    if (!itinerary.days || !Array.isArray(itinerary.days) || itinerary.days.length === 0) {
      return Response.json({ error: 'Itinerary missing days array' }, { status: 500 });
    }

    return Response.json({ itinerary });

  } catch (err) {
    console.error('Generate route error:', err);
    return Response.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}