/**
 * AI Incident Classifier
 * Keyword-based NLP classifier that predicts emergency type from description text.
 * Returns { type, confidence, reason }
 */

const KEYWORDS = {
  police: {
    words: [
      'theft', 'stolen', 'robbery', 'robbed', 'attack', 'attacked', 'assault',
      'fight', 'fighting', 'violence', 'violent', 'weapon', 'gun', 'knife',
      'murder', 'kidnap', 'kidnapped', 'missing', 'lost', 'suspicious',
      'crime', 'criminal', 'danger', 'threat', 'threatened', 'harass',
      'harassment', 'rape', 'molest', 'stalker', 'stalking', 'police',
      'security', 'arrest', 'drug', 'drugs', 'drunk', 'accident', 'hit'
    ],
    weight: 1
  },
  ambulance: {
    words: [
      'heart', 'chest', 'pain', 'breathing', 'breath', 'unconscious',
      'fainted', 'faint', 'collapse', 'collapsed', 'bleeding', 'blood',
      'injury', 'injured', 'broken', 'fracture', 'seizure', 'stroke',
      'diabetic', 'allergic', 'allergy', 'poison', 'poisoned', 'overdose',
      'sick', 'ill', 'vomit', 'pregnant', 'labor', 'birth', 'baby',
      'medical', 'hospital', 'ambulance', 'doctor', 'hurt', 'wound',
      'wounded', 'burn', 'burns', 'head', 'dizzy', 'dizziness', 'fever',
      'choking', 'choke', 'drowning', 'drown', 'fall', 'fell', 'dead'
    ],
    weight: 1
  },
  fire: {
    words: [
      'fire', 'burning', 'burn', 'smoke', 'flames', 'flame', 'explosion',
      'explode', 'exploded', 'blast', 'gas', 'leak', 'leaking', 'chemical',
      'hazard', 'toxic', 'fumes', 'trapped', 'rescue', 'building',
      'house', 'car fire', 'vehicle fire', 'forest fire', 'wildfire',
      'electrical', 'short circuit', 'sparks', 'ignite', 'ignited'
    ],
    weight: 1
  }
};

/**
 * Classify emergency type from text description
 * @param {string} text - User's description of the emergency
 * @returns {{ type: string, confidence: number, reason: string }}
 */
export function classifyEmergency(text) {
  if (!text || text.trim().length < 3) {
    return { type: null, confidence: 0, reason: 'No description provided' };
  }

  const lower = text.toLowerCase();
  const scores = { police: 0, ambulance: 0, fire: 0 };

  for (const [type, config] of Object.entries(KEYWORDS)) {
    for (const word of config.words) {
      if (lower.includes(word)) {
        scores[type] += config.weight;
      }
    }
  }

  const total = scores.police + scores.ambulance + scores.fire;

  if (total === 0) {
    return { type: null, confidence: 0, reason: 'Could not determine type from description' };
  }

  // Find highest scoring type
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const [type, score] = best;
  const confidence = Math.round((score / total) * 100);

  const typeLabels = { police: 'Police', ambulance: 'Ambulance', fire: 'Fire Service' };
  const reason = `Detected ${score} ${type}-related keyword${score > 1 ? 's' : ''} in your description`;

  return { type, confidence, reason, label: typeLabels[type] };
}

/**
 * Get suggested type with a minimum confidence threshold
 * Returns null if confidence is too low to be reliable
 */
export function getSuggestedType(text, minConfidence = 40) {
  const result = classifyEmergency(text);
  if (result.confidence >= minConfidence) return result;
  return { type: null, confidence: result.confidence, reason: 'Description unclear — please select manually' };
}
