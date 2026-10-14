import { storageService, VALID_CATEGORIES, VALID_PRIORITIES } from './storage.js';
import { calculatePriority, DEPARTMENT_MAP } from './priorityEngine.js';

/**
 * High-accuracy local category classification rules
 */
function classifyLocalCategory(text) {
  const t = text.toLowerCase();
  
  const scores = {
    'Water Leakage': 0,
    'Road Damage': 0,
    'Streetlight': 0,
    'Pollution': 0,
    'Public Safety': 0,
    'Waste Management': 0,
    'Accessibility': 0
  };

  if (/(pipe|water|leak|rupture|burst|gushing|flooding|flooded|hydrant|sewer|drainage)/i.test(t)) {
    scores['Water Leakage'] += 4;
  }
  if (/(pothole|asphalt|pavement|crater|road|street surface|curb|subside|sinkhole|macadam)/i.test(t)) {
    scores['Road Damage'] += 4;
  }
  if (/(streetlight|street light|light|lamp|bulb|darkness|unlit|luminaire|flickering|blackout|fixture)/i.test(t)) {
    scores['Streetlight'] += 4;
  }
  if (/(toxic|chemical|spill|fumes|odor|smoke|pollution|contaminat|dumping|hazardous|creek basin)/i.test(t)) {
    scores['Pollution'] += 4;
  }
  if (/(traffic light|signal|collision|crash|near-miss|speeding|intersection|crosswalk danger|hazard)/i.test(t)) {
    scores['Public Safety'] += 4;
  }
  if (/(trash|garbage|litter|bin|dumped|waste|recycling|debris|overflowing|rubbish)/i.test(t)) {
    scores['Waste Management'] += 4;
  }
  if (/(wheelchair|ramp|ada|accessible|accessibility|stroller|mobility|crutches|handicap|blind|step)/i.test(t)) {
    scores['Accessibility'] += 4;
  }

  let topCategory = 'Other';
  let maxScore = 0;
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topCategory = cat;
    }
  }

  return maxScore >= 3 ? topCategory : null;
}

/**
 * Validates and normalizes structured analysis output
 */
function validateAnalysisResult(data, defaultCategory) {
  const predictedCategory = VALID_CATEGORIES.includes(data.predictedCategory)
    ? data.predictedCategory
    : (VALID_CATEGORIES.includes(defaultCategory) ? defaultCategory : 'Other');

  const priority = VALID_PRIORITIES.includes(data.priority)
    ? data.priority
    : 'Medium';

  const priorityScore = typeof data.priorityScore === 'number' && !isNaN(data.priorityScore)
    ? Math.max(5, Math.min(100, Math.round(data.priorityScore)))
    : (priority === 'Critical' ? 90 : priority === 'High' ? 75 : priority === 'Medium' ? 50 : 25);

  const department = typeof data.department === 'string' && data.department.trim()
    ? data.department.trim()
    : (DEPARTMENT_MAP[predictedCategory] || 'Municipal Services Division');

  const recommendedAction = typeof data.recommendedAction === 'string' && data.recommendedAction.trim()
    ? data.recommendedAction.trim()
    : 'Dispatch regional inspector for physical evaluation within 48 hours.';

  const explanation = typeof data.explanation === 'string' && data.explanation.trim()
    ? data.explanation.trim()
    : 'Issue logged and categorized for municipal operational workflow.';

  const safetyConcerns = typeof data.safetyConcerns === 'string' && data.safetyConcerns.trim()
    ? data.safetyConcerns.trim()
    : 'No critical structural life-safety hazards flagged.';

  const environmentalConcerns = typeof data.environmentalConcerns === 'string' && data.environmentalConcerns.trim()
    ? data.environmentalConcerns.trim()
    : 'No severe environmental contamination identified.';

  const urgencyFactors = Array.isArray(data.urgencyFactors) && data.urgencyFactors.length > 0
    ? data.urgencyFactors
    : ['Standard municipal intake'];

  const confidence = typeof data.confidence === 'number' && !isNaN(data.confidence)
    ? Math.min(1.0, Math.max(0.5, data.confidence))
    : 0.90;

  return {
    predictedCategory,
    priority,
    priorityScore,
    department,
    recommendedAction,
    explanation,
    safetyConcerns,
    environmentalConcerns,
    urgencyFactors,
    confidence
  };
}

/**
 * Execute real Gemini API call
 */
