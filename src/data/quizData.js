export const QUIZ_QUESTIONS = [

  // ── LAZY GOURMET (3 questions) ──
  {
    id: 'lg_1',
    group: 'lazy_gourmet',
    question: "It's 8am and you just landed. What's the first thing you do?",
    answers: [
      { text: "Check in, nap, ease into the day", persona: "lazy_gourmet" },
      { text: "Grab a slow coffee and wander", persona: "slow_traveller" },
      { text: "Drop bags and head to the first landmark", persona: "efficient_explorer" },
    ],
  },
  {
    id: 'lg_2',
    group: 'lazy_gourmet',
    question: "Your perfect travel afternoon looks like...",
    answers: [
      { text: "A long lunch that turns into dinner somehow", persona: "lazy_gourmet" },
      { text: "Ticking off three must-see spots back to back", persona: "efficient_explorer" },
      { text: "Stumbling into a neighbourhood nobody told me about", persona: "slow_traveller" },
    ],
  },
  {
    id: 'lg_3',
    group: 'lazy_gourmet',
    question: "How do you think about your travel budget?",
    answers: [
      { text: "Treat yourself — you only live once", persona: "lazy_gourmet" },
      { text: "Balance it — splurge on what matters", persona: "culture_vulture" },
      { text: "Stretch every dollar — the constraint IS the adventure", persona: "slow_traveller" },
    ],
  },

  // ── EFFICIENT EXPLORER (3 questions) ──
  {
    id: 'ee_1',
    group: 'efficient_explorer',
    question: "Your ideal travel day looks like...",
    answers: [
      { text: "5+ places — keep moving, maximise everything", persona: "efficient_explorer" },
      { text: "2 places, done slowly and properly", persona: "culture_vulture" },
      { text: "No plan — see where the day takes me", persona: "vibe_chaser" },
    ],
  },
  {
    id: 'ee_2',
    group: 'efficient_explorer',
    question: "A new city has 48 hours to impress you. You...",
    answers: [
      { text: "Have a colour-coded itinerary ready to go", persona: "efficient_explorer" },
      { text: "Have one reservation and figure the rest out", persona: "lazy_gourmet" },
      { text: "Ask a local what they'd do and follow that", persona: "slow_traveller" },
    ],
  },
  {
    id: 'ee_3',
    group: 'efficient_explorer',
    question: "There's a 2-hour queue for the most famous thing in the city. You...",
    answers: [
      { text: "Queue — it's famous for a reason", persona: "efficient_explorer" },
      { text: "Skip it and find somewhere equally interesting nearby", persona: "slow_traveller" },
      { text: "Book skip-the-line in advance — obviously", persona: "lazy_gourmet" },
    ],
  },

  // ── VIBE CHASER (3 questions) ──
  {
    id: 'vc_1',
    group: 'vibe_chaser',
    question: "Evenings on a trip are for...",
    answers: [
      { text: "Exploring — bars, people, whatever's happening", persona: "vibe_chaser" },
      { text: "Early dinner, good wine, early night", persona: "lazy_gourmet" },
      { text: "Whatever feels right in the moment", persona: "slow_traveller" },
    ],
  },
  {
    id: 'vc_2',
    group: 'vibe_chaser',
    question: "Your travel highlight reel is mostly...",
    answers: [
      { text: "Nights out, rooftops, people you met at 2am", persona: "vibe_chaser" },
      { text: "Meals that took three hours and felt like an event", persona: "lazy_gourmet" },
      { text: "A quiet morning in a café nobody else knew about", persona: "slow_traveller" },
    ],
  },
  {
    id: 'vc_3',
    group: 'vibe_chaser',
    question: "A friend says 'let's change the plan completely'. You feel...",
    answers: [
      { text: "Excited — the best things are never planned", persona: "vibe_chaser" },
      { text: "Fine, as long as there's still a good dinner", persona: "lazy_gourmet" },
      { text: "Slightly annoyed — I had the perfect day mapped out", persona: "efficient_explorer" },
    ],
  },

  // ── CULTURE VULTURE (3 questions) ──
  {
    id: 'cv_1',
    group: 'culture_vulture',
    question: "If you had to miss one, you'd skip...",
    answers: [
      { text: "A famous museum — I can look it up online", persona: "lazy_gourmet" },
      { text: "A great local restaurant everyone's raving about", persona: "efficient_explorer" },
      { text: "A buzzing rooftop bar", persona: "culture_vulture" },
    ],
  },
  {
    id: 'cv_2',
    group: 'culture_vulture',
    question: "You're at a historic site. You...",
    answers: [
      { text: "Read every plaque and hire a guide if possible", persona: "culture_vulture" },
      { text: "Take photos and move on to the next one", persona: "efficient_explorer" },
      { text: "Sit somewhere quiet and just absorb the atmosphere", persona: "slow_traveller" },
    ],
  },
  {
    id: 'cv_3',
    group: 'culture_vulture',
    question: "The best souvenir is...",
    answers: [
      { text: "A book about the city's history or art scene", persona: "culture_vulture" },
      { text: "A local ingredient or dish I can recreate at home", persona: "lazy_gourmet" },
      { text: "A photo of a moment — I don't need stuff", persona: "vibe_chaser" },
    ],
  },

  // ── SLOW TRAVELLER (3 questions) ──
  {
    id: 'st_1',
    group: 'slow_traveller',
    question: "Your favourite travel memory is probably...",
    answers: [
      { text: "Getting genuinely lost and finding something magical", persona: "slow_traveller" },
      { text: "The meal that still comes up in conversation years later", persona: "lazy_gourmet" },
      { text: "The day you fit in more than seemed humanly possible", persona: "efficient_explorer" },
    ],
  },
  {
    id: 'st_2',
    group: 'slow_traveller',
    question: "A 'successful' trip means...",
    answers: [
      { text: "Feeling like a local by the end of it", persona: "slow_traveller" },
      { text: "Seeing everything on the list", persona: "efficient_explorer" },
      { text: "Having at least one transcendent meal", persona: "lazy_gourmet" },
    ],
  },
  {
    id: 'st_3',
    group: 'slow_traveller',
    question: "You have a free unplanned morning. You...",
    answers: [
      { text: "Walk with no destination and see what appears", persona: "slow_traveller" },
      { text: "Find the best-reviewed breakfast spot nearby", persona: "lazy_gourmet" },
      { text: "Immediately find something to fill it", persona: "efficient_explorer" },
    ],
  },
];

