// Lightweight, fully-explainable "AI assist" for the Villager Mode request
// flow. Deliberately rule-based (keyword matching) rather than a real LLM
// call — no API key needed, runs instantly offline, and every suggestion
// can be traced back to the exact words that triggered it. This mirrors
// the same "no fake AI" principle the optimizer already follows: it's a
// transparent assistant, not a black box.

const CATEGORY_KEYWORDS = {
  road: [
    'road', 'street', 'path', 'pothole', 'mud', 'muddy', 'broken road',
    'corridor', 'bridge', 'sadak', 'rasta', 'lane', 'track', 'walk',
    'walking', 'commute', 'travel time', 'bus stop',
  ],
  water: [
    'water', 'drinking water', 'hand pump', 'handpump', 'tap', 'well',
    'tubewell', 'tube well', 'paani', 'dry', 'no water', 'ro', 'borewell',
    'bore well', 'thirsty', 'clean water',
  ],
  drainage: [
    'drain', 'drainage', 'flood', 'flooding', 'waterlog', 'waterlogging',
    'sewage', 'gutter', 'naali', 'monsoon', 'overflow', 'stagnant',
    'rain water', 'rainwater', 'sewer',
  ],
  electricity: [
    'electricity', 'power', 'light', 'streetlight', 'street light',
    'transformer', 'bijli', 'current', 'outage', 'voltage', 'dark at night',
    'no lights',
  ],
  school: [
    'school', 'teacher', 'classroom', 'students', 'education', 'vidyalaya',
    'anganwadi', 'children', 'kids study', 'exam',
  ],
  health: [
    'hospital', 'clinic', 'doctor', 'health', 'medicine', 'sub-centre',
    'sub centre', 'ambulance', 'dawakhana', 'sick', 'nurse', 'pregnant',
  ],
};

const URGENT_KEYWORDS = [
  'urgent', 'emergency', 'danger', 'dangerous', 'accident', 'collapsed',
  'collapse', 'severe', 'no water', 'flooded', 'flooding', 'unsafe',
  'injured', 'child fell', 'every day', 'every monsoon', 'months',
];

/**
 * Classify free-text describing a village problem/request.
 * Returns { categoryId, confidence, matchedKeywords, suggestedTitle, suggestedPriority }
 */
export function classifyRequest(text) {
  const lower = (text || '').toLowerCase();

  let bestCategory = 'other';
  let bestScore = 0;
  let bestMatches = [];

  for (const [categoryId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter((kw) => lower.includes(kw));
    if (matches.length > bestScore) {
      bestScore = matches.length;
      bestCategory = categoryId;
      bestMatches = matches;
    }
  }

  const confidence = bestScore === 0 ? 'low' : bestScore === 1 ? 'medium' : 'high';

  const urgentHit = URGENT_KEYWORDS.some((kw) => lower.includes(kw));
  const suggestedPriority = urgentHit ? 'high' : 'medium';

  // Draft a short, clean title from what they typed.
  const trimmed = (text || '').trim().replace(/\s+/g, ' ');
  const words = trimmed.split(' ');
  const suggestedTitle =
    words.length <= 10
      ? capitalize(trimmed)
      : capitalize(words.slice(0, 10).join(' ')) + '…';

  return {
    categoryId: bestCategory,
    confidence,
    matchedKeywords: bestMatches,
    suggestedTitle: suggestedTitle || 'Village request',
    suggestedPriority,
  };
}

function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
