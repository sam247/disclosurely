#!/usr/bin/env node
import { execSync } from 'child_process';

const repoPath = '/Users/sampettiford/Documents/Cursor/React Apps/disclosurely';

try {
  console.log('Current HEAD:');
  const head = execSync('git rev-parse HEAD', { cwd: repoPath, encoding: 'utf8' }).trim();
  console.log(head);
  
  console.log('\nStaging changes...');
  execSync('git add -A', { cwd: repoPath, stdio: 'inherit' });
  
  console.log('\nCommitting...');
  try {
    execSync('git commit -m "Trigger deployment: Restored to working state (commit 34b19bd)"', { cwd: repoPath, stdio: 'inherit' });
  } catch (e) {
    console.log('Nothing to commit or commit failed');
  }
  
  console.log('\nForce pushing to origin main (reset requires force push)...');
  const pushOutput = execSync('git push origin main --force', { cwd: repoPath, encoding: 'utf8', stdio: 'pipe' });
  console.log(pushOutput);
  
  console.log('\nPush complete!');
  console.log('\nLatest commit:');
  const latest = execSync('git log --oneline -1', { cwd: repoPath, encoding: 'utf8' }).trim();
  console.log(latest);
} catch (error) {
  console.error('Error:', error.message);
  if (error.stdout) console.log('stdout:', error.stdout);
  if (error.stderr) console.error('stderr:', error.stderr);
  process.exit(1);
}

