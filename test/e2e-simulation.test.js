import { describe, it } from 'node:test';
import assert from 'node:assert';

import { storageService } from '../src/services/storage.js';
import { analyzeCivicIssue } from '../src/services/aiService.js';
import { checkDuplicate } from '../src/services/duplicateDetector.js';

describe('CommunityPulse AI - Complete End-to-End Simulation', () => {
  // 1. Initial State Verification
  it('1. should initialize dashboard with correct metrics', () => {
    storageService.resetToSampleData();
    const reports = storageService.getReports();

    assert.strictEqual(reports.length, 7, 'Expected 7 default sample reports');
    
    const open = reports.filter(r => r.status !== 'Resolved');
    assert.strictEqual(open.length, 5, 'Expected 5 active unresolved reports');

    const resolved = reports.filter(r => r.status === 'Resolved');
    assert.strictEqual(resolved.length, 2, 'Expected 2 resolved reports');

    const critical = reports.filter(r => r.priority === 'Critical');
    assert.ok(critical.length >= 2, 'Expected at least 2 critical reports');
  });

  // 2. Report Form & AI Analysis Flow
  let createdReportId = null;
  it('2. should analyze and submit a new report, updating statistics', async () => {
    const candidateData = {
      title: 'Broken water hydrant flooding Oakwood Ave sidewalk',
      description: 'Subterranean blowout is gushing high volumes of water into pedestrian path and street lane.',
      locality: 'Oakwood Ave & 3rd St',
      category: 'Water Leakage',
      affectedEstimate: '400+ residents'
    };

    // Run AI analysis
    const aiAnalysis = await analyzeCivicIssue(candidateData);
    assert.ok(aiAnalysis);
    assert.strictEqual(aiAnalysis.predictedCategory, 'Water Leakage');
    assert.strictEqual(aiAnalysis.priority, 'Critical');
    assert.ok(aiAnalysis.priorityScore >= 80);
    assert.strictEqual(aiAnalysis.department, 'Municipal Water & Sewer Authority');
    assert.ok(aiAnalysis.recommendedAction.length > 10);
    assert.ok(aiAnalysis.safetyConcerns.length > 5);

    // Save report to storage
    const newReport = storageService.saveReport({
      ...candidateData,
      priority: aiAnalysis.priority,
      priorityScore: aiAnalysis.priorityScore,
      status: 'Reported',
      reportedBy: 'Citizen Alex',
      aiAnalysis,
      resolutionNotes: []
    });

    assert.ok(newReport.id);
    createdReportId = newReport.id;

    // Verify statistics updated
    const updatedList = storageService.getReports();
    assert.strictEqual(updatedList.length, 8, 'Total reports should now be 8');
    
    const openList = updatedList.filter(r => r.status !== 'Resolved');
    assert.strictEqual(openList.length, 6, 'Open reports should now be 6');
  });

  // 3. Duplicate Detection Flow
  it('3. should detect potential duplicate when similar report is entered', () => {
    const allReports = storageService.getReports();
    
    const duplicateCandidate = {
      title: 'Water hydrant burst on Oakwood',
      description: 'Gushing water flooding the street and sidewalk from water leak Oakwood Ave',
      locality: 'Oakwood Ave & 3rd St',
      category: 'Water Leakage'
    };

    const dupCheck = checkDuplicate(duplicateCandidate, allReports, 45);
    assert.strictEqual(dupCheck.isDuplicate, true, 'Should detect duplicate');
    assert.ok(dupCheck.matchScore >= 45, `Expected score >= 45, got ${dupCheck.matchScore}`);
    assert.strictEqual(dupCheck.matchingReport.id, createdReportId);
    assert.ok(dupCheck.reasons.length >= 2, 'Should provide multiple explanatory reasons');
  });

  // 4. Status Update and Resolution Note Flow
  it('4. should update status workflow and handle public and internal notes', () => {
    // Legacy 'Under Review' maps to 'Pending'
    let updated = storageService.updateReport(createdReportId, { status: 'Under Review' });
    assert.strictEqual(updated.status, 'Pending', 'Legacy status should map to Pending');

    // Transition to In Progress
    updated = storageService.updateReport(createdReportId, { status: 'In Progress' });
    assert.strictEqual(updated.status, 'In Progress');

    // Add staff internal note
    const withNote = storageService.addInternalNote(
      createdReportId,
      'Main intake valve isolated at 11:45 AM. Pressure stabilized.',
      'Crew Lead Higgins'
    );
    assert.strictEqual(withNote.internalNotes.length, 1);
    assert.strictEqual(withNote.internalNotes[0].author, 'Crew Lead Higgins');

    // Set citizen public note
    const withPublic = storageService.updateReportPublicNote(
      createdReportId,
      'Water crew on site. Pipe isolated and repair underway.'
    );
    assert.strictEqual(withPublic.publicNote, 'Water crew on site. Pipe isolated and repair underway.');

    // Transition to Resolved
    const resolved = storageService.updateReport(createdReportId, { status: 'Resolved' });
    assert.strictEqual(resolved.status, 'Resolved');

    // Verify resolution count increased
    const allReports = storageService.getReports();
    const resolvedCount = allReports.filter(r => r.status === 'Resolved').length;
    assert.strictEqual(resolvedCount, 3, 'Resolved count should now be 3');
  });

  // 5. Filter, Search, and Sort Flow
  it('5. should correctly filter, search, and sort reports', () => {
    const allReports = storageService.getReports();

    // Filter by Category
    const waterReports = allReports.filter(r => r.category === 'Water Leakage');
    assert.ok(waterReports.length >= 2);
    assert.ok(waterReports.every(r => r.category === 'Water Leakage'));

    // Filter by Priority
    const criticalReports = allReports.filter(r => r.priority === 'Critical');
    assert.ok(criticalReports.length >= 3);
    assert.ok(criticalReports.every(r => r.priority === 'Critical'));

    // Search by locality keyword
    const oakwoodSearch = allReports.filter(r => 
      r.title.toLowerCase().includes('oakwood') || 
      r.locality.toLowerCase().includes('oakwood')
    );
    assert.strictEqual(oakwoodSearch.length, 1);
    assert.strictEqual(oakwoodSearch[0].id, createdReportId);

    // Sort by priority descending
    const sortedDesc = [...allReports].sort((a, b) => (b.priorityScore || 0) - (a.priorityScore || 0));
    for (let i = 0; i < sortedDesc.length - 1; i++) {
      assert.ok(sortedDesc[i].priorityScore >= sortedDesc[i + 1].priorityScore);
    }
  });

  // 6. Data Persistence & Diagnostics Flow
  it('6. should export, wipe, import, and reset dataset correctly', () => {
    // Export JSON
    const exportedJson = storageService.exportDataJSON();
    assert.ok(typeof exportedJson === 'string');
    assert.ok(exportedJson.length > 500);

    // Wipe storage
    const cleared = storageService.clearAllReports();
    assert.strictEqual(cleared.length, 0);
    assert.strictEqual(storageService.getReports().length, 0);

    // Import JSON back
    const restored = storageService.importDataJSON(exportedJson);
    assert.strictEqual(restored.length, 8);

    // Reset to initial sample baseline
    const sampleReset = storageService.resetToSampleData();
    assert.strictEqual(sampleReset.length, 7);
  });
});