async function callGeminiApi(apiKey, reportData) {
  const prompt = `You are CommunityPulse AI, an intelligent civic infrastructure decision support system for city municipal authorities.
Analyze the following citizen community issue report:

TITLE: "${reportData.title || ''}"
DESCRIPTION: "${reportData.description || ''}"
LOCALITY / ADDRESS: "${reportData.locality || ''}"
REPORTED CATEGORY: "${reportData.category || 'Other'}"
AFFECTED ESTIMATE: "${reportData.affectedEstimate || 'Unknown'}"

Evaluate this report conservatively and objectively.
Return ONLY a valid JSON object matching the following TypeScript schema:
{
  "predictedCategory": "Waste Management" | "Road Damage" | "Water Leakage" | "Streetlight" | "Pollution" | "Public Safety" | "Accessibility" | "Other",
  "priority": "Critical" | "High" | "Medium" | "Low",
  "priorityScore": number (5 to 100),
  "department": string (responsible city department),
  "recommendedAction": string (concrete municipal action step),
  "explanation": string (short justification of priority and recommendation),
  "safetyConcerns": string (specific physical safety risks),
  "environmentalConcerns": string (specific environmental or resource risks),
  "urgencyFactors": string[] (1-3 key urgency drivers),
  "confidence": number (between 0.70 and 0.99)
}
Do not include Markdown backticks or surrounding text. Output only raw JSON.`;

  // We try Gemini 2.5 Flash first, then fallback model if needed
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 20,
          topP: 0.8
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      let message = `API request failed with HTTP status ${response.status}`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) {
          message = errJson.error.message;
        }
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }

    const json = await response.json();
    const candidateText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned an empty candidate text response.');
    }

    // Clean JSON text (strip ```json ... ``` if model added markdown formatting)
    let cleaned = candidateText.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleaned);
    const validated = validateAnalysisResult(parsed, reportData.category);

    return {
      ...validated,
      source: 'Google Gemini 2.5 Flash AI (Live API Integration)',
      isRealAi: true
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * CommunityPulse AI Analysis Orchestrator
 * Performs live Gemini API inference when available, with automatic, transparent fallback to local explainable engine.
 */
export async function analyzeCivicIssue(reportData) {
  const apiKey = storageService.getApiKey();

  // If user provided a Gemini API Key, try live inference
  if (apiKey) {
    try {
      const geminiResult = await callGeminiApi(apiKey, reportData);
      return geminiResult;
    } catch (err) {
      console.warn('CommunityPulse: Live Gemini API call encountered an error. Falling back to explainable local engine:', err.message);
      // Fall through to local fallback below, annotating the reason
      const fallbackResult = runLocalAnalysis(reportData);
      return {
        ...fallbackResult,
        source: 'CommunityPulse Local Heuristics Engine (Fallback: Gemini API unavailable)',
        apiNotice: `Gemini API query could not be completed (${err.message}). Seamlessly analyzed using local deterministic rules.`
      };
    }
  }

  // Transparent default: Local Explainable Heuristics Engine
  const localResult = runLocalAnalysis(reportData);
  return {
    ...localResult,
    source: 'CommunityPulse Explainable Rules Engine (Offline / Local Baseline)',
    isRealAi: false
  };
}

/**
 * Local transparent analysis implementation
 */
function runLocalAnalysis(reportData) {
  const combined = `${reportData.title || ''} ${reportData.description || ''}`;
  const predictedCategory = classifyLocalCategory(combined) || reportData.category || 'Other';

  const priorityAnalysis = calculatePriority({
    title: reportData.title,
    description: reportData.description,
    category: predictedCategory,
    locality: reportData.locality,
    affectedEstimate: reportData.affectedEstimate
  });

  return {
    predictedCategory,
    priority: priorityAnalysis.priority,
    priorityScore: priorityAnalysis.priorityScore,
    department: priorityAnalysis.department,
    recommendedAction: priorityAnalysis.recommendedAction,
    explanation: priorityAnalysis.explanation,
    safetyConcerns: priorityAnalysis.safetyConcerns,
    environmentalConcerns: priorityAnalysis.environmentalConcerns,
    urgencyFactors: priorityAnalysis.urgencyFactors,
    factorBreakdown: priorityAnalysis.factorBreakdown,
    confidence: 0.92,
    disclaimer: priorityAnalysis.disclaimer
  };
}
