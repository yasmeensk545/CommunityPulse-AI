/**
 * CommunityPulse AI - Civic Duplicate Report Detection Engine
 * 
 * Compares incoming reports against existing community issues using:
 * 1. Category identity
 * 2. Normalized locality & geospatial token overlap
 * 3. Textual Jaccard & keyword set similarity
 * 
 * Never merges or deletes reports automatically.
 */

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'over', 'after', 'beneath', 'under',
  'above', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
  'had', 'do', 'does', 'did', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'it', 'its', 'this', 'that', 'these', 'those', 'there', 'here',
  'very', 'just', 'so', 'too', 'can', 'will', 'just', 'should', 'now', 'our',
  'we', 'i', 'my', 'me', 'they', 'them', 'their'
]);

const LOCATION_NOISE = new Set([
  'street', 'st', 'avenue', 'ave', 'road', 'rd', 'lane', 'ln', 'boulevard',
  'blvd', 'drive', 'dr', 'court', 'ct', 'place', 'pl', 'way', 'square', 'sq',
  'corner', 'near', 'junction', 'intersection', 'across', 'behind', 'front',
  'block', 'district', 'area', 'zone'
]);

/**
 * Normalizes text to a clean token array
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Normalizes locality tokens stripping street designator noise
 */
function normalizeLocality(loc) {
  if (!loc) return [];
  return loc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !LOCATION_NOISE.has(w) && !STOP_WORDS.has(w));
}

/**
 * Computes Jaccard index between two sets of tokens (0 to 1)
 */
function jaccardSimilarity(tokensA, tokensB) {
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  
  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) intersectionCount++;
  }
  
  const unionCount = new Set([...setA, ...setB]).size;
  return unionCount === 0 ? 0 : intersectionCount / unionCount;
}

/**
 * Evaluates duplicate probability of a candidate against a list of existing reports
 * 
 * @param {Object} candidate - { title, description, category, locality }
 * @param {Array} existingReports - Array of existing report records
 * @param {number} threshold - Match threshold percentage (default: 45)
 */
export function checkDuplicate(candidate, existingReports = [], threshold = 45) {
  if (!candidate || !Array.isArray(existingReports) || existingReports.length === 0) {
    return {
      isDuplicate: false,
      matchScore: 0,
      matchingReport: null,
      reasons: []
    };
  }

  const candidateDescTokens = tokenize(`${candidate.title || ''} ${candidate.description || ''}`);
  const candidateLocTokens = normalizeLocality(candidate.locality || '');

  let highestScore = 0;
  let bestMatch = null;
  let bestReasons = [];

  for (const existing of existingReports) {
    // Skip if comparing to itself (in case of edit)
    if (candidate.id && existing.id === candidate.id) continue;

    let score = 0;
    const reasons = [];

    // 1. Category Matching (25 pts max)
    if (candidate.category && existing.category && candidate.category === existing.category) {
      score += 25;
      reasons.push(`Identical civic category: "${candidate.category}"`);
    } else if (candidate.category === 'Other' || existing.category === 'Other') {
      score += 10;
    }

    // 2. Locality Matching (35 pts max)
    const existingLocTokens = normalizeLocality(existing.locality || '');
    const locSimilarity = jaccardSimilarity(candidateLocTokens, existingLocTokens);

    if (locSimilarity >= 0.6) {
      score += 35;
      reasons.push(`Strong locality match: "${existing.locality}" vs "${candidate.locality}"`);
    } else if (locSimilarity >= 0.3) {
      score += 22;
      reasons.push(`Proximity match: shared neighborhood indicators in "${existing.locality}"`);
    } else {
      // Check for substring containment
      const normCandLoc = (candidate.locality || '').toLowerCase().trim();
      const normExistLoc = (existing.locality || '').toLowerCase().trim();
      if (normCandLoc && normExistLoc && (normCandLoc.includes(normExistLoc) || normExistLoc.includes(normCandLoc))) {
        score += 28;
        reasons.push(`Direct locality overlap with "${existing.locality}"`);
      }
    }

    // 3. Textual / Description Similarity (40 pts max)
    const existingDescTokens = tokenize(`${existing.title || ''} ${existing.description || ''}`);
    const textSimilarity = jaccardSimilarity(candidateDescTokens, existingDescTokens);

    if (textSimilarity >= 0.45) {
      score += 40;
      reasons.push(`High content similarity (${Math.round(textSimilarity * 100)}% keyword overlap in description)`);
    } else if (textSimilarity >= 0.25) {
      score += 25;
      reasons.push(`Moderate descriptive similarity (${Math.round(textSimilarity * 100)}% keyword overlap)`);
    } else if (textSimilarity >= 0.15) {
      score += 12;
    }

    // Bonus: Check if existing report was filed recently (< 7 days)
    const reportedDaysAgo = (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (reportedDaysAgo <= 7 && score >= 35) {
      score = Math.min(100, score + 8);
      reasons.push(`Temporal proximity: matching issue was reported within the last ${Math.max(1, Math.round(reportedDaysAgo))} days`);
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = existing;
      bestReasons = reasons;
    }
  }

  const isDuplicate = highestScore >= threshold;

  return {
    isDuplicate,
    matchScore: Math.round(highestScore),
    matchingReport: isDuplicate ? bestMatch : null,
    reasons: isDuplicate ? bestReasons : []
  };
}
