/**
 * CommunityPulse AI - Explainable Multi-Factor Prioritization Engine
 * 
 * Scores civic issues from 0 to 100 based on 5 transparent civic risk dimensions:
 * 1. Potential Safety Risk (0-30 pts)
 * 2. Community & Population Impact (0-25 pts)
 * 3. Environmental Impact (0-20 pts)
 * 4. Issue Duration & Escalation (0-15 pts)
 * 5. Textual Urgency Indicators (0-10 pts)
 */

export const DEPARTMENT_MAP = {
  'Water Leakage': 'Municipal Water & Sewer Authority',
  'Road Damage': 'Department of Transportation & Public Works',
  'Streetlight': 'Bureau of Street Lighting & Electrical Utilities',
  'Pollution': 'Environmental Protection & Hazardous Materials Division',
  'Public Safety': 'Traffic Engineering & Public Safety Bureau',
  'Waste Management': 'Department of Sanitation & Waste Recovery',
  'Accessibility': 'Office of Disability Rights & ADA Compliance',
  'Other': 'General Municipal Community Services'
};

const CRITICAL_SAFETY_KEYWORDS = [
  'burst', 'rupture', 'flood', 'flooding', 'sinkhole', 'collapse', 'collapsed',
  'live wire', 'exposed wire', 'sparking', 'electric shock', 'gas leak', 'odor',
  'fire', 'hazard', 'collision', 'near-miss', 'crashing', 'deep pothole',
  'structural failure', 'falling debris', 'contamination', 'sewage backup'
];

const MODERATE_SAFETY_KEYWORDS = [
  'trip', 'tripping', 'fall', 'slip', 'slippery', 'darkness', 'pitch black',
  'broken glass', 'uneven pavement', 'crack', 'blocked sidewalk', 'no railing',
  'speeding', 'blind spot', 'sharp edge'
];

const HIGH_DENSITY_LOCATIONS = [
  'school', 'elementary', 'high school', 'kindergarten', 'daycare', 'hospital',
  'clinic', 'nursing home', 'senior center', 'transit', 'metro', 'bus stop',
  'train station', 'crosswalk', 'playground', 'market', 'downtown', 'arterial',
  'main st', 'boulevard', 'avenue'
];

const ENVIRONMENTAL_KEYWORDS = [
  'toxic', 'chemical', 'sewage', 'spill', 'contaminat', 'creek', 'river',
  'drainage', 'storm basin', 'runoff', 'fumes', 'sulfur', 'asbestos', 'wildlife',
  'aquifer', 'pollut'
];

const URGENCY_MODIFIERS = [
  'urgent', 'immediate', 'emergency', 'rapid', 'expanding', 'gushing',
  'spreading', 'severe', 'dangerous', 'critical', 'dire'
];

/**
 * Calculates priority score and detailed rationale
 */
