export function selectRandomQuestions(allQuestions) {
  const groups = {};
  allQuestions.forEach(q => {
    if (!groups[q.group]) groups[q.group] = [];
    groups[q.group].push(q);
  });

  const selected = Object.values(groups).map(group => {
    const randomIndex = Math.floor(Math.random() * group.length);
    return group[randomIndex];
  });

  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}

const COMPATIBILITY = {
  lazy_gourmet:       { culture_vulture: 7, efficient_explorer: 2, vibe_chaser: 5, slow_traveller: 9 },
  culture_vulture:    { lazy_gourmet: 7, efficient_explorer: 6, vibe_chaser: 4, slow_traveller: 8 },
  efficient_explorer: { lazy_gourmet: 2, culture_vulture: 6, vibe_chaser: 7, slow_traveller: 3 },
  vibe_chaser:        { lazy_gourmet: 5, culture_vulture: 4, efficient_explorer: 7, slow_traveller: 4 },
  slow_traveller:     { lazy_gourmet: 9, culture_vulture: 8, efficient_explorer: 3, vibe_chaser: 4 },
};

export function calculatePersona(answers) {
  const scores = {
    lazy_gourmet: 0,
    efficient_explorer: 0,
    vibe_chaser: 0,
    culture_vulture: 0,
    slow_traveller: 0,
  };

  answers.forEach((persona) => {
    if (scores[persona] !== undefined) {
      scores[persona] += 1;
    }
  });

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topScore = sorted[0][1];
  const tied = sorted.filter(([, score]) => score === topScore);

  let primary, secondary;

  if (tied.length === 1) {
    primary = sorted[0][0];
    secondary = sorted[1][0];
  } else if (tied.length === 2) {
    const thirdPersona = sorted[2]?.[0];
    const [a, b] = [tied[0][0], tied[1][0]];
    if (thirdPersona && COMPATIBILITY[a] && COMPATIBILITY[b]) {
      const compatA = COMPATIBILITY[a][thirdPersona] ?? 0;
      const compatB = COMPATIBILITY[b][thirdPersona] ?? 0;
      primary = compatA >= compatB ? a : b;
      secondary = compatA >= compatB ? b : a;
    } else {
      primary = a;
      secondary = b;
    }
  } else {
    // 3+ way tie including perfect 5-way tie
    // Pick primary by highest total compatibility sum
    let bestScore = -1;
    let bestPersona = tied[0][0];
    tied.forEach(([personaKey]) => {
      const compatSum = Object.values(COMPATIBILITY[personaKey] || {})
        .reduce((sum, val) => sum + val, 0);
      if (compatSum > bestScore) {
        bestScore = compatSum;
        bestPersona = personaKey;
      }
    });
    primary = bestPersona;

    // Secondary is most compatible with primary from remaining tied personas
    const remaining = tied
      .map(([k]) => k)
      .filter(k => k !== primary)
      .sort((a, b) =>
        (COMPATIBILITY[primary][b] ?? 0) - (COMPATIBILITY[primary][a] ?? 0)
      );
    secondary = remaining[0] || sorted[1][0];
  }

  // Final safety net — should never be needed but just in case
  if (!primary) primary = sorted[0][0];
  if (!secondary) secondary = sorted[1][0];
  if (primary === secondary) secondary = sorted[1][0];

  return { primary, secondary, scores };
}