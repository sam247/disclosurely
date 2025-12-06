#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Find all markdown files in docs/docs directory
const files = execSync('find docs/docs -name "*.md" -type f', {
  cwd: resolve(__dirname, '..'),
  encoding: 'utf8'
}).trim().split('\n').filter(Boolean);

let totalReplacements = 0;
let filesModified = 0;

files.forEach(file => {
  const filePath = resolve(__dirname, '..', file);
  let content = readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Remove /docs/ prefix from all internal markdown links
  // Matches [text](/docs/path) and converts to [text](/path)
  content = content.replace(/\]\(\/docs\//g, '](/');
  
  if (content !== originalContent) {
    writeFileSync(filePath, content, 'utf8');
    const replacements = (originalContent.match(/\]\(\/docs\//g) || []).length;
    totalReplacements += replacements;
    filesModified++;
    console.log(`${file}: ${replacements} replacements`);
  }
});

console.log(`\nTotal: ${totalReplacements} replacements in ${filesModified} files`);