export function calculatePriority({
  title = '',
  description = '',
  category = 'Other',
  locality = '',
  affectedEstimate = '',
  durationText = ''
}) {
  const combinedText = `${title} ${description} ${locality} ${affectedEstimate} ${durationText}`.toLowerCase();
  
  const factors = [];
  let safetyScore = 0;
  let populationScore = 0;
  let envScore = 0;
  let durationScore = 0;
  let urgencyScore = 0;
  const urgencyFactors = [];

  // 1. Safety Risk Evaluation (Max 30)
  const matchedCriticalSafety = CRITICAL_SAFETY_KEYWORDS.filter(k => combinedText.includes(k));
  const matchedModerateSafety = MODERATE_SAFETY_KEYWORDS.filter(k => combinedText.includes(k));

  if (matchedCriticalSafety.length >= 2) {
    safetyScore = 30;
    const items = matchedCriticalSafety.slice(0, 3).join(', ');
    factors.push({
      factor: 'Severe Physical Safety Hazard',
      points: 30,
      max: 30,
      detail: `High-threat indicators detected (${items}). Imminent injury or vehicular damage risk.`
    });
    urgencyFactors.push(`Critical safety hazard: ${items}`);
  } else if (matchedCriticalSafety.length === 1) {
    safetyScore = 24;
    factors.push({
      factor: 'Direct Safety Hazard',
      points: 24,
      max: 30,
      detail: `Elevated hazard indicator detected (${matchedCriticalSafety[0]}). Requires protective perimeter.`
    });
    urgencyFactors.push(`Safety hazard: ${matchedCriticalSafety[0]}`);
  } else if (matchedModerateSafety.length > 0) {
    safetyScore = 15;
    const items = matchedModerateSafety.slice(0, 3).join(', ');
    factors.push({
      factor: 'Moderate Pedestrian/Traffic Risk',
      points: 15,
      max: 30,
      detail: `Slip, trip, or navigation barrier detected (${items}).`
    });
  } else {
    safetyScore = 6;
    factors.push({
      factor: 'Standard Physical Risk',
      points: 6,
      max: 30,
      detail: 'No acute physical safety triggers detected. Standard priority baseline.'
    });
  }

  // 2. Community & Population Impact (Max 25)
  const matchedLocations = HIGH_DENSITY_LOCATIONS.filter(l => combinedText.includes(l));
  const hasCrowdNumber = /\b(\d{2,}|hundreds?|thousands?|crowd|heavy traffic)\b/i.test(combinedText);

  if (matchedLocations.some(l => ['school', 'elementary', 'kindergarten', 'hospital', 'clinic'].includes(l))) {
    populationScore = 25;
    factors.push({
      factor: 'Sensitive Vulnerable Population Zone',
      points: 25,
      max: 25,
      detail: 'Located in direct proximity to a school, medical facility, or childcare route.'
    });
    urgencyFactors.push('Vulnerable population / School or Clinic zone');
  } else if (matchedLocations.length > 0 || hasCrowdNumber) {
    populationScore = 19;
    factors.push({
      factor: 'High-Density Public Corridor',
      points: 19,
      max: 25,
      detail: 'Affects primary transit routes, arterial streets, or central public spaces.'
    });
  } else {
    populationScore = 10;
    factors.push({
      factor: 'Local Neighborhood Setting',
      points: 10,
      max: 25,
      detail: 'Primarily impacts immediate adjacent residents or low-traffic secondary streets.'
    });
  }

  // 3. Environmental Impact (Max 20)
  const matchedEnv = ENVIRONMENTAL_KEYWORDS.filter(k => combinedText.includes(k));
  if (category === 'Pollution' || matchedEnv.length >= 2) {
    envScore = 20;
    factors.push({
      factor: 'High Ecological / Toxic Risk',
      points: 20,
      max: 20,
      detail: 'Potential soil, groundwater, atmospheric, or storm runoff contamination.'
    });
    urgencyFactors.push('Imminent environmental contamination threat');
  } else if (category === 'Water Leakage' || matchedEnv.length === 1) {
    envScore = 14;
    factors.push({
      factor: 'Resource Loss / Urban Runoff',
      points: 14,
      max: 20,
      detail: 'Treated water loss, storm drainage saturation, or local ecosystem disruption.'
    });
  } else if (category === 'Waste Management') {
    envScore = 9;
    factors.push({
      factor: 'Sanitary / Aesthetic Impact',
      points: 9,
      max: 20,
      detail: 'Uncollected refuse, pest vector attraction, and windborne litter.'
    });
  } else {
    envScore = 4;
    factors.push({
      factor: 'Negligible Environmental Threat',
      points: 4,
      max: 20,
      detail: 'Minimal direct ecological or runoff implications.'
    });
  }

  // 4. Duration & Persistence (Max 15)
  if (/(days?|nights?|weeks?|recurring|persistent|chronic|prolonged)\b/i.test(combinedText)) {
    durationScore = 14;
    factors.push({
      factor: 'Prolonged / Unresolved Duration',
      points: 14,
      max: 15,
      detail: 'Issue has persisted over multiple days or is recurrent, indicating systemic backlog.'
    });
    urgencyFactors.push('Ongoing multi-day issue without resolution');
  } else if (/(rapid|spreading|expanding|gushing|accelerating)\b/i.test(combinedText)) {
    durationScore = 15;
    factors.push({
      factor: 'Rapidly Escalating Condition',
      points: 15,
      max: 15,
      detail: 'Report indicates condition is worsening rapidly with every passing hour.'
    });
    urgencyFactors.push('Rapid escalation in progress');
  } else {
    durationScore = 8;
    factors.push({
      factor: 'Standard Inception Period',
      points: 8,
      max: 15,
      detail: 'Recently initiated event within regular intake window.'
    });
  }

  // 5. Urgency Indicators (Max 10)
  const matchedUrgent = URGENCY_MODIFIERS.filter(k => combinedText.includes(k));
  if (matchedUrgent.length >= 2) {
    urgencyScore = 10;
    factors.push({
      factor: 'Multiple Direct Urgency Triggers',
      points: 10,
      max: 10,
      detail: `Report text contains explicit urgency terminology (${matchedUrgent.slice(0, 2).join(', ')}).`
    });
  } else if (matchedUrgent.length === 1) {
    urgencyScore = 6;
    factors.push({
      factor: 'Elevated Urgency Terminology',
      points: 6,
      max: 10,
      detail: `Contains urgency indicator: "${matchedUrgent[0]}".`
    });
  } else {
    urgencyScore = 3;
    factors.push({
      factor: 'Standard Descriptive Tone',
      points: 3,
      max: 10,
      detail: 'Report is factual and descriptive without emergency trigger words.'
    });
  }

  // Calculate composite score (capped 0 - 100)
  const totalScore = Math.min(100, Math.max(5, safetyScore + populationScore + envScore + durationScore + urgencyScore));

  // Map to discrete priority tier
  let priority = 'Medium';
  if (totalScore >= 80) {
    priority = 'Critical';
  } else if (totalScore >= 60) {
    priority = 'High';
  } else if (totalScore >= 35) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  const department = DEPARTMENT_MAP[category] || 'General Municipal Services';

  // Specific safety and environmental statements
  let safetyConcerns = 'No critical safety risk flagged; routine site verification recommended.';
  if (safetyScore >= 24) {
    safetyConcerns = 'Significant physical safety hazard present; site perimeter and containment required.';
  } else if (safetyScore >= 15) {
    safetyConcerns = 'Pedestrian or driver slip/trip hazard present during low light or peak hours.';
  }

  let environmentalConcerns = 'No hazardous environmental discharge observed.';
  if (envScore >= 18) {
    environmentalConcerns = 'Active hazardous or chemical runoff potential; urgent containment needed.';
  } else if (envScore >= 12) {
    environmentalConcerns = 'Treated water wastage or storm drain overload potential.';
  }

  const recommendedAction = generateRecommendedAction(category, priority, matchedLocations);

  return {
    priority,
    priorityScore: totalScore,
    department,
    recommendedAction,
    explanation: `Calculated priority score of ${totalScore}/100 based on ${priority.toLowerCase()} safety weighting (${safetyScore}/30), population exposure (${populationScore}/25), and environmental sensitivity (${envScore}/20).`,
    safetyConcerns,
    environmentalConcerns,
    urgencyFactors: urgencyFactors.length > 0 ? urgencyFactors : ['Routine municipal intake'],
    factorBreakdown: factors,
    disclaimer: 'Human Review Mandatory: Algorithmic prioritization is an advisory tool for municipal routing. It does not contact 911 or dispatch emergency first responders.'
  };
}

