import { describe, it } from 'node:test';
import assert from 'node:assert';

import { calculatePriority } from '../src/services/priorityEngine.js';
import { checkDuplicate } from '../src/services/duplicateDetector.js';
import { analyzeCivicIssue } from '../src/services/aiService.js';
import { storageService } from '../src/services/storage.js';

describe('CommunityPulse AI - Prioritization Engine Tests', () => {
  it('should prioritize active flooding water main as Critical (>80 points)', () => {
    const result = calculatePriority({
      title: 'Burst Water Pipe Flooding Street',
      description: 'Major underground pipe burst. Water gushing across both lanes, severe flooding and road collapse hazard.',
      category: 'Water Leakage',
      locality: 'Downtown Commercial Corridor',
      affectedEstimate: '500+ commuters'
    });

    assert.strictEqual(result.priority, 'Critical');
    assert.ok(result.priorityScore >= 80, `Expected score >= 80, got ${result.priorityScore}`);
    assert.strictEqual(result.department, 'Municipal Water & Sewer Authority');
    assert.ok(result.safetyConcerns.length > 0);
    assert.ok(result.factorBreakdown.length >= 5);
    assert.ok(result.disclaimer.includes('Human Review Mandatory'));
  });

  it('should prioritize school crosswalk pothole as High or Critical', () => {
    const result = calculatePriority({
      title: 'Deep Pothole at Elementary School Crosswalk',
      description: 'Deep 10 inch hole directly in children pedestrian crosswalk. Severe trip hazard and tire damage.',
      category: 'Road Damage',
      locality: 'Lincoln Elementary School Zone',
      affectedEstimate: '300 students'
    });

    assert.ok(['High', 'Critical'].includes(result.priority));
    assert.ok(result.priorityScore >= 60);
    assert.strictEqual(result.department, 'Department of Transportation & Public Works');
  });

  it('should score routine park garbage overflow as Low (<35 points)', () => {
    const result = calculatePriority({
      title: 'Overflowing Trash Cans at Park',
      description: 'The park litter bins are full of paper cups and boxes after the weekend picnic.',
      category: 'Waste Management',
      locality: 'Oak Trail Recreation Park'
    });

    assert.ok(['Low', 'Medium'].includes(result.priority));
    assert.ok(result.priorityScore <= 55);
    assert.strictEqual(result.department, 'Department of Sanitation & Waste Recovery');
  });
});

describe('CommunityPulse AI - Duplicate Detection Engine Tests', () => {
  it('should flag potential duplicate when text, locality, and category overlap', () => {
    const existing = [
      {
        id: 'CP-101',
        title: 'Burst Water Main Flooding Commercial Corridor',
        description: 'Underground water pipe ruptured near Market Square gushing water onto traffic lanes.',
        locality: 'Market Square & 4th Ave',
        category: 'Water Leakage',
        createdAt: new Date().toISOString()
      }
    ];

    const candidate = {
      title: 'Water pipe burst gushing water',
      description: 'Broken water pipe flooding the street near Market Square 4th Ave.',
      locality: 'Market Square 4th Avenue',
      category: 'Water Leakage'
    };

    const dupCheck = checkDuplicate(candidate, existing, 45);

    assert.strictEqual(dupCheck.isDuplicate, true);
    assert.ok(dupCheck.matchScore >= 45, `Expected score >= 45, got ${dupCheck.matchScore}`);
    assert.strictEqual(dupCheck.matchingReport.id, 'CP-101');
    assert.ok(dupCheck.reasons.length > 0);
  });

  it('should not flag unrelated issues in different locations', () => {
    const existing = [
      {
        id: 'CP-101',
        title: 'Burst Water Main Flooding Commercial Corridor',
        description: 'Underground water pipe ruptured near Market Square.',
        locality: 'Market Square & 4th Ave',
        category: 'Water Leakage',
        createdAt: new Date().toISOString()
      }
    ];

    const candidate = {
      title: 'Dark streetlight walkway',
      description: 'Lamps are completely unlit at night along North Hill walkway.',
      locality: 'North Hill Greenway',
      category: 'Streetlight'
    };

    const dupCheck = checkDuplicate(candidate, existing, 45);

    assert.strictEqual(dupCheck.isDuplicate, false);
    assert.strictEqual(dupCheck.matchingReport, null);
  });
});

describe('CommunityPulse AI - Local AI Decision Support Tests', () => {
  it('should return complete structured JSON without API key', async () => {
    const analysis = await analyzeCivicIssue({
      title: 'Flickering Streetlight in Dark Alley',
      description: 'Light pole bulb is flickering and turning off, leaving pedestrian pathway in darkness.',
      locality: 'North Hill Alley',
      category: 'Streetlight'
    });

    assert.ok(analysis.predictedCategory);
    assert.ok(['Critical', 'High', 'Medium', 'Low'].includes(analysis.priority));
    assert.ok(typeof analysis.priorityScore === 'number');
    assert.ok(analysis.department.length > 0);
    assert.ok(analysis.recommendedAction.length > 0);
    assert.ok(analysis.explanation.length > 0);
    assert.ok(analysis.safetyConcerns.length > 0);
    assert.ok(analysis.environmentalConcerns.length > 0);
    assert.strictEqual(analysis.isRealAi, false);
    assert.ok(analysis.source.includes('Rules Engine') || analysis.source.includes('Local'));
  });
});

describe('CommunityPulse AI - Storage Service & CRUD Tests', () => {
  it('should seed default sample reports if empty', () => {
    const reports = storageService.getReports();
    assert.ok(Array.isArray(reports));
    assert.ok(reports.length >= 7);
  });

  it('should save a new report and retrieve it', () => {
    const saved = storageService.saveReport({
      id: 'CP-999',
      title: 'Chemical drums dumped near creek',
      description: 'Unlabeled drums leaking into storm water basin.',
      locality: 'Creekside Basin',
      category: 'Pollution',
      priority: 'Critical',
      priorityScore: 90
    });

    assert.strictEqual(saved.id, 'CP-999');
    const retrieved = storageService.getReportById('CP-999');
    assert.ok(retrieved);
    assert.strictEqual(retrieved.title, 'Chemical drums dumped near creek');
  });

  it('should transition status and append resolution note', () => {
    const updated = storageService.updateReport('CP-999', { status: 'In Progress' });
    assert.strictEqual(updated.status, 'In Progress');

    const withNote = storageService.addResolutionNote('CP-999', 'Inspection team dispatched on-site.', 'Inspector Miller');
    assert.ok(withNote.resolutionNotes.length >= 1);
    assert.strictEqual(withNote.resolutionNotes[0].author, 'Inspector Miller');
  });

  it('should delete report and confirm removal', () => {
    const deleted = storageService.deleteReport('CP-999');
    assert.strictEqual(deleted, true);

    const check = storageService.getReportById('CP-999');
    assert.strictEqual(check, null);
  });

  it('should reset back to standard sample dataset', () => {
    const resetList = storageService.resetToSampleData();
    assert.ok(resetList.length >= 7);
  });
});