export const PERSONAS = {
  lazy_gourmet: {
    key: 'lazy_gourmet',
    name: 'The Lazy Gourmet',
    tagline: 'Foodie · slow pace · comfort-first',
    color: '#1A936F',
    description: 'You travel to savour, not sprint. Every stop should feel like a reward.',
  },
  efficient_explorer: {
    key: 'efficient_explorer',
    name: 'The Efficient Explorer',
    tagline: 'Fast pace · landmarks · max sightseeing',
    color: '#0D3D2E',
    description: 'You treat travel like a mission. More places, more stories, more done.',
  },
  vibe_chaser: {
    key: 'vibe_chaser',
    name: 'The Vibe Chaser',
    tagline: 'Nightlife · social · spontaneous energy',
    color: '#7C3AED',
    description: 'You follow the energy. The best nights are the ones nobody planned.',
  },
  culture_vulture: {
    key: 'culture_vulture',
    name: 'The Culture Vulture',
    tagline: 'Museums · history · art · depth',
    color: '#C8830A',
    description: 'You want the story behind every place. Travel is how you understand the world.',
  },
  slow_traveller: {
    key: 'slow_traveller',
    name: 'The Slow Traveller',
    tagline: 'Relaxed · local · off-beaten-path',
    color: '#4A8A78',
    description: 'You become a local wherever you go. The best discoveries take time.',
  },
};