function generateRecommendedAction(category, priority, locations) {
  const isSchoolOrHealth = locations.some(l => ['school', 'hospital', 'clinic'].includes(l));
  
  if (category === 'Water Leakage') {
    return priority === 'Critical'
      ? 'Deploy water utility emergency valve truck to isolate feeder line; notify downstream consumers and clear roadway.'
      : 'Issue priority maintenance ticket for acoustic leak detection and pipe collar installation.';
  }
  if (category === 'Road Damage') {
    return isSchoolOrHealth || priority === 'Critical' || priority === 'High'
      ? 'Cordon off hazard with reflective barrels within 2 hours; execute emergency cold-patch asphalt repair before evening transit.'
      : 'Schedule resurfacing crew in the next weekly road restoration batch.';
  }
  if (category === 'Streetlight') {
    return priority === 'High' || priority === 'Critical'
      ? 'Dispatch night electrical crew to test neighborhood branch circuit panel and replace blown ballast/LED drivers.'
      : 'Add fixture to scheduled luminaire replacement route.';
  }
  if (category === 'Pollution') {
    return 'Mobilize Environmental Health inspector with spill containment kit; notify regional water catchment authority.';
  }
  if (category === 'Public Safety') {
    return 'Request immediate on-site inspection by Traffic Safety supervisor; deploy temporary traffic management protocols.';
  }
  if (category === 'Accessibility') {
    return 'Provide temporary ADA accessible ramp/bypass mat; dispatch masonry contractor for permanent regrading.';
  }
  if (category === 'Waste Management') {
    return 'Route supplemental refuse truck to empty jammed receptacles and perform street sweeping sweep.';
  }
  return 'Log issue in municipal 311 queue and dispatch area zone inspector within 48 business hours.';
}
