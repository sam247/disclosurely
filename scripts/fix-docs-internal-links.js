import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllMarkdownFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllMarkdownFiles(filePath, fileList);
    } else if (file.endsWith('.md')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixInternalLinks() {
  const docsDir = path.join(__dirname, '../docs/docs');
  const files = getAllMarkdownFiles(docsDir);
  
  let totalReplacements = 0;
  let filesModified = 0;
  
  // Patterns to match internal links that need /docs/ prefix
  // Match: [text](/path) or [text](/path#anchor) but not external URLs
  const linkPattern = /\[([^\]]+)\]\((\/[^\)]+)\)/g;
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Replace internal absolute links (starting with /) to include /docs/ prefix
    // But skip if already has /docs/ or is an external URL
    content = content.replace(linkPattern, (match, text, url) => {
      // Skip if already has /docs/ prefix
      if (url.startsWith('/docs/')) {
        return match;
      }
      // Skip external URLs (http://, https://, mailto:, etc.)
      if (url.match(/^(https?:\/\/|mailto:|#)/)) {
        return match;
      }
      // Skip if it's just an anchor link
      if (url.startsWith('#')) {
        return match;
      }
      // Add /docs/ prefix to internal absolute paths
      return `[${text}](/docs${url})`;
    });
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      const matches = originalContent.match(linkPattern) || [];
      const count = matches.filter(m => {
        const urlMatch = m.match(/\((\/[^\)]+)\)/);
        if (!urlMatch) return false;
        const url = urlMatch[1];
        return !url.startsWith('/docs/') && !url.match(/^(https?:\/\/|mailto:|#)/);
      }).length;
      totalReplacements += count;
      filesModified++;
      const relativePath = path.relative(docsDir, filePath);
      console.log(`✓ Fixed ${relativePath} (${count} replacements)`);
    }
  });
  
  console.log(`\n✅ Total files modified: ${filesModified}`);
  console.log(`✅ Total link replacements: ${totalReplacements}`);
}

fixInternalLinks();

