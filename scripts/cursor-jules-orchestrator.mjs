#!/usr/bin/env node
/**
 * Cursor-Jules Orchestrator
 * 
 * This script is designed to be run by Cursor Cloud Agents to:
 * 1. Monitor Jules sessions for completion
 * 2. Review PRs created by Jules
 * 3. Handle AI feedback integration
 * 4. Merge PRs when ready
 * 
 * Environment variables required:
 * - JULES_API_KEY: Google Jules API key
 * - CURSOR_GITHUB_TOKEN: GitHub token for API access
 */

const JULES_API_KEY = process.env.JULES_API_KEY;
const GITHUB_TOKEN = process.env.CURSOR_GITHUB_TOKEN || process.env.GITHUB_TOKEN;

if (!JULES_API_KEY) {
  console.error('JULES_API_KEY not set');
  process.exit(1);
}

if (!GITHUB_TOKEN) {
  console.error('CURSOR_GITHUB_TOKEN not set');
  process.exit(1);
}

const JULES_BASE = 'https://jules.googleapis.com/v1alpha';

async function getSession(sessionId) {
  const res = await fetch(`${JULES_BASE}/sessions/${sessionId}`, {
    headers: { 'X-Goog-Api-Key': JULES_API_KEY }
  });
  return res.json();
}

async function listSessions() {
  const res = await fetch(`${JULES_BASE}/sessions`, {
    headers: { 'X-Goog-Api-Key': JULES_API_KEY }
  });
  return res.json();
}

async function ghApi(endpoint, options = {}) {
  const res = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github+json',
      ...options.headers
    }
  });
  return res.json();
}

async function checkPRStatus(owner, repo, prNumber) {
  const pr = await ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  const checks = await ghApi(`/repos/${owner}/${repo}/commits/${pr.head.sha}/check-runs`);
  return {
    pr,
    checks: checks.check_runs,
    allPassing: checks.check_runs.every(c => c.conclusion === 'success' || c.status !== 'completed'),
    mergeable: pr.mergeable && pr.mergeable_state === 'clean'
  };
}

async function mergePR(owner, repo, prNumber) {
  return ghApi(`/repos/${owner}/${repo}/pulls/${prNumber}/merge`, {
    method: 'PUT',
    body: JSON.stringify({ merge_method: 'squash' })
  });
}

// Main orchestration loop
async function orchestrate() {
  console.log('🤖 Cursor-Jules Orchestrator starting...');
  
  // Get all active sessions
  const sessions = await listSessions();
  console.log(`Found ${sessions.sessions?.length || 0} sessions`);
  
  for (const session of sessions.sessions || []) {
    const details = await getSession(session.name.split('/')[1]);
    console.log(`Session ${session.name}: ${details.state}`);
    
    if (details.state === 'COMPLETED' && details.pullRequest) {
      console.log(`  PR created: ${details.pullRequest}`);
      // Extract owner/repo/number from PR URL
      const match = details.pullRequest.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
      if (match) {
        const [, owner, repo, prNum] = match;
        const status = await checkPRStatus(owner, repo, prNum);
        console.log(`  CI Status: ${status.allPassing ? '✅' : '❌'}`);
        console.log(`  Mergeable: ${status.mergeable ? '✅' : '❌'}`);
        
        if (status.allPassing && status.mergeable) {
          console.log(`  🔀 Auto-merging...`);
          await mergePR(owner, repo, prNum);
        }
      }
    }
  }
}

// Run
orchestrate().catch(console.error);
